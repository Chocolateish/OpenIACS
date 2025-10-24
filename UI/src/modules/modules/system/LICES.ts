import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { AccessTypes, defineElement } from "@libBase";
import { secondsCountDownFormatted } from "@libCommon";
import { Button, InputBox, InputBoxTypes } from "@libComponents";
import { Err, Ok, type Result } from "@libResult";
import { ValueProxy } from "@libValues";
import { registerModule } from "@module/module";
import { VABAS } from "../VABAS";

type LICESPreConfig = {
  macAddress: string;
  currentLicense: string;
};

export class LICES extends VABAS {
  readonly macAddress: string = "";
  readonly currentLicense: string = "";

  preConfigTransform(
    configs: Partial<LICESPreConfig>
  ): Result<LICESPreConfig, string> {
    if (typeof configs["macAddress"] !== "string")
      return Err("Invalid or missing macaddress");
    if (typeof configs["currentLicense"] !== "string")
      return Err("Invalid or missing currentLicense");
    //@ts-expect-error
    this.macAddress = configs["macAddress"];
    //@ts-expect-error
    this.currentLicense = configs["currentLicense"];
    return Ok({
      macAddress: configs["macAddress"],
      currentLicense: configs["currentLicense"],
    });
  }

  get name() {
    return "License System";
  }

  /**Returns if the module has status value to be read */
  get hasStatusValues(): boolean {
    return true;
  }

  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return (values: any[]) => {
      return values[1]
        ? values[2]
          ? "Unlimited"
          : "Time Left:" + secondsCountDownFormatted(values[0], 2)
        : "No Valid License";
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
registerModule("LICES", LICES);

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-editor-lices";
  }

  newLic: InputBox;
  newLicSend: Button;
  time: InputBox;

  constructor() {
    super();
    this.group.addComponent(
      new InputBox().options({
        id: "currentLicense",
        text: "Current License",
        type: InputBoxTypes.TEXT,
        access: AccessTypes.READ,
      })
    );
    this.group.addComponent(
      (this.newLic = new InputBox().options({
        text: "New License",
        type: InputBoxTypes.TEXT,
        access: AccessTypes.WRITE,
      }))
    );
    this.group.addComponent(
      (this.newLicSend = new Button().options({
        text: "Use License",
        click: () => {
          this.__module!.command({
            license: String(this.newLic.value!).replace(/\s/g, ""),
          });
          this.newLic.value = "";
        },
        access: AccessTypes.WRITE,
      }))
    );
    this.group.addComponent(
      (this.time = new InputBox().options({
        text: "Time Left",
        value: new ValueProxy(this.status, (vals = [0, 0, 0]) => {
          return vals[1]
            ? vals[2]
              ? "Unlimited"
              : secondsCountDownFormatted(vals[0], 4)
            : "No Valid License";
        }),
        type: InputBoxTypes.TEXT,
        access: AccessTypes.READ,
      }))
    );

    this.group.addComponent(
      new InputBox().options({
        id: "macaddress",
        text: "MAC Address",
        type: InputBoxTypes.TEXT,
        access: AccessTypes.READ,
      })
    );
    this.group.addComponent(
      new Button().options({
        text: "Revoke License",
        click: () => {
          this.__module!.command({ revoke: true });
        },
        access: this.adminAccess,
      })
    );
  }

  protected defaultName(): string {
    return "License Setup";
  }
}
defineElement(Editor);
