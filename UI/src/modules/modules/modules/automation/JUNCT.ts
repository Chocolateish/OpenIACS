import { AutomationOutputSignal } from "@components/automationOutputSignal";
import { ModuleSelectorOpener } from "@components/moduleSelector";
import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { defineElement } from "@libBase";
import {
  attachClickListener,
  circle,
  defineElementValues,
  rectangle,
} from "@libCommon";
import { ToggleSwitch, Way } from "@libComponents";
import { InstrumentBase, type InstrumentBaseOptions } from "@libInstr";
import { promptButtons, PromptCodes } from "@libPrompts";
import { ModuleValueAccessEnum } from "@modCommon";
import { Module, registerModule } from "@module/module";
import { ModuleFilter } from "@module/moduleFilter";
import { InstrumentAPI } from "@module/moduleInstrument";
import "./JUNCT.scss";

export class JUNCT extends Module {
  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return (_values: any[]) => {
      return "Junction Controller (Switch/Valve/eg.)";
    };
  }

  /**Returns whether the module has settings*/
  get hasSettings() {
    return true;
  }

  /**Generates an instance of the modules setting content */
  async generateSettingsContent(
    options: ModuleSettingsOptions
  ): Promise<ModuleSettings> {
    //@ts-expect-error
    return new Editor().options(options);
  }
}
registerModule("JUNCT", JUNCT);

let filter = new ModuleFilter({
  feature: { value: ModuleValueAccessEnum.INPUT },
});

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "junct";
  }

  private __open: AutomationOutputSignal;
  private __close: AutomationOutputSignal;
  private __isOpen: ModuleSelectorOpener;
  private __isClosed: ModuleSelectorOpener;

  constructor() {
    super();
    this.__open = this.group.addComponent(
      new AutomationOutputSignal().options({
        manager: this.__module!.manager,
        id: "open",
        text: "Open Valve Signal",
      })
    );
    this.__close = this.group.addComponent(
      new AutomationOutputSignal().options({
        manager: this.__module!.manager,
        id: "close",
        text: "Close Valve Signal",
      })
    );
    this.__isOpen = this.group.addComponent(
      new ModuleSelectorOpener().options({
        id: "isOpen",
        text: "Is Open Feedback Signal",
        uidMode: true,
        filter: filter,
      })
    );
    this.__isClosed = this.group.addComponent(
      new ModuleSelectorOpener().options({
        id: "isClosed",
        text: "Is Closed Feedback Signal",
        uidMode: true,
        filter: filter,
      })
    );

    this.group.addComponent(
      new ToggleSwitch().options({
        id: "keepState",
        text: "Keep state, after reboot",
        way: Way.LEFT,
      })
    );
  }

  /**Sets the module for the setting */
  set module(module: Module) {
    super.module = module;
    this.__open.manager = this.__module!.manager;
    this.__close.manager = this.__module!.manager;
    this.__isOpen.manager = this.__module!.manager;
    this.__isClosed.manager = this.__module!.manager;
  }

  /**Must be set true to show save button */
  get canSave() {
    return true;
  }

  defaultName() {
    return "Junction Editor";
  }
}
defineElement(Editor);

//###################################################################
//#    _____           _                                   _      ###
//#   |_   _|         | |                                 | |     ###
//#     | |  _ __  ___| |_ _ __ _   _ _ __ ___   ___ _ __ | |_    ###
//#     | | | '_ \/ __| __| '__| | | | '_ ` _ \ / _ \ '_ \| __|   ###
//#    _| |_| | | \__ \ |_| |  | |_| | | | | | |  __/ | | | |_    ###
//#   |_____|_| |_|___/\__|_|   \__,_|_| |_| |_|\___|_| |_|\__|   ###
//###################################################################

