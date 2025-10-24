import { defineElement, type BaseOptions } from "@libBase";
import { blue, green, grey, orange, red, yellow } from "@libColors";
import { WebComponent, type ConnectListener } from "@libCommon";
import { addThemeVariable } from "@libTheme";
import { Value, type ValueListener } from "@libValues";
import "./common.scss";

export let componentNameStart = "comp-";

/**This contains the different ways to render an component*/
export const Way = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3,
} as const;
export type Way = (typeof Way)[keyof typeof Way];

addThemeVariable(
  "componentLabelTextColor",
  ["Components"],
  grey["700"],
  grey["300"]
);
addThemeVariable(
  "componentBorderColor",
  ["Components"],
  grey["700"],
  grey["300"]
);
addThemeVariable(
  "componentTextColor",
  ["Components"],
  grey["800"],
  grey["200"]
);
addThemeVariable(
  "componentSymbolColor",
  ["Components"],
  grey["800"],
  grey["200"]
);
addThemeVariable(
  "componentBackGroundColor",
  ["Components"],
  grey["50"],
  grey["900"]
);
addThemeVariable(
  "componentHoverBackGroundColor",
  ["Components"],
  grey["400"],
  grey["700"]
);
addThemeVariable(
  "componentFocusOutlineColor",
  ["Components"],
  orange["600"],
  orange["300"]
);
addThemeVariable(
  "componentUnselectedBorderColor",
  ["Components"],
  grey["700"],
  grey["300"]
);
addThemeVariable(
  "componentUnselectedTextColor",
  ["Components"],
  grey["600"],
  grey["400"]
);
addThemeVariable(
  "componentUnselectedSymbolColor",
  ["Components"],
  grey["600"],
  grey["400"]
);
addThemeVariable(
  "componentUnselectedBackGroundColor",
  ["Components"],
  grey["300"],
  grey["800"]
);
addThemeVariable(
  "componentGreenColor",
  ["Components"],
  green["300"],
  green["900"]
);
addThemeVariable("componentRedColor", ["Components"], red["300"], red["900"]);
addThemeVariable(
  "componentBlueColor",
  ["Components"],
  blue["300"],
  blue["900"]
);
addThemeVariable(
  "componentYellowColor",
  ["Components"],
  yellow["300"],
  yellow["900"]
);

//###################################
//#    ____                         #
//#   |  _ \                        #
//#   | |_) | __ _ ___  ___  ___    #
//#   |  _ < / _` / __|/ _ \/ __|   #
//#   | |_) | (_| \__ \  __/\__ \   #
//#   |____/ \__,_|___/\___||___/   #
//###################################
/**Defines base options for components*/
export type ComponentBaseOptions = {
  way?: Way;
  text?: string;
} & BaseOptions;

/**Shared component class for other components to inherit from*/
export abstract class Component<
  Options extends ComponentBaseOptions = ComponentBaseOptions
> extends WebComponent<Options> {
  /**Returns the name used to define the element */
  static elementName() {
    return "component";
  }

  protected __way?: Way;

  /**Set the way the component is rendered*/
  set way(way: Way) {
    this.classList.remove("up", "down", "left", "right", "horz", "vert");
    this.classList.add(
      ["up", "down", "left", "right"][way],
      ["horz", "horz", "vert", "vert"][way]
    );
    this.__onWay(way);
    this.__way = way;
  }

  /**This retreives the way the compontent is*/
  get way(): Way | undefined {
    return this.__way;
  }

  /**Set the text of the component*/
  set text(_text: string) {}

  /**Set the text of the component*/
  get text(): string {
    return "";
  }

  /**Internal way call*/
  protected __onWay(_way: Way) {}

  /**Options setting*/
  options(options: Options): this {
    super.options(options);
    if (typeof options.way !== "undefined") this.way = options.way;
    else this.way = Way.DOWN;
    if (typeof options.text !== "undefined") this.text = options.text;
    return this;
  }
}
defineElement(Component);

/**Allowed values for value component  */
export type ComponentInternalValue = string | number | boolean;
/**Value and unit type for value component */
export type ComponentValue = ComponentInternalValue | Value;
/**Value and unit type for value component */
export type ComponentUnit = string | Value;
/**Defines base options for components with values */
export type ValueComponentOptions = {
  value?: ComponentValue;
  change?: (e: any) => void;
  id?: string;
} & ComponentBaseOptions;

