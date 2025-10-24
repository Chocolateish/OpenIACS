import { material_content_add_rounded } from "@chocolatelibui/icons";
import { defineElement } from "@libBase";
import { Button } from "@libComponents";
import {
  ListCell,
  ListCellComponents,
  ListCellText,
  ListContainer,
  ListRow,
} from "@libLister";
import { Content, type ContentBaseOptions } from "@libUI";
import "./moduleAdder.scss";

/**Defines base options for module adder*/
export type ModuleAdderBaseOptions = {
  /**Sub modules to add */
  subs: { [name: string]: { s: SVGElement; f: () => void } | (() => void) };
} & ContentBaseOptions;

export class ModuleAdder extends Content<ModuleAdderBaseOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-adder";
  }

  static elementNameSpace() {
    return "lmui";
  }

  private __list = this.appendChild(
    new ListContainer().options({ sizeable: false })
  );

  /**Options toggeler*/
  options(options: ModuleAdderBaseOptions): this {
    super.options(options);
    if (typeof options.subs === "object") {
      for (const key in options.subs) {
        if (typeof options.subs[key] === "function") {
          this.__list.addRow(
            new ListRow().options({
              cells: [
                new ListCell().options({}),
                new ListCellText().options({ text: key }),
                new ListCellComponents().options({
                  components: [
                    new Button().options({
                      symbol: material_content_add_rounded(),
                      text: "Add",
                      click: options.subs[key],
                    }),
                  ],
                }),
              ],
            })
          );
        } else if (typeof options.subs[key] === "object") {
          this.__list.addRow(
            new ListRow().options({
              cells: [
                new ListCell().options({}),
                new ListCellText().options({ text: key }),
                new ListCellComponents().options({
                  components: [
                    new Button().options({
                      symbol: material_content_add_rounded(),
                      text: "Add",
                      click: options.subs[key].f,
                    }),
                  ],
                }),
              ],
            })
          );
        }
      }
    }
    return this;
  }

  /**Name of content */
  get name(): string {
    return "Sub Module Creation";
  }
}
defineElement(ModuleAdder);
