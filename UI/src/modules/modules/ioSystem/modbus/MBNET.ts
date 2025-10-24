import { ModuleAdder } from "@components/moduleAdder";
import { Module, registerModule } from "@module/module";

export class MBNET extends Module {
  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return () => {
      return "Modbus Ethernet";
    };
  }

  /**Whether the module can add sub modules*/
  get canAddSubModules(): boolean {
    return true;
  }

  /**Provides list of sub modules available for the module*/
  subModuleAdder(): ModuleAdder {
    return new ModuleAdder().options({
      subs: {
        "Modbus TCP": () => {
          this.subModuleAdd("MBTCP", {});
        },
      },
    });
  }
}
registerModule("MBNET", MBNET);
