import { Base } from "@libBase";
import { Err, Ok, type Result } from "@libResult";
import type { STATE, STATE_SUB } from "@libState";
import type { SVGFunc } from "@libSVG";

/**This contains the different ways to render an component*/
export const Way = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3,
} as const;
export type Way = (typeof Way)[keyof typeof Way];

const wayDir = ["up", "down", "left", "right"];
const wayHorzVert = ["horz", "horz", "vert", "vert"];

/**Shared component class for other components to inherit from*/
export abstract class FormElement extends Base {
  static elementName() {
    return "@abstract@";
  }
  static elementNameSpace(): string {
    return "form";
  }

  protected _way?: Way;

  /**Set the way the component is rendered*/
  set way(way: Way) {
    if (this._way)
      this.classList.remove(wayDir[this._way], wayHorzVert[this._way]);
    this.classList.add(wayDir[way], wayHorzVert[way]);
    this.onWay(way, this._way);
    this._way = way;
  }
  /**This retreives the way the compontent is*/
  get way(): Way | undefined {
    return this._way;
  }
  /**Internal way call*/
  protected onWay(_way: Way, _oldWay?: Way) {}

  /**Set the text of the component*/
  abstract set text(_text: string);
  /**Set the text of the component*/
  abstract get text(): string;
}

//##################################################################################################
/**Shared class for all components with values*/
export abstract class FormValue<T> extends FormElement {
  static elementName() {
    return "@abstract@";
  }

  readonly cid?: string;
  #warnInput: HTMLInputElement = this.appendChild(
    document.createElement("input")
  );

  /**
   * @param cid Component ID for identifying component instances */
  constructor(cid?: string) {
    super();
    this.cid = cid;
    this.#warnInput.id = "val";
  }

  #state?: STATE<T>;
  #func?: STATE_SUB<Result<T, string>>;
  #changed: boolean = false;
  #buffer?: T;

  get buffer(): T | undefined {
    return this.#buffer;
  }

  /**Returns the value of the component if it has changed*/
  get changed(): boolean {
    return this.#changed;
  }

  /**This sets the value of the component*/
  set valueByState(state: STATE<T> | undefined) {
    if (this.#func) this.dettachSTATE(this.#func);
    if (state) {
      this.attachSTATE(state, (val) => {
        if (val.ok) this.value = val.value;
        else this.error = val.error;
      });
    }
  }

  /**This sets the value of the component*/
  set value(val: T) {
    this.#changed = false;
    this.#buffer = val;
    this.newValue(val);
  }

  set error(err: string) {
    this.newError(err);
  }

  /**Called when value is set by value setter or state*/
  protected abstract newValue(val: T): void;

  /**Called when error is set by error or state*/
  protected abstract newError(val: string): void;

  /**Returns value of the component*/
  get value(): Result<T, string> {
    return this.#state
      ? Err("State based component")
      : typeof this.#buffer === "undefined"
      ? Err("No value yet")
      : Ok(this.#buffer);
  }

  warn(message: string): void {
    this.#warnInput.setCustomValidity(message);
    this.#warnInput.reportValidity();
  }

  /**Function to update value*/
  protected async setValue(val: T) {
    if (this.#state) {
      if (this.#state.writable) {
        let res = await this.#state.write(val);
        res.mapErr((e) => this.warn(e));
        this.#changed = true;
      }
    } else {
      this.newValue(val);
      this.#buffer = val;
      this.#changed = true;
    }
    try {
      this.change(val);
    } catch (e) {
      console.error("Failed while updating change listener", e);
    }
  }

  /**Overwriteable change listener*/
  change(_val: T) {}
}

//##################################################################################################
/**This describes how an option object entry should be*/
export type FormSelectorOption<T> = {
  name: string;
  description?: string;
  icon?: SVGFunc;
  value: T;
};

/**Shared class for all components with multiple options*/
export abstract class FormSelector<T> extends FormValue<T> {
  /**Returns the name used to define the element */
  static elementName() {
    return "@abstract@";
  }

  /**This adds an option to the selector component*/
  abstract addOption(
    name: string,
    value: T,
    describtion?: string,
    icon?: SVGFunc,
    selected?: boolean
  ): void;

  /**This removes an option to the selector component*/
  removeOption(_option: HTMLElement) {}

  /**This sets the options of the selector with an array*/
  set selectorOptions(opts: FormSelectorOption<T>[]) {
    for (let i = 0, m = opts.length; i < m; i++)
      this.addOption(
        opts[i].name,
        opts[i].value,
        opts[i].description,
        opts[i].icon
      );
  }

  /**Sets the value by using the options element*/
  setByOption(_elem: HTMLDivElement) {}
}
