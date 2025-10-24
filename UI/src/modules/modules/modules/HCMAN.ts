import { ModuleAdder } from "@components/moduleAdder";
import { Module, registerModule } from "@module/module";

export class HCMAN extends Module {
  get name() {
    return "Hour Counters";
  }

  /**Whether the module can add sub modules
   * @returns {boolean} */
  get canAddSubModules() {
    return true;
  }

  /**Provides list of sub modules available for the module*/
  subModuleAdder(): ModuleAdder {
    return new ModuleAdder().options({
      subs: {
        "Hour Counter": () => {
          this.subModuleAdd("HCOUN", {});
        },
      },
    });
  }
}
registerModule("HCMAN", HCMAN);
