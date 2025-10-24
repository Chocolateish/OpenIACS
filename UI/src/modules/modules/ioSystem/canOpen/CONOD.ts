import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { defineElement } from "@libBase";
import { Button, DropDown } from "@libComponents";
import { Err, Ok, type Result } from "@libResult";
import { registerModule } from "@module/module";
import { VABAS } from "../../VABAS";

export let pdoOptionsData = [
  { text: "PDO 1", value: 1 },
  { text: "PDO 2", value: 2 },
  { text: "PDO 3", value: 3 },
  { text: "PDO 4", value: 4 },
];

type CONODPreConfig = {
  id: number;
};

export class CONOD extends VABAS {
  readonly id: number = NaN;

  preConfigTransform(
    configs: Partial<CONODPreConfig>
  ): Result<CONODPreConfig, string> {
    if (typeof configs["id"] !== "number") return Err("Invalid or missing id");
    //@ts-expect-error
    this.id = configs["id"];
    return Ok({
      id: configs["id"],
    });
  }

  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return () => {
      return `CanOpen Node ID:${this.id}`;
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
registerModule("CONOD", CONOD);

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "conod";
  }

  pdo: DropDown;

  constructor() {
    super();
    this.group.addComponent(
      (this.pdo = new DropDown().options({
        id: "pdo",
        text: "Which PDO",
        access: this.userAccess,
        options: pdoOptionsData,
        default: "Select PDO",
      }))
    );
    this.group.addComponent(
      new Button().options({
        text: "Add PDO",
        access: this.userAccess,
        click: () => {
          this.__module!.command({ pdo: this.pdo.value });
        },
      })
    );
  }

  protected defaultName(): string {
    return "Can Open Node Editor";
  }
}
defineElement(Editor);
