import { AccessTypes, defineElement } from "@libBase";
import { unfold_less, unfold_more } from "@libIcons";
import {
  Component,
  ValueComponent,
  Way,
  type ComponentBaseOptions,
  type ComponentInternalValue,
  type ComponentValue,
} from "./common";
import "./group.scss";

export const ComponentGroupBorderStyle = {
  NONE: 0,
  OUTSET: 1,
  INSET: 2,
} as const;
export type ComponentGroupBorderStyle =
  (typeof ComponentGroupBorderStyle)[keyof typeof ComponentGroupBorderStyle];

/**Defines options for group component*/
export type GroupComponentOptions = {
  /**List of component to add to the group at creation*/
  components?: Component[];
  /**Positions the group absolutly in its container the group must still be at the correct position in the dom flow*/
  position?: Way;
  /**The style of the border of the group*/
  border?: ComponentGroupBorderStyle;
} & ComponentBaseOptions;

/**Component group class which allows to add components and controls the flow of the components*/
export class ComponentGroup<
  Options extends GroupComponentOptions = GroupComponentOptions
> extends Component<Options> {
  /**Returns the name used to define the element */
  static elementName() {
    return "group";
  }

  __valueComponents: { [s: string]: ValueComponent };
  __container: HTMLElement;
  constructor() {
    super();
    this.__valueComponents = {};
    this.__container = this;
  }

  options(options: Options): this {
    super.options(options);
    if (options.components instanceof Array)
      for (let i = 0, n = options.components.length; i < n; i++)
        this.addComponent(options.components[i]);
    if (typeof options.position !== "undefined")
      this.position = options.position;
    if (typeof options.border !== "undefined") this.border = options.border;
    return this;
  }

  /**This adds the component to the group*/
  addComponent<T extends Component>(comp: T): T {
    if (comp instanceof ValueComponent) {
      let id = comp.id;
      if (id) {
        if (id in this.__valueComponents)
          console.warn("Component id already in group");
        else this.__valueComponents[id] = comp;
      }
    }
    this.__container.appendChild(comp);
    return comp;
  }

  /**This places the group at an absolute position in one of the corners of the container*/
  set position(pos: Way) {
    this.classList.remove("drawTop", "drawBottom", "drawLeft", "drawRight");
    if (typeof pos == "number") {
      this.classList.add(
        ["drawTop", "drawBottom", "drawLeft", "drawRight"][pos]
      );
    }
  }

  /**This places the group at an absolute position in one of the corners of the container*/
  set border(border: ComponentGroupBorderStyle) {
    if (typeof border == "number") {
      this.classList.remove("bOut", "bIn");
      this.classList.add(["", "bOut", "bIn"][border]);
    }
  }

  /**Internal access call*/
  protected __onAccess(a: AccessTypes) {
    switch (a) {
      case AccessTypes.READ: {
        this.tabIndex = 0;
        this.onfocus = () => {
          document.body.focus();
        };
        break;
      }
      case AccessTypes.WRITE: {
        this.removeAttribute("tabIndex");
        this.onfocus = null;
        break;
      }
    }
  }

  /**Returns an object with the values of all components with id*/
  get values() {
    let vals: { [s: string]: ComponentInternalValue } = {};
    for (const key in this.__valueComponents) {
      vals[key] = this.__valueComponents[key].value!;
    }
    return vals;
  }

  /**Returns an object with the values of all components with id and which value has changed*/
  get changedValues() {
    let vals: { [s: string]: ComponentInternalValue } = {};
    for (const key in this.__valueComponents) {
      let val = this.__valueComponents[key].changed;
      if (typeof val !== "undefined") vals[key] = val;
    }
    return vals;
  }

  /**Returns true if any of the value components with id has a changed value*/
  get hasChangedValue(): boolean {
    for (const key in this.__valueComponents)
      if (typeof this.__valueComponents[key].changed !== "undefined")
        return true;
    return false;
  }

  /**Updates the internal buffers off all  */
  updateValueBuffers() {
    for (const key in this.__valueComponents)
      this.__valueComponents[key].updateValueBuffer();
  }

  /**Changes the values of all value components with ids*/
  set values(vals: { [s: string]: ComponentValue }) {
    for (const key in vals)
      if (key in this.__valueComponents)
        this.__valueComponents[key].value = vals[key];
  }

  /**Resets the values back to the originally set value before user influence*/
  resetValues() {
    for (const key in this.__valueComponents)
      this.__valueComponents[key].resetValue();
  }
}
defineElement(ComponentGroup);

/**Defines options for group component*/
export type CollapsibleGroupComponentOptions = {
  /**If the group should be collapsed*/
  collapsed?: boolean;
} & GroupComponentOptions;

export class CollapsibleComponentGroup extends ComponentGroup<CollapsibleGroupComponentOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "collapsible-group";
  }

  __collapser: HTMLElement;
  __text: HTMLElement;
  __collapsed: boolean = false;

  constructor() {
    super();
    this.appendChild((this.__container = document.createElement("div")));
    this.appendChild(
      (this.__collapser = document.createElement("span"))
    ).tabIndex = 0;
    this.__collapser.appendChild((this.__text = document.createElement("div")));
    this.__collapser.appendChild(unfold_less());
    this.__collapser.onclick = () => {
      this.collapsed = !this.collapsed;
    };
    this.__collapser.onkeyup = (e) => {
      switch (e.key) {
        case " ":
        case "Enter": {
          this.collapsed = !this.collapsed;
        }
      }
    };
  }

  options(options: CollapsibleGroupComponentOptions): this {
    super.options(options);
    if (typeof options.collapsed === "boolean")
      this.collapsed = options.collapsed;
    return this;
  }

  /**This sets if the group should be collapsed*/
  set collapsed(col: boolean) {
    if (col) {
      this.__container.classList.add("collapsed");
      this.__collapser.replaceChild(unfold_more(), this.__collapser.lastChild!);
    } else {
      this.__container.classList.remove("collapsed");
      this.__collapser.replaceChild(unfold_less(), this.__collapser.lastChild!);
    }
    this.__collapsed = Boolean(col);
  }

  protected __onAccess(a: AccessTypes) {
    super.__onAccess(a);
    switch (a) {
      case AccessTypes.READ: {
        this.__collapser.onfocus = () => {
          document.body.focus();
        };
        break;
      }
      case AccessTypes.WRITE: {
        this.__collapser.onfocus = null;
        break;
      }
    }
  }

  /**This gets if the group is collapsed*/
  get collapsed(): boolean {
    return this.__collapsed;
  }

  /**Set text of collapser button*/
  set text(text: string) {
    this.__text.innerHTML = text;
  }
}
defineElement(CollapsibleComponentGroup);