/**Shared class for all components with values*/
export abstract class ValueComponent<
  Options extends ValueComponentOptions = ValueComponentOptions
> extends Component<Options> {
  /**Returns the name used to define the element */
  static elementName() {
    return "@abstract@";
  }

  private __value: Value | undefined;
  private __originalValue?: ComponentInternalValue;
  protected __valueBuffer?: ComponentInternalValue;
  private __id?: string;
  private __valueListener?: ValueListener;
  private __connectListener?: ConnectListener;

  options(options: Options): this {
    super.options(options);
    if (typeof options.value !== "undefined") this.value = options.value;
    if (typeof options.change === "function") this.change = options.change;
    if (typeof options.id === "string") this.id = options.id;
    return this;
  }

  /**Returns the value of the component if it has changed*/
  get changed(): undefined | ComponentInternalValue {
    let val = this.value;
    if (val != this.__originalValue) return val;
    return undefined;
  }

  /**Updates the internal buffer */
  updateValueBuffer() {
    //@ts-expect-error
    this.__originalValue = this.$vbvalueInt;
  }

  /**Resets the value back to the originally set value before user influence */
  resetValue() {
    //@ts-expect-error
    this.$vsvalueInt(this.__originalValue);
  }

  /**This sets the id of the component*/
  set id(id: string) {
    this.__id = id;
  }

  /**Returns id of the component*/
  get id(): string {
    return this.__id || "";
  }

  /**This sets the value of the component*/
  set value(val: ComponentValue) {
    if (this.__value) {
      if (this.isConnected) this.__value.removeListener(this.__valueListener!);
      if (this.__connectListener) {
        this.dettachConnectListener(this.__connectListener);
        delete this.__connectListener;
      }
    }
    if (val instanceof Value) {
      this.__value = val;
      let valBuff = val.get;
      if (valBuff instanceof Promise)
        valBuff.then((a) => {
          this.__originalValue = a;
        });
      else this.__originalValue = valBuff;

      this.__connectListener = this.attachConnectListener((attDet) => {
        if (attDet)
          this.__valueListener = val.addListener((val) => {
            this.__valueBuffer = val;
            this.__newValue(val);
          }, true);
        else val.removeListener(this.__valueListener!);
      });
    } else {
      this.__originalValue = val;
      this.__valueBuffer = val;
      this.__newValue(val);
    }
  }

  /**Returns value of the component*/
  get value(): ComponentInternalValue | undefined {
    return this.__valueBuffer;
  }

  /**Function to update value*/
  protected __setValue(val: ComponentInternalValue) {
    if (this.__value) {
      this.__value.set = val;
    } else {
      this.__valueBuffer = val;
      this.__newValue(val);
    }
    try {
      this.change(val, this);
    } catch (e) {
      console.warn("Failed at listener", e);
    }
  }

  /**Update function for value change*/
  protected __newValue(_val: ComponentInternalValue) {}

  /**Overwriteable change listener*/
  change(_val: ComponentInternalValue, _target: ValueComponent) {}
}

/**This describes how an option object entry should be*/
export type SelectorComponentOption = {
  text: string;
  value: ComponentInternalValue;
  symbol?: SVGSVGElement;
};

/**Defines base options for components with multiple options*/
export type SelectorComponentOptions = {
  options?: SelectorComponentOption[];
} & ValueComponentOptions;

/**Shared class for all components with multiple options*/
export abstract class SelectorComponent<
  Options extends SelectorComponentOptions = SelectorComponentOptions
> extends ValueComponent<Options> {
  /**Returns the name used to define the element */
  static elementName() {
    return "@abstract@";
  }

  options(options: Options): this {
    if (options.options) this.selectorOptions = options.options;
    super.options(options);
    return this;
  }

  /**This adds an option to the selector component*/
  addOption(
    _text: string,
    _value: ComponentInternalValue,
    _symbol?: SVGSVGElement,
    _selected?: boolean
  ) {}

  /**This removes an option to the selector component*/
  removeOption(_option: HTMLElement) {}

  /**This sets the options of the selector with an array*/
  set selectorOptions(opts: SelectorComponentOption[]) {
    for (let i = 0, m = opts.length; i < m; i++)
      this.addOption(opts[i].text, opts[i].value, opts[i].symbol);
  }

  /**Sets the value by using the options element*/
  setByOption(_elem: HTMLDivElement) {}
}
