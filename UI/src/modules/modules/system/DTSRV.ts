import { ModuleAdder } from "@components/moduleAdder";
import { Module, registerModule } from "@module/module";

export class DTSRV extends Module {
  get name() {
    return "Client/Web Server";
  }

  /**Provides list of sub modules available for the module*/
  subModuleAdder(): ModuleAdder {
    return new ModuleAdder().options({
      subs: {
        "Fixed Client": () => {
          this.subModuleAdd("DTSCF", {});
        },
      },
    });
  }

  /**Whether the module can add sub modules*/
  get canAddSubModules(): boolean {
    return true;
  }
}
registerModule("DTSRV", DTSRV);
