import { AccessTypes, defineElement } from "@libBase";
import { InputBox, InputBoxTypes, ToggleSwitch, Way } from "@libComponents";
import { Content, type ContentBaseOptions } from "@libUI";
import { ModuleValueTypeEnum, type ModuleBase } from "@modCommon";
import { Module } from "@module/module";

/**Defines options for unit selector*/
export type ValueChangerOptions = {
  /**Module manager to select units from */
  module: ModuleBase;
} & ContentBaseOptions;

export class ModuleValueChanger extends Content {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-value-changer";
  }
  static elementNameSpace() {
    return "lmui";
  }

  private __inputbox = this.appendChild(
    new InputBox().options({
      type: InputBoxTypes.NUMBER,
      text: "Value",
    })
  );
  private __toggle = this.appendChild(
    new ToggleSwitch().options({ text: "Value", way: Way.RIGHT })
  );
  private __module?: Module;

  /**Options toggeler*/
  options(options: ValueChangerOptions): this {
    super.options(options);
    this.module = options.module;
    return this;
  }

  /**Sets the value the changer changes*/
  set module(mod: ModuleBase) {
    if (mod instanceof Module) {
      this.__module = mod;
      this.name = this.__module.name;
      switch (mod.value!.format) {
        case ModuleValueTypeEnum.DIG:
          this.__inputbox.access = AccessTypes.NONE;
          this.__toggle.access = AccessTypes.WRITE;
          break;
        default:
          this.__inputbox.access = AccessTypes.WRITE;
          this.__toggle.access = AccessTypes.NONE;
          break;
      }
      this.__inputbox.value = mod.value;
      this.__toggle.value = mod.value;
    } else {
      console.warn("None module passed");
    }
  }
}
defineElement(ModuleValueChanger);
