import { AccessTypes, define_element } from "@libBase";
import type { Prettify } from "@libCommon";
import {
  material_navigation_unfold_less_rounded,
  material_navigation_unfold_more_rounded,
} from "@libIcons";
import { Err, Ok, type Result } from "@libResult";
import { FormElement, FormValue, type FormValueOptions } from "../base";
import "./group.scss";

/**Different border styles for the component group*/
export const FormGroupBorderStyle = {
  None: "none",
  Inset: "inset",
  Outset: "outset",
  Line: "line",
} as const;
export type FormGroupBorderStyle =
  (typeof FormGroupBorderStyle)[keyof typeof FormGroupBorderStyle];

type ExtractB<Arr extends any[]> = Arr extends [infer Head, ...infer Tail]
  ? Head extends FormValue<infer T, infer ID>
    ? [FormValue<T, ID>, ...ExtractB<Tail>]
    : [...ExtractB<Tail>]
  : [];

type ToKeyVal<Arr extends FormValue<any, any>[]> = {
  [K in Arr[number] as K["formID"]]: K extends FormValue<infer T, any>
    ? T
    : never;
};

export interface FormGroupOptions<
  L extends FormElement[],
  ID extends string | undefined,
  T
> extends FormValueOptions<T, ID> {
  /**Components to add to the group*/
  components?: [...L];
  /**Wether the group is collapsible, meaning it has a button to collapse and expand all content to the size of that button*/
  collapsible?: boolean;
  /**Wether the group is collapsed initially*/
  collapsed?: boolean;
  /**Text to show on the collapse button*/
  collapse_text?: string;
  /**Border style for group*/
  border?: FormGroupBorderStyle;
  /**Group max height in rem, undefined means no limit*/
  max_height?: number;
}

/**Component group class which allows to add components and controls the flow of the components*/
export class FormGroup<
  RT extends object,
  ID extends string | undefined
> extends FormValue<RT, ID> {
  static element_name() {
    return "group";
  }
  static element_name_space(): string {
    return "form";
  }

  #collapsible?: HTMLDivElement;
  #collapsed: boolean = false;
  #collapse_button?: HTMLSpanElement;
  #value_components: Map<string, FormValue<any, any>> = new Map();

  set components(components: FormElement[]) {
    for (let i = 0, n = components.length; i < n; i++) {
      const comp = components[i];
      if (comp instanceof FormValue && comp.formID) {
        if (this.#value_components.has(comp.formID as string)) {
          console.error(
            "Form element with form id " +
              comp.formID +
              " already exists in group"
          );
          continue;
        }
        this.#value_components.set(comp.formID as string, comp);
      }
      if (this.#collapsible) this.#collapsible.appendChild(comp);
      else this._body.appendChild(comp);
    }
  }

  get components(): FormElement[] {
    return [...this.#value_components.values()];
  }

  /**This places the group at an absolute position in one of the corners of the container*/
  set border(border: FormGroupBorderStyle | undefined) {
    this.classList.remove(
      FormGroupBorderStyle.Inset,
      FormGroupBorderStyle.Outset
    );
    if (border && border !== FormGroupBorderStyle.None)
      this._body.classList.add(border);
  }

  set collapsible(collapsible: boolean) {
    if (collapsible && !this.#collapsible) {
      this.#collapsible = document.createElement("div");
      if (this.children.length > 1)
        this.#collapsible.replaceChildren(...this._body.children);
      this._body.appendChild(this.#collapsible);
      this._body.classList.add("collapsible");
      this._body.appendChild(
        this.#collapse_button ||
          (this.collapse_text = "") ||
          this.#collapse_button!
      );
      this.collapsed = true;
    } else if (!collapsible && this.#collapsible) {
      this.collapsed = false;
      this._body.replaceChildren(...this.#collapsible.children);
      this.#collapsible = undefined;
      this._body.classList.remove("collapsible");
    }
  }
  get collapsible(): boolean {
    return this.#collapsible !== undefined;
  }

  set collapsed(collapsed: boolean) {
    if (this.#collapsible) {
      if (collapsed && !this.#collapsed) this._body.classList.add("collapsed");
      else if (!collapsed && this.#collapsed)
        this._body.classList.remove("collapsed");
      this.#collapsed = collapsed;
    }
  }
  get collapsed(): boolean {
    return this.#collapsed;
  }

  set collapse_text(text: string) {
    if (!this.#collapse_button) {
      this.#collapse_button = document.createElement("span");
      this.#collapse_button.appendChild(document.createElement("span"));
      this.#collapse_button.appendChild(
        material_navigation_unfold_less_rounded()
      );
      this.#collapse_button.appendChild(
        material_navigation_unfold_more_rounded()
      );
      this.#collapse_button.onclick = () => (this.collapsed = !this.collapsed);
    }
    this.#collapse_button.firstChild!.textContent = text;
  }

  set max_height(height: number | undefined) {
    if (height !== undefined) {
      this._body.style.maxHeight = height + "rem";
      this._body.style.overflowY = "auto";
    } else {
      this._body.style.maxHeight = "";
      this._body.style.overflowY = "";
    }
  }

  set value(val: RT) {
    super.value = val;
  }

  /**Returns value of the component*/
  get value(): Result<RT, string> {
    if (this._state) return Err("State based component");
    const result: RT = {} as RT;
    for (const [key, comp] of this.#value_components) {
      const val = comp.value;
      if (val.err) return Err("Component with id " + key + " has no value");
      result[key as keyof RT] = val.value as RT[keyof RT];
    }
    return Ok(result);
  }

  protected new_value(val: RT): void {
    for (const key in val) {
      if (this.#value_components.has(key)) {
        this.#value_components.get(key)!.value = val[key as keyof RT];
      }
    }
  }

  protected new_error(err: string): void {
    console.error(err);
  }

  protected on_access(access: AccessTypes): void {
    switch (access) {
      case AccessTypes.Read: {
        this.tabIndex = 0;
        this.onfocus = () => {
          document.body.focus();
        };
        break;
      }
      case AccessTypes.Write: {
        this.removeAttribute("tabIndex");
        this.onfocus = null;
        break;
      }
    }
  }
}
define_element(FormGroup);

export const form_group = {
  /**Creates a dropdown form element */
  from<
    L extends FormElement[],
    ID extends string | undefined,
    T extends object = Prettify<Partial<ToKeyVal<ExtractB<L>>>>
  >(options?: FormGroupOptions<L, ID, T>): FormGroup<T, ID> {
    const slide = new FormGroup<T, ID>(options?.id);
    if (options) {
      if (options.border) slide.border = options.border;
      if (options.components) slide.components = options.components;
      if (options.collapse_text) slide.collapse_text = options.collapse_text;
      if (options.collapsible) slide.collapsible = options.collapsible;
      if (options.collapsed) slide.collapsed = options.collapsed;
      if (options.max_height) slide.max_height = options.max_height;
      FormValue.apply_options(slide, options);
    }
    return slide;
  },
};
