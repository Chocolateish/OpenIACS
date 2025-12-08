import { AccessTypes, define_element } from "@libBase";
import { FormElement, FormValue, type FormValueOptions } from "../base";
import "./group.scss";

/**Different border styles for the component group*/
export const FormGroupBorderStyle = {
  None: "none",
  Inset: "inset",
  Outset: "outset",
} as const;
export type FormGroupBorderStyle =
  (typeof FormGroupBorderStyle)[keyof typeof FormGroupBorderStyle];

export interface FormGroupOptions<RT = number> extends FormValueOptions<RT> {
  /**Components to add to the group*/
  components?: FormElement[];
  /**Wether the group is collapsible, meaning it has a button to collapse and expand all content to the size of that button*/
  collapsible?: boolean;
  /**Border style for group*/
  border?: FormGroupBorderStyle;
}

/**Component group class which allows to add components and controls the flow of the components*/
export class FormGroup<RT extends {}> extends FormValue<RT> {
  static element_name() {
    return "group";
  }
  static element_name_space(): string {
    return "form";
  }

  #collapsible?: HTMLDivElement;
  #collapsed: boolean = false;
  #value_components: Map<string, FormValue<any>> = new Map();

  set components(components: FormElement[]) {
    for (let i = 0, n = components.length; i < n; i++) {
      let comp = components[i];
      if (comp instanceof FormValue && comp.id) {
        if (this.#value_components.has(comp.id)) {
          console.error(
            "Form element with id " + comp.id + " already exists in group"
          );
          continue;
        }
        this.#value_components.set(comp.id, comp);
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
      this.#collapsible = this.appendChild(document.createElement("div"));
      if (this.children.length > 1)
        this.#collapsible.replaceChildren(...this._body.children);
    } else if (!collapsible && this.#collapsible) {
      this._body.replaceChildren(...this.#collapsible.children);
      this.#collapsible = undefined;
    }
  }
  get collapsible(): boolean {
    return this.#collapsible !== undefined;
  }

  set collapsed(collapsed: boolean) {
    if (this.#collapsible) {
      if (collapsed && !this.#collapsed)
        this.#collapsible.style.display = "none";
      else if (!collapsed && this.#collapsed)
        this.#collapsible.style.display = "";
      this.#collapsed = collapsed;
    }
  }
  get collapsed(): boolean {
    return this.#collapsed;
  }

  protected new_value(val: RT): void {
    this.#value_components.forEach((comp) => {
      if (comp.id in val) comp.value = val[comp.id as keyof RT];
    });
  }

  protected new_error(_val: string): void {}

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

  // /**Returns an object with the values of all components with id*/
  // get values() {
  //   let vals = {};
  //   for (const key in this.__valueComponents) {
  //     vals[key] = this.__valueComponents[key].value;
  //   }
  //   return vals;
  // }

  // /**Returns an object with the values of all components with id and which value has changed*/
  // get changedValues() {
  //   let vals = {};
  //   for (const key in this.__valueComponents) {
  //     let val = this.__valueComponents[key].changed;
  //     if (typeof val !== "undefined") {
  //       vals[key] = val;
  //     }
  //   }
  //   return vals;
  // }

  // /**Returns true if any of the value components with id has a changed value */
  // get hasChangedValue() {
  //   for (const key in this.__valueComponents) {
  //     if (typeof this.__valueComponents[key].changed !== "undefined") {
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  // /**Updates the internal buffers off all  */
  // updateValueBuffers() {
  //   for (const key in this.__valueComponents) {
  //     this.__valueComponents[key].updateValueBuffer();
  //   }
  // }

  // /**Changes the values of all value components with ids*/
  // set values(vals) {
  //   for (const key in vals) {
  //     if (key in this.__valueComponents) {
  //       this.__valueComponents[key].value = vals[key];
  //     }
  //   }
  // }

  // /**Resets the values back to the originally set value before user influence*/
  // resetValues() {
  //   for (const key in vals) {
  //     if (key in this.__valueComponents) {
  //       this.__valueComponents[key].resetValue();
  //     }
  //   }
  // }
}
define_element(FormGroup);

export let form_group = {
  /**Creates a dropdown form element */
  from(options?: FormGroupOptions): FormGroup {
    let slide = new FormGroup(options?.id);
    if (options) {
      if (options.border) slide.border = options.border;
      if (options.components) slide.components = options.components;
      FormValue.apply_options(slide, options);
    }
    return slide;
  },
};
