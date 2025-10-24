import { AutomationOutputSignal } from "@components/automationOutputSignal";
import { ModuleSelectorOpener } from "@components/moduleSelector";
import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { ModuleValue3PointConversion } from "@components/moduleValue3PointConversion";
import { AccessTypes, defineElement } from "@libBase";
import { attachClickListener, circle, defineElementValues } from "@libCommon";
import { Button, DropDown, Slider, TextBoxValue } from "@libComponents";
import { InstrumentBase, type InstrumentBaseOptions } from "@libInstr";
import { Err, Ok, type Result } from "@libResult";
import { Content, mainWindowManager, remToPx, UIWindow } from "@libUI";
import { ValueAsync } from "@libValues";
import { ModuleValueAccessEnum } from "@modCommon";
import { Module, registerModule } from "@module/module";
import { ModuleFilter } from "@module/moduleFilter";
import { InstrumentAPI } from "@module/moduleInstrument";
import "./DRIVE.scss";

type DRIVEPreConfig = {
  controlMode: number;
};

export class DRIVE extends Module {
  readonly controlMode: number = 0;

  preConfigTransform(
    configs: Partial<DRIVEPreConfig>
  ): Result<DRIVEPreConfig, string> {
    if (typeof configs["controlMode"] !== "number")
      return Err("Invalid or missing controlMode");
    //@ts-expect-error
    this.controlMode = configs["controlMode"];
    return Ok({
      controlMode: configs["controlMode"],
    });
  }

  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return (_val: any[]) => {
      return "Drive Controller (Pumps/Fans/Motors/eg.)";
    };
  }

  /**Returns whether the module has settings*/
  get hasSettings() {
    return true;
  }

  /**Generates an instance of the modules setting content*/
  async generateSettingsContent(
    options: ModuleSettingsOptions
  ): Promise<ModuleSettings> {
    //@ts-expect-error
    return new EDITOR().options(options);
  }
}
registerModule("DRIVE", DRIVE);

let filter = new ModuleFilter({
  feature: { value: ModuleValueAccessEnum.INPUT },
});

class EDITOR extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "drive";
  }

  __controlMode: DropDown;
  __start: AutomationOutputSignal;
  __reverse: AutomationOutputSignal;
  __stop: AutomationOutputSignal;
  __order: ModuleValue3PointConversion;
  __feedback: ModuleValue3PointConversion;
  __running: ModuleSelectorOpener;

  constructor() {
    super();
    this.group.addComponent(
      (this.__controlMode = new DropDown().options({
        id: "controlMode",
        text: "Drive Mode",
        options: [
          { text: "Digitally controlled one way Drive", value: 0 },
          { text: "Analogue controlled one way Drive", value: 2 },
          { text: "Analogue controlled two way Drive", value: 3 },
        ],
        change: () => {
          this.__update();
        },
      }))
    );
    this.group.addComponent(
      (this.__start = new AutomationOutputSignal().options({
        manager: this.__module!.manager,
        id: "start",
        text: "Start Signal",
      }))
    );
    this.group.addComponent(
      (this.__reverse = new AutomationOutputSignal().options({
        manager: this.__module!.manager,
        id: "reverse",
        text: "Reverse Signal",
      }))
    );
    this.group.addComponent(
      (this.__stop = new AutomationOutputSignal().options({
        manager: this.__module!.manager,
        id: "stop",
        text: "Stop Signal",
      }))
    );
    this.group.addComponent(
      (this.__order = new ModuleValue3PointConversion({
        manager: this.__module!.manager,
        id: "order",
        text: "Speed Order Signal",
        min: -100,
        mid: 0,
        max: 100,
        inOut: true,
        unit: "%",
        twoMode: false,
      }))
    );
    this.group.addComponent(
      (this.__feedback = new ModuleValue3PointConversion({
        manager: this.__module!.manager,
        id: "feedback",
        text: "Feedback Signal",
        min: -100,
        mid: 0,
        max: 100,
        unit: "%",
        inOut: false,
        twoMode: false,
      }))
    );

    this.group.addComponent(
      (this.__running = new ModuleSelectorOpener().options({
        id: "running",
        text: "Running Signal",
        uidMode: true,
        filter: filter,
      }))
    );
  }

  /** Updates special values from the module */
  protected __newConfigs(values: {}) {
    this.group.values = values;
    this.__update();
  }

  private __update() {
    this.__start.access = AccessTypes.NONE;
    this.__reverse.access = AccessTypes.NONE;
    this.__stop.access = AccessTypes.NONE;
    this.__order.access = AccessTypes.NONE;
    this.__feedback.access = AccessTypes.NONE;
    switch (this.__controlMode.value) {
      case 0:
        this.__start.access = AccessTypes.WRITE;
        this.__stop.access = AccessTypes.WRITE;
        break;
      case 2:
        this.__order.access = AccessTypes.WRITE;
        this.__feedback.access = AccessTypes.WRITE;
        this.__order.twoMode = true;
        this.__feedback.twoMode = true;
        break;
      case 3:
        this.__order.access = AccessTypes.WRITE;
        this.__feedback.access = AccessTypes.WRITE;
        this.__order.twoMode = false;
        this.__feedback.twoMode = false;
        break;
    }
  }

  /**Sets the module for the setting */
  set module(module: Module) {
    super.module = module;
    this.__start.manager = this.__module!.manager;
    this.__reverse.manager = this.__module!.manager;
    this.__stop.manager = this.__module!.manager;
    this.__order.manager = this.__module!.manager;
    this.__feedback.manager = this.__module!.manager;
    this.__running.manager = this.__module!.manager;
  }

  /**Must be set true to show save button */
  get canSave() {
    return true;
  }

  defaultName() {
    return "Drive Editor";
  }
}
defineElement(EDITOR);

