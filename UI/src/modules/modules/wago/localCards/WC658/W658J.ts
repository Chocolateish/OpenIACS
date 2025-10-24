import { ModuleAdder } from "@components/moduleAdder";
import { InputBoxTypes } from "@libComponents";
import { promptInput } from "@libPrompts";
import { Module, registerModule } from "@module/module";

export class W658J extends Module {
  get name() {
    return "J1939";
  }

  /**Whether the module can add sub modules*/
  get canAddSubModules() {
    return true;
  }

  subModuleAdder() {
    return new ModuleAdder().options({
      subs: {
        "Source Address": async () => {
          let input2 = promptInput({
            input: { type: InputBoxTypes.NUMBERWHOLEPOSITIVE, max: 255 },
            title: "Source ID",
          });
          let source = await input2.promise;
          this.subModuleAdd("J19SA", { id: source.data });
        },
      },
    });
  }
}
registerModule("W658J", W658J);
