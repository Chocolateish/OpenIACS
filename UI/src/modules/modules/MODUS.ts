import { ModuleAdder } from "@components/moduleAdder";
import { Module, registerModule } from "@module/module";

export class MODUS extends Module {
  get name() {
    return "Functionality Modules";
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
        "Driver (Pump/Fan/Motor/eg.)": () => {
          this.subModuleAdd("DRIVE", {});
        },
        "Junction (Switch/Valve/eg.)": () => {
          this.subModuleAdd("JUNCT", {});
        },
        "Value Sequencer": () => {
          this.subModuleAdd("VASEQ", {});
        },
        "Condition Delayer": () => {
          this.subModuleAdd("CODEL", {});
        },
      },
    });
  }
}
registerModule("MODUS", MODUS);