//###################################################################
//#    _____           _                                   _      ###
//#   |_   _|         | |                                 | |     ###
//#     | |  _ __  ___| |_ _ __ _   _ _ __ ___   ___ _ __ | |_    ###
//#     | | | '_ \/ __| __| '__| | | | '_ ` _ \ / _ \ '_ \| __|   ###
//#    _| |_| | | \__ \ |_| |  | |_| | | | | | |  __/ | | | |_    ###
//#   |_____|_| |_|___/\__|_|   \__,_|_| |_| |_|\___|_| |_|\__|   ###
//###################################################################

let round = circle(16, 16, 16, "circle");
let general_symbol_Fw = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
let general_symbol_Bw = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
general_symbol_Fw.classList.add("symbolFw");
general_symbol_Bw.classList.add("symbolBw");
general_symbol_Fw.setAttribute("d", "M 12,24 V 8 l 12,8 z");
general_symbol_Bw.setAttribute("d", "M 20,8 V 24 L 8,16 Z");

let fan_symbol_Fw = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
let fan_symbol_Bw = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
fan_symbol_Fw.classList.add("symbolFw");
fan_symbol_Bw.classList.add("symbolBw");
fan_symbol_Fw.setAttribute(
  "d",
  "m15.272 3.5c-0.54592 7e-3 -1.0638 0.16094-1.5748 0.32194-0.64391 0.196-1.1686 0.57389-1.5466 1.1619-0.63691 0.994-0.55314 1.988-0.02822 2.989 0.38495 0.728 0.90987 1.3509 1.5748 1.8409 0.29396 0.21 0.17509 0.48328 0.1331 0.74228-0.04899 0.287-0.29413 0.19606-0.4691 0.19606-0.81189 7e-3 -1.6308 0.0069-2.4497 0.0069-0.50393 0-1.0077-7e-3 -1.5046 0-0.29396 0-0.41981 0.11205-0.40581 0.33605 0.041995 0.595 0.17488 1.1758 0.36385 1.7428 0.53193 1.603 2.1976 2.4011 3.7933 1.7081 0.85388-0.371 1.5678-0.9519 2.1488-1.6799 0.23097-0.287 0.35696-0.32206 0.7769-0.19606 0.29396 0.084 0.18903 0.3219 0.19603 0.5039 7e-3 1.288 0 2.5692 0 3.8572 0 0.21-2.6e-4 0.41981 0.27271 0.46881h0.02822c0.05599-7e-3 0.11183-0.02109 0.16782-0.03509 0.83288-0.119 1.6589-0.24481 2.3868-0.72781 0.97986-0.651 1.3928-1.8831 1.0988-2.9261-0.30796-1.064-0.96588-1.918-1.8128-2.611-0.21697-0.175-0.27971-0.33616-0.27271-0.60916 0.014-0.378 0.15381-0.44796 0.44777-0.44096 0.83988 7e-3 1.6796 0 2.5195 0 0.48993 0 0.97995 0.014 1.4699 0 0.30096-7e-3 0.42704-0.01399 0.41304-0.39899-0.035-0.644-0.20293-1.2527-0.44089-1.8477-0.60891-1.505-2.3098-2.1282-3.7586-1.4422-0.81889 0.385-1.5188 0.91696-2.0717 1.617-0.17498 0.224-0.34299 0.28711-0.61595 0.27311-0.37095-0.014-0.44089-0.15383-0.44089-0.44783 0.014-0.84 0.0072-1.673 0.0072-2.513 0-0.497 0.0068-0.98733-0.0072-1.4773-7e-3 -0.301-7e-3 -0.41274-0.39894-0.41274zm0.72807 5.8171c0.65091 0 1.1827 0.53187 1.1827 1.1829 0 0.651-0.5318 1.1829-1.1827 1.1829s-1.1831-0.53187-1.1831-1.1829c0-0.651 0.53216-1.1829 1.1831-1.1829zm-2.6502 10.983v8.3998l6.2995-4.2001z"
);
fan_symbol_Bw.setAttribute(
  "d",
  "m15.272 3.5c-0.54592 7e-3 -1.0638 0.16094-1.5748 0.32194-0.64391 0.196-1.1686 0.57389-1.5466 1.1619-0.63691 0.994-0.55314 1.988-0.02822 2.989 0.38495 0.728 0.90987 1.3509 1.5748 1.8409 0.29396 0.21 0.17509 0.48328 0.1331 0.74228-0.04899 0.287-0.29413 0.19606-0.4691 0.19606-0.81189 7e-3 -1.6308 0.0069-2.4497 0.0069-0.50393 0-1.0077-7e-3 -1.5046 0-0.29396 0-0.41981 0.11205-0.40581 0.33605 0.042 0.595 0.17488 1.1758 0.36385 1.7428 0.53192 1.603 2.1976 2.4011 3.7933 1.7081 0.85388-0.371 1.5678-0.9519 2.1488-1.6799 0.23097-0.287 0.35696-0.32206 0.7769-0.19606 0.29396 0.084 0.18903 0.3219 0.19603 0.5039 7e-3 1.288 0 2.5692 0 3.8572 0 0.21-2.6e-4 0.41981 0.27271 0.46881h0.02822c0.05599-7e-3 0.11183-0.02109 0.16782-0.03509 0.83288-0.119 1.6589-0.24481 2.3868-0.72781 0.97986-0.651 1.3928-1.8831 1.0988-2.9261-0.30796-1.064-0.96588-1.918-1.8128-2.611-0.21697-0.175-0.27971-0.33616-0.27271-0.60916 0.014-0.378 0.15381-0.44796 0.44777-0.44096 0.83988 7e-3 1.6796 0 2.5195 0 0.48993 0 0.97995 0.014 1.4699 0 0.30096-7e-3 0.42704-0.01399 0.41304-0.39899-0.035-0.644-0.20293-1.2527-0.44089-1.8477-0.60891-1.505-2.3098-2.1282-3.7586-1.4422-0.81889 0.385-1.5188 0.91696-2.0717 1.617-0.17498 0.224-0.34299 0.28711-0.61595 0.27311-0.37095-0.014-0.44089-0.15383-0.44089-0.44783 0.014-0.84 0.0072-1.673 0.0072-2.513 0-0.497 0.0068-0.98733-0.0072-1.4773-7e-3 -0.301-7e-3 -0.41274-0.39894-0.41274zm0.72807 5.8171c0.65091 0 1.1827 0.53187 1.1827 1.1829 0 0.651-0.5318 1.1829-1.1827 1.1829s-1.1831-0.53187-1.1831-1.1829c0-0.651 0.53216-1.1829 1.1831-1.1829zm2.7493 10.983v8.3998l-6.2995-4.2001z"
);

