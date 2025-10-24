import { ModuleAdder } from "@components/moduleAdder";
import { Module, registerModule } from "@module/module";

export class W658M extends Module {
  /**Returns the function used to generate the text*/
  ___statusText() {
    return () => {
      return "Mapped Canbus Values";
    };
  }

  /**Provides list of sub modules available for the module*/
  subModuleAdder(): ModuleAdder {
    return new ModuleAdder().options({
      subs: {
        "Mapped Input": () => {
          this.subModuleAdd("W658I");
        },
        "Mapped Output": () => {
          this.subModuleAdd("W658O");
        },
      },
    });
  }

  /**Whether the module can add sub modules*/
  get canAddSubModules(): boolean {
    return true;
  }
}
registerModule("W658M", W658M);
