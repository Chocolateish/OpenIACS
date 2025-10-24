import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { defineElement } from "@libBase";
import { InputBox, InputBoxTypes } from "@libComponents";
import { Err, Ok, type Result } from "@libResult";
import { registerModule } from "@module/module";
import { DTSRC, type DTSRCPreConfig } from "./DTSRC";

type DTSCFPreConfig = {
  ipAddress: string;
} & DTSRCPreConfig;

export class DTSCF extends DTSRC {
  readonly ipAddress: string = "";

  preConfigTransform(
    configs: Partial<DTSCFPreConfig>
  ): Result<DTSCFPreConfig, string> {
    let config = super.preConfigTransform(configs);
    if (config.err) return config;
    if (typeof configs["ipAddress"] !== "number")
      return Err("Invalid or missing ipAddress");
    //@ts-expect-error
    this.ipAddress = configs["ipAddress"];
    return Ok({
      ...config.value,
      ipAddress: configs["ipAddress"],
    });
  }

  /**Returns if the module has status value to be read */
  get hasStatusValues(): boolean {
    return true;
  }

  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return (values: any[]) => {
      return `IP:${this.ipAddress} ${values[0] ? " Connected" : ""} ${
        this.self ? "This Client" : ""
      }`;
    };
  }

  /**Returns whether the module has settings*/
  get hasSettings(): boolean {
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
registerModule("DTSCF", DTSCF);

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-editor-dtscf";
  }

  ipAddress: InputBox;

  constructor() {
    super();
    this.group.addComponent(
      (this.ipAddress = new InputBox().options({
        id: "ipAddress",
        text: "Ip address of client",
        type: InputBoxTypes.IP,
        access: this.userAccess,
      }))
    );
  }

  /**Must be set true to show save button */
  get canSave(): boolean {
    return true;
  }

  protected defaultName(): string {
    return "Fixed Client Editor";
  }
}
defineElement(Editor);
