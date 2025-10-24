import {
  Condition,
  type ConditionEventTypes,
  conditionNextTypes,
  conditionTypes,
  SubCondition,
} from "@ioSystem/condition";
import { AccessTypes, defineElement } from "@libBase";
import {
  Button,
  Component,
  type ComponentBaseOptions,
  ComponentGroup,
  ComponentGroupBorderStyle,
  type ComponentInternalValue,
  DropDown,
  InputBox,
  InputBoxTypes,
  Way,
} from "@libComponents";
import type { ESubscriber } from "@libEvent";
import { delete_, expand_less, expand_more } from "@libIcons";
import {
  ListCellComponents,
  ListContainer,
  ListRow,
  type ListRowOptions,
} from "@libLister";
import { promptResult } from "@libPrompts";
import { Ok } from "@libResult";
import { stateOk, type StateRead } from "@libState";
import {
  Content,
  type ContentBase,
  type ContentBaseOptions,
  getWindowManagerFromElement,
  UIWindow,
} from "@libUI";
import { type ValueListener } from "@libValues";
import { ModuleValueAccessEnum } from "@modCommon";
import { Module } from "@module/module";
import { ModuleFilter } from "@module/moduleFilter";
import "./conditionEditor.scss";
import { ModuleSelectorOpener } from "./moduleSelector";

let filter = new ModuleFilter({
  feature: { value: ModuleValueAccessEnum.INPUT },
});

/**Defines options for condition editor*/
type ConditionEditorOptions = {
  /**Condition to edit, when unset, a new condition is created */
  condition?: Condition;
} & ContentBaseOptions;

export class ConditionEditor extends Content<ConditionEditorOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "condition-editor";
  }

  static elementNameSpace() {
    return "lmui";
  }

  /** Proxy access for components*/
  private __access = stateOk<AccessTypes>(Ok(AccessTypes.NONE));
  private __list = this.appendChild(
    new ListContainer().options({
      header: ["State", "Module", "Condition", "Value", "Next", "Edit"],
      sizeable: false,
    })
  );
  private save = this.appendChild(
    new ComponentGroup().options({
      way: Way.DOWN,
      position: Way.DOWN,
      border: ComponentGroupBorderStyle.OUTSET,
    })
  );
  private __state: Button;
  private __condition?: Condition;
  private __subAddedListener: ESubscriber<
    "subAdded",
    Condition,
    ConditionEventTypes["subAdded"]
  > = (ev) => {
    this.__list.addRow(
      new SubConditionRow().options({
        sub: ev.data.sub,
        access: this.__access,
      }),
      ev.data.index
    );
    return false;
  };
  private __subRemoveListener: ESubscriber<
    "subRemoved",
    Condition,
    ConditionEventTypes["subRemoved"]
  > = (ev) => {
    this.__list.removeRow(ev.data.index);
    return false;
  };
  private __subMoveListener: ESubscriber<
    "subMoved",
    Condition,
    ConditionEventTypes["subMoved"]
  > = (ev) => {
    this.__list.addRow(this.__list.removeRow(ev.data.oldIndex), ev.data.index);
    return false;
  };

  constructor() {
    super();
    this.save.addComponent(
      new Button().options({
        text: "Ok",
        click: () => {
          this.close({ code: "ok", condition: this.__condition });
        },
        access: this.__access,
      })
    );
    this.save.addComponent(
      new Button().options({
        text: "Add Condition",
        click: () => {
          promptResult({
            result: this.__condition!.addSubCondition(),
            showSuccess: false,
          });
        },
        access: this.__access,
      })
    );
    this.save.addComponent(
      (this.__state = new Button().options({
        text: "State: ",
        access: AccessTypes.READ,
      }))
    );
  }

  connectedCallback() {
    this.__reFillList();
    if (this.__condition) {
      this.__condition.events.on("subAdded", this.__subAddedListener!);
      this.__condition.events.on("subRemoved", this.__subRemoveListener!);
      this.__condition.events.on("subMoved", this.__subMoveListener!);
    }
  }

  disconnectedCallback() {
    if (this.__condition) {
      this.__condition.events.off("subAdded", this.__subAddedListener!);
      this.__condition.events.off("subRemoved", this.__subRemoveListener!);
      this.__condition.events.off("subMoved", this.__subMoveListener!);
    }
  }

  /**Options toggeler*/
  options(options: ConditionEditorOptions): this {
    super.options(options);
    if (options.condition instanceof Condition)
      this.condition = options.condition;
    else this.condition = new Condition();
    return this;
  }

  /**Empties and fill the list of sub conditions*/
  private __reFillList() {
    this.__list.empty();
    if (this.__condition)
      for (const sub of this.__condition.subConditions)
        this.__list.addRow(
          new SubConditionRow().options({ sub: sub, access: this.__access })
        );
  }

  protected __onAccess(_access: AccessTypes): void {
    super.__onAccess(_access);
    this.__access.set(Ok(_access));
  }

  /**Sets the condition*/
  set condition(cond: Condition) {
    if (this.__condition) {
      this.__condition.events.off("subAdded", this.__subAddedListener);
      this.__condition.events.off("subRemoved", this.__subRemoveListener);
      this.__condition.events.off("subMoved", this.__subMoveListener);
    }

    this.__state.value = cond;
    this.__condition = cond;

    if (this.isConnected) {
      this.__condition.events.on("subAdded", this.__subAddedListener);
      this.__condition.events.on("subRemoved", this.__subRemoveListener);
      this.__condition.events.on("subMoved", this.__subMoveListener);
    }
  }
}
defineElement(ConditionEditor);