let symbolsFw = [general_symbol_Fw, fan_symbol_Fw];
let symbolsBw = [general_symbol_Bw, fan_symbol_Bw];

/**Defines options for driver instrument*/
type InstrDriverOptions = {
  /**the module to communicate with*/
  module: DRIVE;
  /**the title of the button control window*/
  title: string;
  /**which symbol to use for the driver*/
  symbol: number;
} & InstrumentBaseOptions;

export class InstrDriver extends InstrumentBase<InstrDriverOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "instument-driver";
  }
  static elementNameSpace() {
    return "lmui";
  }

  private __symbol_Fw: SVGPathElement;
  private __symbol_Bw: SVGPathElement;
  private __isopen: boolean = false;
  private __title: string = "Driver Control";
  private ___invalid: boolean = true;
  private $Vbinstrument?: InstrumentAPI;
  private mode: number = 0;

  constructor() {
    super();
    this.__svg.appendChild(
      (this.__symbol_Fw = general_symbol_Fw.cloneNode(true) as SVGPathElement)
    );
    this.__svg.appendChild(
      (this.__symbol_Bw = general_symbol_Bw.cloneNode(true) as SVGPathElement)
    );
    this.__svg.appendChild(round.cloneNode(true) as SVGCircleElement);
    attachClickListener(this.__svg, async () => {
      if (!this.__isopen) {
        this.__isopen = true;
        try {
          var control = new DriverWindow({
            mode: this.mode,
            api: this.$Vbinstrument!,
          });
          control.name = this.__title;
          mainWindowManager.appendWindow(
            new UIWindow().options({
              content: control,
              height: "content",
              width: remToPx(24),
              sizeable: false,
            })
          );
          await control.whenClosed;
        } catch (error) {}
        this.__isopen = false;
      }
    });
    this.classList.add("invalid");
    this.___invalid = true;
  }

  /**Options toggeler*/
  options(options: InstrDriverOptions): this {
    super.options(options);
    if (typeof options.module !== "undefined") this.module = options.module;
    if (typeof options.title === "string") this.__title = options.title;
    if (typeof options.symbol !== "undefined") {
      let fw = this.__symbol_Fw;
      let bw = this.__symbol_Bw;
      this.__svg.replaceChild(
        (this.__symbol_Fw = symbolsFw[options.symbol].cloneNode(
          true
        ) as SVGPathElement),
        fw
      );
      this.__svg.replaceChild(
        (this.__symbol_Bw = symbolsBw[options.symbol].cloneNode(
          true
        ) as SVGPathElement),
        bw
      );
    }
    return this;
  }

  /**Original width of rendered graphics*/
  get renderWidth() {
    return 32;
  }
  /**Original height of rendered graphics */
  get renderHeight() {
    return 32;
  }

  /**Sets the module the */
  set module(mod: DRIVE) {
    this.instrument = mod.instrument;
    this.mode = mod.controlMode;
  }

  set instrument(_mod: InstrumentAPI) {}

  protected $vfinstrument(value: any) {
    if (value === null) {
      this.__svg.classList.remove("stoped", "forward", "backward");
      this.classList.add("invalid");
      this.___invalid = true;
    } else {
      this.__svg.classList.remove("stoped", "forward", "backward");
      switch (value["status"]) {
        case 1: {
          this.__svg.classList.add("forward");
          break;
        }
        case 2: {
          this.__svg.classList.add("backward");
          break;
        }
        case 3: {
          this.__svg.classList.add("forward");
          break;
        }
      }
      if (this.___invalid) {
        this.classList.remove("invalid");
        this.___invalid = false;
      }
    }
  }
}
defineElement(InstrDriver);
defineElementValues(InstrDriver, ["instrument"]);