let round = circle(16, 16, 16, "border");
let box = rectangle(16, 16, 32, 32, 5, "border");
let valveSymbol = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
valveSymbol.classList.add("symbol");
valveSymbol.setAttribute("d", "M 22,7 H 10 l 5,9 -5,9 h 12 l -5,-9 z");
let damperSymbol = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
damperSymbol.classList.add("symbol");
damperSymbol.setAttribute(
  "d",
  "m 14.699076,12.300206 c -1.483006,0.524181 -2.600043,2.037597 -2.600043,3.700063 0,1.662463 1.117037,3.17588 2.600043,3.700061 v 9.000151 c 0,0.70292 0.5969,1.300021 1.299839,1.300021 0.702939,0 1.300205,-0.597101 1.300205,-1.300021 V 19.70033 c 1.483006,-0.524181 2.600043,-2.037598 2.600043,-3.700061 0,-1.662466 -1.117037,-3.175882 -2.600043,-3.700063 V 3.3000546 c 0,-0.702939 -0.597082,-1.300021 -1.300021,-1.300021 -0.702939,0 -1.300023,0.597082 -1.300023,1.300021 0.04735,2.978797 0.009,5.9722861 0,9.0001514 z"
);

/**Defines options for junction instrument
 * @enum {Number} JunctionType*/
export let JunctionType = { Valve: 0, Damper: 1 };

/**Defines options for junction instrument*/
type InstrJunctionOptions = {
  /**the type of junction*/
  type: number;
  /**the module to communicate with*/
  module: JUNCT;
  /**the title of the button control window*/
  title: string;
} & InstrumentBaseOptions;

export class InstrJunction extends InstrumentBase {
  /**Returns the name used to define the element */
  static elementName() {
    return "instrument-junction";
  }
  static elementNameSpace() {
    return "lmui";
  }

  private __symbol?: SVGPathElement;
  private __border?: SVGCircleElement | SVGRectElement;
  private __isopen: boolean = false;
  private __title: string = "Junction";
  private ___invalid: boolean = true;
  private $Vbinstrument?: InstrumentAPI;

  constructor() {
    super();
    attachClickListener(this.__svg, async (_ev: PointerEvent) => {
      if (!this.__isopen) {
        this.__isopen = true;
        let promt = promptButtons({
          title: this.__title || "",
          buttons: [
            { text: "Close", value: 0 },
            { text: "Open", value: 1 },
          ],
        });
        let result = await promt.promise;
        if (result.code == PromptCodes.ENTER)
          if (this.$Vbinstrument)
            this.$Vbinstrument.command("order", { order: result.data });
        this.__isopen = false;
      }
    });
    this.classList.add("invalid");
    this.___invalid = true;
  }

  /**Options toggeler*/
  options(options: InstrJunctionOptions): this {
    super.options(options);
    if (typeof options.type !== "undefined") this.type = options.type;
    else this.type = JunctionType.Valve;
    if (typeof options.module !== "undefined") this.module = options.module;
    if (typeof options.title === "string") this.__title = options.title;
    return this;
  }

  /**Original width of rendered graphics*/
  get renderWidth() {
    return 32;
  }
  /**Original height of rendered graphics*/
  get renderHeight() {
    return 32;
  }

  /**Sets the module the*/
  set module(mod: JUNCT) {
    this.instrument = mod.instrument;
  }

  /**Gets the module the */
  get module(): JUNCT {
    //@ts-expect-error
    return this.instrument.__module;
  }

  set instrument(_mod: InstrumentAPI) {}
  get instrument(): InstrumentAPI {
    return undefined as any;
  }

  /**Sets the junction type */
  set type(type: number) {
    if (this.__symbol) this.__svg.removeChild(this.__symbol);
    if (this.__border) this.__svg.removeChild(this.__border);
    switch (type) {
      case JunctionType.Valve:
        this.__svg.appendChild(
          (this.__symbol = valveSymbol.cloneNode(true) as SVGPathElement)
        );
        this.__svg.appendChild(
          (this.__border = round.cloneNode(true) as SVGCircleElement)
        );
        break;
      case JunctionType.Damper:
        this.__svg.appendChild(
          (this.__symbol = damperSymbol.cloneNode(true) as SVGPathElement)
        );
        this.__svg.appendChild(
          (this.__border = box.cloneNode(true) as SVGRectElement)
        );
        break;
    }
  }

  protected $vfinstrument(value: null | { status: string }) {
    if (value === null) {
      this.__svg.setAttribute("status", "0");
      this.classList.add("invalid");
      this.___invalid = true;
    } else {
      this.__svg.setAttribute("status", value["status"]);
      if (this.___invalid) {
        this.classList.remove("invalid");
        this.___invalid = false;
      }
    }
  }
}
defineElement(InstrJunction);
defineElementValues(InstrJunction, ["instrument"]);