let subConditionOptions = conditionTypes.map((e) => {
  return { text: e.name, value: e.value };
});
let nextConditionOptions = conditionNextTypes.map((e) => {
  return { text: e.name, value: e.value };
});

/**Options for condtition row*/
type SubConditionRowOptions = {
  /**Sub condition for row */
  sub: SubCondition;
} & ListRowOptions;

class SubConditionRow extends ListRow<SubConditionRowOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "sub-condition-row";
  }
  static elementNameSpace() {
    return "lmui";
  }

  private proxaccess = stateOk<AccessTypes>(Ok(AccessTypes.NONE));
  private __condition: DropDown;
  private __valueCell: InputBox;
  private __next: DropDown;
  private __sub?: SubCondition;
  private __state: any;
  private __module: any;

  constructor() {
    super();
    this.addCell(
      new ListCellComponents().options({
        components: [
          (this.__state = new Button().options({ access: AccessTypes.READ })),
        ],
      })
    );
    this.addCell(
      new ListCellComponents().options({
        components: [
          (this.__module = new ModuleSelectorOpener().options({
            id: "condition",
            filter: filter,
            access: this.proxaccess,
          })),
        ],
      })
    );
    this.addCell(
      new ListCellComponents().options({
        components: [
          (this.__condition = new DropDown().options({
            id: "condition",
            options: subConditionOptions,
            default: "Select Condition",
            access: this.proxaccess,
          })),
        ],
      })
    );
    this.addCell(
      new ListCellComponents().options({
        components: [
          (this.__valueCell = new InputBox().options({
            id: "value",
            type: InputBoxTypes.NUMBER,
            access: this.proxaccess,
          })),
        ],
      })
    );
    this.addCell(
      new ListCellComponents().options({
        components: [
          (this.__next = new DropDown().options({
            id: "next",
            options: nextConditionOptions,
            default: "Select Next",
            access: this.proxaccess,
          })),
        ],
      })
    );
    this.addCell(
      new ListCellComponents().options({
        components: [
          new Button().options({
            symbol: expand_less(),
            click: () => {
              this.__sub!.owner!.addSubCondition(this.__sub, this.index! - 1);
            },
          }),
          new Button().options({
            symbol: expand_more(),
            click: () => {
              this.__sub!.owner!.addSubCondition(this.__sub, this.index! + 1);
            },
          }),
          new Button().options({
            symbol: delete_(),
            click: () => {
              this.__sub!.remove();
            },
          }),
        ],
      })
    );
  }

  protected __onAccess(_access: AccessTypes): void {
    super.__onAccess(_access);
    this.proxaccess.set(Ok(_access));
  }

  /**Sets options of row*/
  options(options: SubConditionRowOptions): this {
    super.options(options);
    if (options.sub) this.subCondition = options.sub;
    return this;
  }

  set subCondition(sub: SubCondition) {
    this.__sub = sub;
    this.__state.value = sub;
    this.__module.value = sub.module;
    this.__condition.value = sub.condition;
    this.__valueCell.value = sub.value;
    this.__next.value = sub.next;
  }
}
defineElement(SubConditionRow);

/**Defines options for the condition editor component*/
export type ConditionEditorOpenerOptions = {
  /**Condition to edit */
  condition?: Condition;
  /**Parent to use for editor window */
  parent?: ContentBase;

  editorAccess?: AccessTypes | StateRead<AccessTypes>;

  id?: string;
} & ComponentBaseOptions;

