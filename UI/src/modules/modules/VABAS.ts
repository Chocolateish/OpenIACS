import { ModuleAdder } from "@components/moduleAdder";
import { Module, registerModule } from "@module/module";

export class VABAS<
  PreConfigs extends {} = {},
  Configs extends {} = {}
> extends Module<PreConfigs, Configs> {
  /**Whether the module can add sub modules*/
  get canAddSubModules(): boolean {
    return true;
  }

  /**Provides list of sub modules available for the module*/
  subModuleAdder(): ModuleAdder {
    return new ModuleAdder().options({
      subs: {
        "Linear Converter": () => {
          this.subModuleAdd("LICON", {});
        },
        "Table Converter": () => {
          this.subModuleAdd("TABCO", {});
        },
        Filter: () => {
          this.subModuleAdd("FILTE", {});
        },
        Mover: () => {
          this.subModuleAdd("MOVER", {});
        },
        "Bit Access": () => {
          this.subModuleAdd("BITAC", {});
        },
      },
    });
  }
}
registerModule("VABAS", VABAS);
