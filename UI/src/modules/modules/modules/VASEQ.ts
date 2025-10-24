import { ModuleSelectorOpener } from "@components/moduleSelector";
import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { defineElement } from "@libBase";
import {
  Button,
  DropDown,
  InputBox,
  InputBoxTypes,
  ToggleSwitch,
} from "@libComponents";
import { ListCellComponents, ListContainer, ListRow } from "@libLister";
import {
  ModuleValueAccessEnum,
  ModuleValueTypeEnum,
  type ModuleBase,
} from "@modCommon";
import { Module, registerModule } from "@module/module";
import { ModuleFilter } from "@module/moduleFilter";
import { ModuleValueTypeShortIndex } from "@module/types";

export class VASEQ extends Module {
  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return (_val: any[]) => {
      return "Value Sequence";
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
    return new Editor().options(options);
  }
}
registerModule("VASEQ", VASEQ);

let filter = new ModuleFilter({
  feature: { value: ModuleValueAccessEnum.OUTPUT },
});

type Step = { time: number; value: [string, number | boolean | string] };
type Sequence = { name: string; steps: Step[] };

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "vaseq";
  }

  private __sequences: Sequence[] = [];
  private __output: ModuleSelectorOpener;
  private __sequenceSelector: DropDown;
  private __name: InputBox;
  private __amount: InputBox;
  private __list: ListContainer;
  private __lastSelected?: number;

  constructor() {
    super();
    this.group.addComponent(
      (this.__output = new ModuleSelectorOpener().options({
        text: "Module to move value to",
        filter: filter,
        access: this.userAccess,
        change: () => {
          this.__updatelist();
        },
      }))
    );

    this.group.addComponent(
      (this.__sequenceSelector = new DropDown().options({
        text: "Sequence",
        change: () => {
          this.__select();
        },
      }))
    );

    this.group.appendChild(
      (this.__name = new InputBox().options({
        text: "Sequence Name",
        type: InputBoxTypes.TEXT,
        change: () => {
          this.__clear();
          this.__sequences[Number(this.__sequenceSelector.value)].name = String(
            this.__name.value
          );
          this.__update();
        },
      }))
    );

    this.group.appendChild(
      (this.__amount = new InputBox().options({
        text: "Amount Of Steps",
        type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
        max: 200,
        min: 0,
        change: () => {
          let steps =
            this.__sequences[Number(this.__sequenceSelector.value)].steps;
          if (Number(this.__amount.value!) > steps.length) {
            let newSteps = new Array(
              Number(this.__amount.value!) - steps.length
            )
              .fill({})
              .map(() => {
                return { time: 0, value: ["", 0] } as Step;
              });
            steps.push(...newSteps);
          } else if (Number(this.__amount.value!) < steps.length) {
            steps.splice(
              Number(this.__amount.value!),
              steps.length - Number(this.__amount.value!)
            );
          }
          this.__updatelist();
        },
      }))
    );

    this.group.appendChild(
      (this.__list = new ListContainer().options({
        sizeable: false,
        header: ["Time", "Value"],
      }))
    );
    this.group.addComponent(
      new Button().options({
        text: "Add Sequence After",
        click: () => {
          this.__clear();
          if (this.__sequences.length < 200) {
            this.__sequences.splice(
              Number(this.__sequenceSelector.value) + 1,
              0,
              {
                name: "No Name",
                steps: [],
              }
            );
            this.__update();
          }
        },
        access: this.userAccess,
      })
    );
    this.group.addComponent(
      new Button().options({
        text: "Remove Selected Sequence",
        click: () => {
          if (this.__sequences.length > 1) {
            this.__clear();
            this.__lastSelected = Number(this.__sequenceSelector.value) - 1;
            this.__sequences.splice(Number(this.__sequenceSelector.value), 1);
            this.__update();
            this.__select();
          }
        },
        access: this.userAccess,
      })
    );
  }

  /** Updates special values from the module*/
  protected __newConfigs(values: { output: number; sequences: Sequence[] }) {
    let selected = this.__sequenceSelector.value || 0;
    let module = this.__module!.manager.getModuleByUID(values.output);
    if (module) {
      this.__output.value = module;
    }
    this.__sequences = values.sequences.map((e) => {
      return {
        name: e.name,
        steps: e.steps.map((e) => {
          return { ...e };
        }),
      };
    });
    if (this.__sequences.length === 0) {
      this.__sequences.push({ name: "No Name", steps: [] });
    }
    this.__update();
    this.__sequenceSelector.value = selected;
    this.__select();
  }

  private __clear() {
    this.__lastSelected = Number(this.__sequenceSelector.value);
    this.__sequences.forEach((_e, i) => {
      this.__sequenceSelector.removeOption(i);
    });
  }

  private __update() {
    this.__sequenceSelector.selectorOptions = [...this.__sequences].map(
      (e, i) => {
        return { text: e.name, value: i };
      }
    );
    this.__sequenceSelector.value = 0;
    if (typeof this.__lastSelected !== "undefined") {
      this.__sequenceSelector.value = this.__lastSelected;
      delete this.__lastSelected;
    }
  }

  private __select() {
    let sequence = this.__sequences[Number(this.__sequenceSelector.value)];
    this.__name.value = sequence.name;
    this.__amount.value = sequence.steps.length;
    this.__updatelist();
  }

  private __updatelist() {
    let steps = this.__sequences[Number(this.__sequenceSelector.value)].steps;
    let type: ModuleValueTypeEnum = ModuleValueTypeEnum.Null;
    let unit = "";
    let module = this.__output.value;
    if (module instanceof Module) {
      type = module.value.format;
      unit = module.unit.get;
    }
    this.__list.empty();
    steps.forEach((e) => {
      this.__list.addRow(
        new EditorRow({
          item: e,
          type,
          valUnit: unit,
        })
      );
    });
  }

  /**Sets the module for the setting */
  set module(module: ModuleBase) {
    super.module = module;
    this.__output.manager = module.manager;
  }

  /**Must be set true to show save button */
  get canSave() {
    return true;
  }

  /** Saves the given data */
  __saveSettings() {
    let module = this.__output.value;
    if (module instanceof Module) {
      let type = module.value.format;
      this.__sequences.forEach((e) => {
        e.steps.forEach((e) => {
          e.value[0] = ModuleValueTypeShortIndex[type];
          switch (type) {
            case ModuleValueTypeEnum.SIG32:
            case ModuleValueTypeEnum.SIG64:
            case ModuleValueTypeEnum.UNS32:
            case ModuleValueTypeEnum.UNS64:
              e.value[1] = parseInt(String(e.value[1])) || 0;
              break;
            case ModuleValueTypeEnum.FLT32:
              e.value[1] = Number(e.value[1]) || 0;
              break;
            case ModuleValueTypeEnum.DIG:
              e.value[1] = Boolean(e.value[1]);
              break;
          }
        });
      });
    }
    if (module instanceof Module)
      this.__saveSend({ output: module.uid, sequences: this.__sequences });
    else this.__saveSend({ sequences: this.__sequences });
  }

  defaultName() {
    return "Value Sequencer Editor";
  }
}
defineElement(Editor);

