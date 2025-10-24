import { ModuleAdder } from "@components/moduleAdder";
import { registerModule } from "@module/module";
import { VABAS } from "../../VABAS";

// NMEA Taker
export class NMTAK extends VABAS {
  /**Provides list of sub modules available for the module*/
  subModuleAdder(): ModuleAdder {
    return new ModuleAdder().options({
      subs: {
        GGA: () => {
          this.subModuleAdd("NMEAG", { type: "GGA" });
        },
        GLL: () => {
          this.subModuleAdd("NMEAG", { type: "GLL" });
        },
        HDG: () => {
          this.subModuleAdd("NMEAG", { type: "HDG" });
        },
        HDT: () => {
          this.subModuleAdd("NMEAG", { type: "HDT" });
        },
        HRM: () => {
          this.subModuleAdd("NMEAG", { type: "HRM" });
        },
        MWV: () => {
          this.subModuleAdd("NMEAG", { type: "MWV" });
        },
        RMC: () => {
          this.subModuleAdd("NMEAG", { type: "RMC" });
        },
        ROT: () => {
          this.subModuleAdd("NMEAG", { type: "ROT" });
        },
        THS: () => {
          this.subModuleAdd("NMEAG", { type: "THS" });
        },
        VBW: () => {
          this.subModuleAdd("NMEAG", { type: "VBW" });
        },
        VTG: () => {
          this.subModuleAdd("NMEAG", { type: "VTG" });
        },
        VWR: () => {
          this.subModuleAdd("NMEAG", { type: "VWR" });
        },
      },
    });
  }
}
registerModule("NMTAK", NMTAK);
