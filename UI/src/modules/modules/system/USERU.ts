import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { defineElement } from "@libBase";
import { sha1 } from "@libCommon";
import { InputBox, InputBoxTypes, ToggleSwitch, Way } from "@libComponents";
import { type USERUBase } from "@modCommon";
import { Module, registerModule } from "@module/module";

export class USERU extends Module implements USERUBase {
  __updateValues(values: any) {
    this.manager.registerUser(this, values["id"]);
  }

  __remove() {
    super.__remove();
    this.manager.deregisterUser(this);
  }

  /**Returns whether the module has settings*/
  get hasSettings() {
    return true;
  }

  /**Returns whether the module has settings*/
  get hasStatusValues() {
    return true;
  }

  /**Generates an instance of the modules setting content*/
  async generateSettingsContent(
    options: ModuleSettingsOptions
  ): Promise<ModuleSettings> {
    //@ts-expect-error
    return new EDITOR().options(options);
  }
}
registerModule("USERU", USERU);

class EDITOR extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-editor-useru";
  }

  private __oldPass: InputBox;
  private __newPass: InputBox;
  constructor() {
    super();
    this.group.addComponent(
      (this.__oldPass = new InputBox().options({
        text: "Old Password (Admin can bypass this)",
        type: InputBoxTypes.PASSWORD,
        length: 40,
        byteLength: 40,
      }))
    );
    this.group.addComponent(
      (this.__newPass = new InputBox().options({
        text: "New Password",
        type: InputBoxTypes.PASSWORD,
        length: 40,
        byteLength: 40,
      }))
    );
    this.group.addComponent(
      new ToggleSwitch().options({
        id: "needUser",
        text: "Does user require username to be entered to login",
        way: Way.LEFT,
      })
    );
  }

  get canSave() {
    return true;
  }

  __saveSettings() {
    let values = this.group.values;
    if (this.__newPass.value) {
      values["oldPass"] = this.__oldPass.value
        ? sha1(String(this.__oldPass.value))
        : "";
      values["password"] = sha1(String(this.__newPass.value));
    }
    this.__oldPass.value = "";
    this.__newPass.value = "";
    this.__saveSend(values);
  }
}
defineElement(EDITOR);
