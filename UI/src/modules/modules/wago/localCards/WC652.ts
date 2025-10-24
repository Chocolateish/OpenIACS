import { ModuleAdder } from "@components/moduleAdder";
import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { defineElement } from "@libBase";
import { DropDown, InputBox, InputBoxTypes } from "@libComponents";
import { registerModule } from "@module/module";
import { WCARD } from "./generics";

export class WC652 extends WCARD {
  /**Provides list of sub modules available for the module*/
  subModuleAdder(): ModuleAdder {
    return new ModuleAdder().options({
      subs: {
        Modbus: () => {
          this.subModuleAdd("MBSER", {});
        },
        NMEA0183: () => {
          this.subModuleAdd("NMEAS", {});
        },
      },
    });
  }

  /**Whether the module can add sub modules */
  get canAddSubModules(): boolean {
    return true;
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
registerModule("WC652", WC652);

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "wc652";
  }

  physical = this.group.addComponent(
    new DropDown().options({
      id: "physical",
      text: "Physical interface mode",
      options: [
        { text: "RS232 Half Duplex (Two Wires)", value: 1 },
        { text: "RS422 Full Duplex (Four Wires)", value: 2 },
        { text: "RS423 Half Duplex (Two Wires)", value: 3 },
        { text: "RS485 Half Duplex (Two Wires)", value: 4 },
        { text: "RS485 Full Duplex (Four Wires)", value: 5 },
        { text: "DMX", value: 6 },
      ],
      access: this.userAccess,
    })
  );
  baudrate = this.group.addComponent(
    new InputBox().options({
      id: "baudrate",
      text: "Baudrate for communication, or bits/seconds",
      type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
      min: 1,
      max: 307200,
      unit: "bps",
      access: this.userAccess,
    })
  );
  dataBits = this.group.addComponent(
    new InputBox().options({
      id: "dataBits",
      text: "Amount of bits for each peice of data",
      type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
      min: 5,
      max: 8,
      access: this.userAccess,
    })
  );
  parity = this.group.addComponent(
    new DropDown().options({
      id: "parity",
      text: "Parity for connection",
      options: [
        { text: "None", value: 1 },
        { text: "Odd", value: 2 },
        { text: "Even", value: 3 },
      ],
      access: this.userAccess,
    })
  );
  stopBit = this.group.addComponent(
    new DropDown().options({
      id: "stopBit",
      text: "How many stop bits",
      options: [
        { text: "None", value: 1 },
        { text: "Minimum", value: 2 },
        { text: "1", value: 3 },
        { text: "1.5", value: 4 },
        { text: "2", value: 5 },
        { text: "Maximum", value: 255 },
      ],
      access: this.userAccess,
    })
  );
  handshake = this.group.addComponent(
    new DropDown().options({
      id: "handshake",
      text: "Handshake for serial communication",
      options: [
        { text: "None", value: 1 },
        { text: "XON XOFF", value: 2 },
        { text: "DTE, listens for: CTS; drives: RTS, DTR", value: 3 },
        { text: "DCE, drives: CTS, DSR, DCD, RI; listens on: RTS", value: 4 },
        {
          text: "DTE, listens for: DSR, DCD, RI; drives: RTS, DTR",
          value: 5,
        },
        {
          text: "DCE, drives: CTS, DSR, DCD, RI; listens on: DTR.",
          value: 6,
        },
        { text: "RTS Lead Time, Special functionality of 750-652", value: 7 },
      ],
      access: this.userAccess,
    })
  );

  protected defaultName(): string {
    return "Serial Interface Editor";
  }

  /**Must be set true to show save button*/
  get canSave(): boolean {
    return true;
  }

  /**Whether the module can add sub modules*/
  get canAddSubModules(): boolean {
    return true;
  }
}
defineElement(Editor);