/**Options for row*/
type EditorRowOptions = {
  item: Step;
  type: number;
  valUnit: string;
};

class EditorRow extends ListRow {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-settings-vaseq-row";
  }
  static elementNameSpace() {
    return "lmui";
  }

  __time: InputBox;
  __value: InputBox | ToggleSwitch;

  constructor(options: EditorRowOptions) {
    super();
    this.__time = new InputBox().options({
      value: options.item.time,
      type: InputBoxTypes.NUMBER,
      min: 0,
      max: 1000000,
      unit: "s",
      change: () => {
        options.item.time = Number(this.__time.value);
      },
    });
    this.addCell(
      new ListCellComponents().options({ components: [this.__time] })
    );
    switch (options.type) {
      case ModuleValueTypeEnum.SIG32:
      case ModuleValueTypeEnum.SIG64:
      case ModuleValueTypeEnum.UNS32:
      case ModuleValueTypeEnum.UNS64:
        this.__value = new InputBox().options({
          value: options.item.value[1],
          type: InputBoxTypes.NUMBERWHOLE,
          unit: options.valUnit,
          change: () => {
            options.item.value[0] = ModuleValueTypeShortIndex[options.type];
            options.item.value[1] = this.__value.value as number;
          },
        });
        this.addCell(
          new ListCellComponents().options({ components: [this.__value] })
        );
        break;
      case ModuleValueTypeEnum.FLT32:
        this.__value = new InputBox().options({
          value: options.item.value[1],
          type: InputBoxTypes.NUMBER,
          unit: options.valUnit,
          change: () => {
            options.item.value[0] = ModuleValueTypeShortIndex[options.type];
            options.item.value[1] = this.__value.value as number;
          },
        });
        this.addCell(
          new ListCellComponents().options({ components: [this.__value] })
        );
        break;
      case ModuleValueTypeEnum.DIG:
      default:
        this.__value = new ToggleSwitch().options({
          value: options.item.value[1],
          change: () => {
            options.item.value[0] = ModuleValueTypeShortIndex[options.type];
            options.item.value[1] = this.__value.value as boolean;
          },
        });
        this.addCell(
          new ListCellComponents().options({
            components: [this.__value],
          })
        );
        break;
    }
  }
}
defineElement(EditorRow);
