import { ModuleAdder } from "@components/moduleAdder";
import { registerModule } from "@module/module";
import { VABAS } from "../../VABAS";

export class NMEAS extends VABAS {
  /**Provides list of sub modules available for the module*/
  subModuleAdder(): ModuleAdder {
    return new ModuleAdder().options({
      subs: {
        GP: () => {
          this.subModuleAdd("NMTAK", { type: "GP" });
        },
        GN: () => {
          this.subModuleAdd("NMTAK", { type: "GN" });
        },
        HC: () => {
          this.subModuleAdd("NMTAK", { type: "HC" });
        },
        HE: () => {
          this.subModuleAdd("NMTAK", { type: "HE" });
        },
        II: () => {
          this.subModuleAdd("NMTAK", { type: "II" });
        },
        VD: () => {
          this.subModuleAdd("NMTAK", { type: "VD" });
        },
        WI: () => {
          this.subModuleAdd("NMTAK", { type: "WI" });
        },
      },
    });
  }

  /**Returns whether the module has settings*/
  get hasSettings() {
    return false;
  }

  /**Returns whether the module has settings*/
  get hasSettingsValues() {
    return false;
  }
}
registerModule("NMEAS", NMEAS);
