import { Base, defineElement, type BaseOptions } from "@libBase";
import { blue, green, grey, orange, red, yellow } from "@libColors";
import type { StateRead, StateWrite } from "@libState";
import "./common.scss";
import { componentThemeRoot } from "./shared";

//export let componentNameStart = "comp-";

/**This contains the different ways to render an component*/
export const Way = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3,
} as const;
export type Way = (typeof Way)[keyof typeof Way];

componentThemeRoot.makeVariable(
  "componentLabelTextColor",
  "componentLabelTextColor",
  "componentLabelTextColor",
  grey["700"],
  grey["300"],
  "Color",
  undefined
);
componentThemeRoot.makeVariable(
  "componentBorderColor",
  "componentBorderColor",
  "componentBorderColor",
  grey["700"],
  grey["300"],
  "Color",
  undefined
);
componentThemeRoot.makeVariable(
  "componentTextColor",
  "componentTextColor",
  "componentTextColor",
  grey["800"],
  grey["200"],
  "Color",
  undefined
);
componentThemeRoot.makeVariable(
  "componentSymbolColor",
  "componentSymbolColor",
  "componentSymbolColor",
  grey["800"],
  grey["200"],
  "Color",
  undefined
);
componentThemeRoot.makeVariable(
  "componentBackGroundColor",
  "componentBackGroundColor",
  "componentBackGroundColor",
  grey["50"],
  grey["900"],
  "Color",
  undefined
);
componentThemeRoot.makeVariable(
  "componentHoverBackGroundColor",
  "componentHoverBackGroundColor",
  "componentHoverBackGroundColor",
  grey["400"],
  grey["700"],
  "Color",
  undefined
);
componentThemeRoot.makeVariable(
  "componentFocusOutlineColor",
  "componentFocusOutlineColor",
  "componentFocusOutlineColor",
  orange["600"],
  orange["300"],
  "Color",
  undefined
);
componentThemeRoot.makeVariable(
  "componentUnselectedBorderColor",
  "componentUnselectedBorderColor",
  "componentUnselectedBorderColor",
  grey["700"],
  grey["300"],
  "Color",
  undefined
);
componentThemeRoot.makeVariable(
  "componentUnselectedTextColor",
  "componentUnselectedTextColor",
  "componentUnselectedTextColor",
  grey["600"],
  grey["400"],
  "Color",
  undefined
);
componentThemeRoot.makeVariable(
  "componentUnselectedSymbolColor",
  "componentUnselectedSymbolColor",
  "componentUnselectedSymbolColor",
  grey["600"],
  grey["400"],
  "Color",
  undefined
);
componentThemeRoot.makeVariable(
  "componentUnselectedBackGroundColor",
  "componentUnselectedBackGroundColor",
  "componentUnselectedBackGroundColor",
  grey["300"],
  grey["800"],
  "Color",
  undefined
);
componentThemeRoot.makeVariable(
  "componentGreenColor",
  "componentGreenColor",
  "componentGreenColor",
  green["300"],
  green["900"],
  "Color",
  undefined
);
componentThemeRoot.makeVariable(
  "componentRedColor",
  "componentRedColor",
  "componentRedColor",
  red["300"],
  red["900"],
  "Color",
  undefined
);
componentThemeRoot.makeVariable(
  "componentBlueColor",
  "componentBlueColor",
  "componentBlueColor",
  blue["300"],
  blue["900"],
  "Color",
  undefined
);
componentThemeRoot.makeVariable(
  "componentYellowColor",
  "componentYellowColor",
  "componentYellowColor",
  yellow["300"],
  yellow["900"],
  "Color",
  undefined
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
> extends Base<Options> {
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

/**Value and unit type for value component */
export type ComponentValue = string | number | boolean;
/**Defines base options for components with values */
export type ValueComponentOptions = {
  value?: ComponentValue;
  change?: (e: any) => void;
  id?: string;
  valueByState?: StateRead<ComponentValue>;
  valueByStateWrite?: StateWrite<ComponentValue>;
} & ComponentBaseOptions;

/**Shared class for all components with values*/
export abstract class ValueComponent<
  Options extends ValueComponentOptions = ValueComponentOptions
> extends Component<Options> {
  /**Returns the name used to define the element */
  static elementName() {
    return "@abstract@";
  }

  #state?: StateRead<ComponentValue>;
  #stateWrite?: StateWrite<ComponentValue>;
  #originalValue?: ComponentValue;
  #id?: string;

  protected __valueBuffer?: ComponentValue;

  options(options: Options): this {
    super.options(options);
    if (typeof options.value !== "undefined") this.value = options.value;
    if (options.change) this.change = options.change;
    if (options.id) this.id = options.id;
    if (options.valueByState) this.valueByState = options.valueByState;
    if (options.valueByStateWrite)
      this.valueByStateWrite = options.valueByStateWrite;
    return this;
  }

  #cleanupState() {
    if (this.#state) {
      this.dettachStateFromProp("value");
      this.#state = undefined;
    }
    if (this.#stateWrite) {
      this.dettachStateFromProp("value");
      this.#stateWrite = undefined;
    }
  }

  set valueByState(state: StateRead<ComponentValue>) {
    this.#cleanupState();
    this.#state = state;
    this.attachStateToProp("value", state);
  }

  set valueByStateWrite(state: StateWrite<ComponentValue>) {
    this.#cleanupState();
    this.#stateWrite = state;
    this.attachStateToProp("value", state);
  }

  /**Returns the value of the component if it has changed*/
  get changed(): undefined | ComponentValue {
    let val = this.value;
    if (val != this.#originalValue) return val;
    return undefined;
  }

  /**Updates the internal buffer */
  updateValueBuffer() {
    //@ts-expect-error
    this.#originalValue = this.$vbvalueInt;
  }

  /**Resets the value back to the originally set value before user influence */
  resetValue() {
    //@ts-expect-error
    this.$vsvalueInt(this.#originalValue);
  }

  /**This sets the id of the component*/
  set id(id: string) {
    this.#id = id;
  }

  /**Returns id of the component*/
  get id(): string {
    return this.#id || "";
  }

  /**This sets the value of the component*/
  set value(val: ComponentValue) {
    this.#originalValue = val;
    this.__valueBuffer = val;
    this.__newValue(val);
  }

  /**Returns value of the component*/
  get value(): ComponentValue | undefined {
    return this.__valueBuffer;
  }

  /**Function to update value*/
  protected __setValue(val: ComponentValue) {
    this.__valueBuffer = val;
    if (this.#stateWrite) this.#stateWrite.write(val);
    else this.__newValue(val);
    try {
      this.change(val, this);
    } catch (e) {
      console.warn("Failed at listener", e);
    }
  }

  /**Update function for value change*/
  protected __newValue(_val: ComponentValue) {}

  /**Overwriteable change listener*/
  change(_val: ComponentValue, _target: ValueComponent) {}
}

/**This describes how an option object entry should be*/
export type SelectorComponentOption = {
  text: string;
  value: ComponentValue;
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
    _value: ComponentValue,
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
