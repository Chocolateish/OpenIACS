import { ModuleAdder } from "@components/moduleAdder";
import { Module, registerModule } from "@module/module";

export class USVRE extends Module {
  get name() {
    return "Virtual IO";
  }

  /**Whether the module can add sub modules*/
  get canAddSubModules(): boolean {
    return true;
  }

  /**Provides list of sub modules available for the module*/
  subModuleAdder(): ModuleAdder {
    return new ModuleAdder().options({
      subs: {
        Group: () => {
          this.subModuleAdd("GROUP", {});
        },
        "Virtual Value": () => {
          this.subModuleAdd("USVAL", {});
        },
      },
    });
  }
}
registerModule("USVRE", USVRE);
