import { Base } from "@libBase";
import { Err, Ok, type Result } from "@libResult";
import type { STATE, STATE_SUB } from "@libState";
import "./shared";

/**Colors for form elements that have selectable colors*/
export const FormColors = {
  None: "none",
  Black: "black",
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
}

//##################################################################################################
//     __      __     _     _    _ ______   _____  ______          _____
//     \ \    / /\   | |   | |  | |  ____| |  __ \|  ____|   /\   |  __ \
//      \ \  / /  \  | |   | |  | | |__    | |__) | |__     /  \  | |  | |
//       \ \/ / /\ \ | |   | |  | |  __|   |  _  /|  __|   / /\ \ | |  | |
//        \  / ____ \| |___| |__| | |____  | | \ \| |____ / ____ \| |__| |
//         \/_/    \_\______\____/|______| |_|  \_\______/_/    \_\_____/

export interface FormValueOptions<RT> {
  /**ID form form element */
  id?: string;
  /**Value for form element */
  value?: RT;
  value_by_state?: STATE<RT>;
  /**Text for label above form element */
  label?: string;
  /**Longer description what form element does */
  description?: string;
}

/**Shared class for all components with values*/
export abstract class FormValue<RT> extends FormElement {
  static element_name() {
    return "@abstract@";
  }

  readonly formID?: string;
  protected _description?: string;
  protected _label: HTMLSpanElement = this.appendChild(
    document.createElement("span")
  );
  protected _body: HTMLDivElement = this.appendChild(
    document.createElement("div")
  );

  static apply_options<RT>(
    element: FormValue<RT>,
    options: FormValueOptions<RT>
  ) {
    if (options.label) element.label = options.label;
    if (options.description) element.description = options.description;
    if (options.value_by_state) element.value_by_state = options.value_by_state;
    else if (options.value !== undefined) element.value = options.value;
  }

  constructor(id: string | undefined) {
    super();
    this.formID = id;
  }

  /**Sets the current label of the element*/
  set label(text: string) {
    this._label.textContent = text;
  }
  get label(): string {
    return this._label.textContent;
  }

  /**Sets the current label of the element*/
  set description(text: string) {
    this._description = text;
  }
  get description(): string {
    return this._description || "";
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

  constructor(id: string | undefined) {
    super(id);
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
