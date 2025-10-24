import { ModuleAdder } from "@components/moduleAdder";
import { registerModule } from "@module/module";
import { WCARD } from "../generics";
export class WC658 extends WCARD {
  /**Provides list of sub modules available for the module*/
  subModuleAdder(): ModuleAdder {
    return new ModuleAdder().options({
      subs: {
        "Mapped Canbus": () => {
          this.subModuleAdd("W658M");
        },
        "Can Open": () => {
          this.subModuleAdd("W658C");
        },
      },
    });
  }

  /**Whether the module can add sub modules*/
  get canAddSubModules(): boolean {
    return true;
  }
}
registerModule("WC658", WC658);