export class ConditionEditorOpener extends Component {
  /**Returns the name used to define the element */
  static elementName() {
    return "condition-editor-opener";
  }
  static elementNameSpace() {
    return "lmui";
  }

  private __button = this.appendChild(document.createElement("div"));
  private __moduleName = this.__button.appendChild(
    document.createElement("div")
  );
  private __moduleValue = this.__button.appendChild(
    document.createElement("div")
  );
  private __editor?: ConditionEditor;
  private __parent?: ContentBase;
  private __condition?: Condition;
  private __editorAccess?: StateRead<AccessTypes> | AccessTypes;
  private __text?: HTMLSpanElement;
  private __val?: Module;
  private __valueListener?: ValueListener;

  constructor() {
    super();
    this.__button.tabIndex = 0;
    this.__button.onclick = () => {
      this.openEditor();
    };
    this.onkeydown = (e) => {
      switch (e.key) {
        case "Enter":
        case " ": {
          e.stopPropagation();
          this.onkeyup = (e) => {
            switch (e.key) {
              case "Enter":
              case " ": {
                e.stopPropagation();
                this.openEditor();
                break;
              }
            }
            this.onkeyup = null;
          };
          break;
        }
      }
    };
  }

  async openEditor() {
    if (!this.__editor) {
      this.__editor = new ConditionEditor().options({
        parent: this.__parent,
        condition: Condition.createCopy(this.__condition!),
        access: this.__editorAccess,
      });
      getWindowManagerFromElement(this).appendWindow(
        new UIWindow().options({
          content: this.__editor,
          width: "60%",
          height: "70%",
        })
      );
      let res = await this.__editor.whenClosed;
      //@ts-expect-error
      if (res && res.code == "ok")
        //@ts-expect-error
        this.__condition!.replaceSubsFromCondition(res.condition);

      delete this.__editor;
      this.__button.focus();
    }
  }

  /**Options toggeler*/
  options(options: ConditionEditorOpenerOptions): this {
    super.options(options);
    if (options.condition) this.condition = options.condition;
    else this.condition = new Condition();
    if (typeof options.parent !== "undefined") this.parent = options.parent;
    if (typeof options.editorAccess !== "undefined")
      this.editorAccess = options.editorAccess;
    return this;
  }

  set editorAccess(ac: AccessTypes | StateRead<AccessTypes>) {
    this.__editorAccess = ac;
    if (this.__editor) this.__editor.accessByState(ac);
  }

  /**Sets the parent content to use for the editor content*/
  set parent(par: ContentBase) {
    this.__parent = par;
    if (this.__editor) {
      this.__editor.parent = par;
    }
  }

  /**Changes the condition*/
  set condition(cond: Condition) {
    this.__condition = cond;
  }

  /**Returns the condition*/
  get condition(): Condition | undefined {
    return this.__condition;
  }

  protected __onAccess(_access: AccessTypes): void {
    super.__onAccess(_access);
  }

  set text(text: string) {
    if (typeof text == "string") {
      if (!this.__text) {
        this.__text = this.insertBefore(
          document.createElement("span"),
          this.firstChild
        );
      }
      this.__text.innerHTML = text;
    } else if (this.__text) {
      this.removeChild(this.__text);
      delete this.__text;
    }
  }

  /**This is called when the user sets the value*/
  private __userSetValue(val: Module, skipEvent: boolean) {
    if (this.__val instanceof Module) {
      if (this.__valueListener) {
        this.__val.value!.removeListener(this.__valueListener);
        delete this.__valueListener;
        this.__moduleValue.innerHTML = "";
      }
    }
    this.__val = val;
    if (this.__val instanceof Module) {
      this.__moduleName.innerHTML = "Click to change: " + val.name;
      if (val.hasValue) {
        this.__valueListener = val.value!.addListener((val) => {
          this.__moduleValue.innerHTML = val.toFixed(3);
        }, true);
      }
    }
    if (!skipEvent) {
      //@ts-expect-error
      if (this.__comVal) {
        //@ts-expect-error
        this.__comVal.setSkip(val, this.__comValLis);
      }
    }
  }

  /**This is called when the program sets the value*/
  protected __programSetValue(val: Module) {
    //@ts-expect-error
    super.__programSetValue(val);
    this.__userSetValue(val, true);
  }

  /**Returns the current value of the button*/
  protected __programGetValue(): ComponentInternalValue {
    return this.__val as any;
  }
}
defineElement(ConditionEditorOpener);
