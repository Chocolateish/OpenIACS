import { Base } from "@libBase";
import { Err, Ok, type Result } from "@libResult";
import type { STATE, STATE_SUB } from "@libState";
import type { SVGFunc } from "@libSVG";

/**Colors for form elements that have selectable colors*/
export const FormColors = {
  None: "none",
  Green: "green",
  Red: "red",
  Blue: "blue",
  Yellow: "yellow",
} as const;
export type FormColors = (typeof FormColors)[keyof typeof FormColors];

/**Shared component class for other components to inherit from*/
export abstract class FormElement extends Base {
  static element_name() {
    return "@abstract@";
  }
  static element_name_space(): string {
    return "form";
  }

  /**Set the text of the component*/
  abstract set label(_label: string);
  /**Set the text of the component*/
  abstract get label(): string;
}

//##################################################################################################
//     __      __     _     _    _ ______   _____  ______          _____
//     \ \    / /\   | |   | |  | |  ____| |  __ \|  ____|   /\   |  __ \
//      \ \  / /  \  | |   | |  | | |__    | |__) | |__     /  \  | |  | |
//       \ \/ / /\ \ | |   | |  | |  __|   |  _  /|  __|   / /\ \ | |  | |
//        \  / ____ \| |___| |__| | |____  | | \ \| |____ / ____ \| |__| |
//         \/_/    \_\______\____/|______| |_|  \_\______/_/    \_\_____/
/**Shared class for all components with values*/
export abstract class FormValue<RT> extends FormElement {
  static element_name() {
    return "@abstract@";
  }

  readonly cid?: string;

  /**
   * @param cid Component ID for identifying component instances */
  constructor(cid: string | undefined) {
    super();
    this.cid = cid;
  }

  protected _state?: STATE<RT>;
  protected _buffer?: RT;
  #func?: STATE_SUB<Result<RT, string>>;

  get buffer(): RT | undefined {
    return this._buffer;
  }

  /**This sets the value of the component*/
  set value_by_state(state: STATE<RT> | undefined) {
    if (this.#func) this.dettach_STATE(this.#func);
    if (state)
      this.attach_STATE(state, (val) => {
        if (val.ok) this.value = val.value;
        else this.error = val.error;
      });
    this._state = state;
  }

  /**This sets the value of the component*/
  set value(val: RT) {
    this._buffer = val;
    this.new_value(val);
  }

  set error(err: string) {
    this.new_error(err);
  }

  /**Called when value is set by value setter or state*/
  protected abstract new_value(val: RT): void;

  /**Called when error is set by error or state*/
  protected abstract new_error(val: string): void;

  /**Returns value of the component*/
  get value(): Result<RT, string> {
    return this._state
      ? Err("State based component")
      : typeof this._buffer === "undefined"
      ? Err("No value yet")
      : Ok(this._buffer);
  }

  /**Overwriteable change listener*/
  change(_val: RT) {}
}

//##################################################################################################
//     __      __     _     _    _ ______  __          _______  _____ _______ ______
//     \ \    / /\   | |   | |  | |  ____| \ \        / /  __ \|_   _|__   __|  ____|
//      \ \  / /  \  | |   | |  | | |__     \ \  /\  / /| |__) | | |    | |  | |__
//       \ \/ / /\ \ | |   | |  | |  __|     \ \/  \/ / |  _  /  | |    | |  |  __|
//        \  / ____ \| |___| |__| | |____     \  /\  /  | | \ \ _| |_   | |  | |____
//         \/_/    \_\______\____/|______|     \/  \/   |_|  \_\_____|  |_|  |______|
/**Shared class for all components with values*/
export abstract class FormValueWrite<RT> extends FormValue<RT> {
  static element_name() {
    return "@abstract@";
  }

  protected warn_input: HTMLInputElement = document.createElement("input");

  /**
   * @param cid Component ID for identifying component instances */
  constructor(cid: string | undefined) {
    super(cid);
    this.warn_input.name = "val";
  }

  #changed: boolean = false;
  #buffer?: RT;

  get buffer(): RT | undefined {
    return this.#buffer;
  }

  /**Returns the value of the component if it has changed*/
  get changed(): boolean {
    return this.#changed;
  }

  /**This sets the value of the component*/
  set value(val: RT) {
    this.#buffer = val;
    super.value = val;
  }

  set error(err: string) {
    this.new_error(err);
  }

  /**Called when value is set by value setter or state*/
  protected abstract new_value(val: RT): void;

  /**Called when error is set by error or state*/
  protected abstract new_error(val: string): void;

  /**Returns value of the component*/
  get value(): Result<RT, string> {
    return this._state
      ? Err("State based component")
      : typeof this.#buffer === "undefined"
      ? Err("No value yet")
      : Ok(this.#buffer);
  }

  warn(message: string): void {
    this.warn_input.setCustomValidity(message);
    this.warn_input.reportValidity();
  }

  /**Function to update value*/
  protected async set_value(val: RT) {
    if (this._state) {
      if (this._state.writable) {
        let res = await this._state.write(val);
        res.map_err((e) => this.warn(e));
        this.#changed = true;
      }
    } else {
      this.new_value(val);
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
  change(_val: RT) {}
}

//##################################################################################################
//       _____ ______ _      ______ _____ _______ ____  _____
//      / ____|  ____| |    |  ____/ ____|__   __/ __ \|  __ \
//     | (___ | |__  | |    | |__ | |       | | | |  | | |__) |
//      \___ \|  __| | |    |  __|| |       | | | |  | |  _  /
//      ____) | |____| |____| |___| |____   | | | |__| | | \ \
//     |_____/|______|______|______\_____|  |_|  \____/|_|  \_\
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
  static element_name() {
    return "@abstract@";
  }

  /**This adds an option to the selector component*/
  abstract add_option(
    name: string,
    value: T,
    describtion?: string,
    icon?: SVGFunc,
    selected?: boolean
  ): void;

  /**This removes an option to the selector component*/
  remove_option(_option: HTMLElement) {}

  /**This sets the options of the selector with an array*/
  set selectorOptions(opts: FormSelectorOption<T>[]) {
    for (let i = 0, m = opts.length; i < m; i++)
      this.add_option(
        opts[i].name,
        opts[i].value,
        opts[i].description,
        opts[i].icon
      );
  }

  /**Sets the value by using the options element*/
  set_by_option(_elem: HTMLDivElement) {}
}
