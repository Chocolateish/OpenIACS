import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { UnitSelectorOpener } from "@components/unitSelector";
import { defineElement } from "@libBase";
import { InputBox, InputBoxTypes } from "@libComponents";
import { registerModule } from "@module/module";
import { VABAS } from "../../VABAS";

export class FILTE extends VABAS {
  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return () => {
      return "Filter";
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
registerModule("FILTE", FILTE);

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "filte";
  }

  readonly amount: InputBox;
  readonly unit: UnitSelectorOpener;

  constructor() {
    super();
    this.group.addComponent(
      (this.amount = new InputBox().options({
        id: "amount",
        text: "Amount of samples to collect ",
        type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
        access: this.userAccess,
      }))
    );
    this.group.addComponent(
      (this.unit = new UnitSelectorOpener().options({
        id: "unit",
        access: this.userAccess,
      }))
    );
  }

  __updateModuleValue() {
    this.unit.value = this.__module!.unit!.get;
  }

  /**Must be set true to show save button */
  get canSave(): boolean {
    return true;
  }

  protected defaultName(): string {
    return "Linear Converter Editor";
  }
}
defineElement(Editor);
