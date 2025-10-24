import type { ContentBase } from "@libUI";
import { Module, registerModule } from "@module/module";

export class GROUP extends Module {
  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return () => {
      return "Group";
    };
  }

  /**Sets the parent of the module*/
  get parent(): Module {
    //@ts-expect-error
    if (this.___parent instanceof GROUP) {
      //@ts-expect-error
      return this.___parent.parent;
    } else {
      //@ts-expect-error
      return this.___parent;
    }
  }

  /**Whether the module can add sub modules*/
  get canAddSubModules(): boolean {
    return true;
  }

  /**Provides list of sub modules available for the module*/
  subModuleAdder(options: any): ContentBase {
    return this.parent.subModuleAdder.bind(this)(options);
  }
}
registerModule("GROUP", GROUP);
