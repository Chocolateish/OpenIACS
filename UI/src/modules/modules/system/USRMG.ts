import { ModuleAdder } from "@components/moduleAdder";
import { Module, registerModule } from "@module/module";

export class USRMG extends Module {
  get name() {
    return "User Management";
  }

  /**Whether the module can add sub modules*/
  get canAddSubModules(): boolean {
    return true;
  }

  /**Provides list of sub modules available for the module*/
  subModuleAdder(): ModuleAdder {
    return new ModuleAdder().options({
      subs: {
        User: () => {
          this.subModuleAdd("USERU", {});
        },
      },
    });
  }
}
registerModule("USRMG", USRMG);