type DriverWindowOptions = {
  api: InstrumentAPI;
  mode: number;
};

class DriverWindow extends Content {
  /**Returns the name used to define the element */
  static elementName() {
    return "instument-driver-window";
  }
  static elementNameSpace() {
    return "lmui";
  }

  private __mode: number;
  private __status: TextBoxValue;
  private __speed?: TextBoxValue;
  private __start: Button;
  private __stop: Button;
  private __reverse?: Button;

  constructor(options: DriverWindowOptions) {
    super();
    this.__mode = options.mode;
    this.instrument = options.api;
    let buttons = document.createElement("div");
    this.appendChild(buttons);
    this.__start = new Button().options({
      text: "Start",
      click: () => {
        options.api.command("order", { order: 1 });
      },
    });
    buttons.appendChild(this.__start);
    this.__stop = new Button().options({
      text: "Stop",
      click: () => {
        options.api.command("order", { order: 0 });
      },
    });
    buttons.appendChild(this.__stop);
    switch (options.mode) {
      case 3:
        this.__reverse = new Button().options({
          text: "Reverse",
          click: () => {
            options.api.command("order", { order: 2 });
          },
        });
        buttons.appendChild(this.__reverse);
        break;
    }

    switch (options.mode) {
      case 2:
      case 3:
        this.__speed = new TextBoxValue().options({
          text: "Speed",
          value: 0,
        });
        this.appendChild(this.__speed);

        let speed = new ValueAsync(undefined, 1000);
        speed.__setValueAsync = (val) => {
          options.api.command("speed", { orderSpeed: val });
        };
        Promise.race([options.api.get]).then((val) => {
          speed.setAsync = val["speed"];
        });
        this.appendChild(
          new Slider().options({
            min: 0,
            max: 100,
            unit: "%",
            value: speed,
            live: true,
          })
        );
        break;
    }

    this.__status = new TextBoxValue().options({
      text: "Status",
      value: "N/A",
    });
    this.appendChild(this.__status);

    this.appendChild(
      new Button().options({
        text: "Close",
        click: () => {
          this.close();
        },
      })
    );
  }

  /**Handler for keyboard events*/
  protected __keyboard(e: KeyboardEvent) {
    if (e.key == "Escape") {
      this.close();
    }
  }

  set instrument(_mod: InstrumentAPI) {}

  protected $vfinstrument(val: any) {
    if (val === null) {
      this.__status.value = "Connection Lost";
      if (this.__speed) this.__speed.value = "Connection Lost";
    } else {
      this.__status.value = [
        "Stopped",
        "Running",
        "Running Reverse",
        "Stopping",
        "Starting",
        "Starting Reverse",
      ][val["status"]];
      switch (this.__mode) {
        case 2:
        case 3:
          if (this.__speed) this.__speed.value = val["speed"];
          break;
      }
    }
  }
}
defineElement(DriverWindow);
defineElementValues(DriverWindow, ["instrument"]);
