import { defineElement } from "@libBase";
import { TextBoxValue } from "@libComponents";
import { ListCellComponents, ListContainer, ListRow } from "@libLister";
import { Content } from "@libUI";
import type { ModuleManager } from "@system/moduleManager";
import { managerListEvents, managers } from "@system/moduleManagerManager";
import "./moduleManagerList.scss";

export class ManagerList extends Content {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-manager-list";
  }
  static elementNameSpace() {
    return "lmui";
  }

  private __list = this.appendChild(
    new ListContainer().options({
      header: ["Name", "IP", "Status", "Version"],
      sizeable: false,
      maxHeight: 200,
    })
  );
  private __managerListerner: any;
  constructor() {
    super();
    this.fillList();
  }

  connectedCallback() {
    this.fillList();
    this.__managerListerner = managerListEvents.on("created", () => {
      this.fillList();
    });
    this.__managerListerner = managerListEvents.on("removed", () => {
      this.fillList();
    });
    this.__managerListerner = managerListEvents.on("masterChanged", () => {
      this.fillList();
    });
  }

  disconnectedCallback() {
    managerListEvents.off("created", this.__managerListerner);
    managerListEvents.off("removed", this.__managerListerner);
    managerListEvents.off("masterChanged", this.__managerListerner);
  }

  /**Recreates the list with all managers*/
  fillList() {
    this.__list.empty();
    managers().forEach(async (e) => {
      this.__list.addRow(await this.makeLine(e));
    });
  }

  /** This generates a list row for the given module manager*/
  async makeLine(manager: ModuleManager): Promise<ListRow> {
    let row = new ListRow().options({
      cells: [
        new ListCellComponents().options({
          components: [
            new TextBoxValue().options({
              value: (await manager.name).unwrap,
            }),
          ],
        }),
        new ListCellComponents().options({
          components: [
            new TextBoxValue().options({
              value: manager.ipAddress,
            }),
          ],
        }),
        new ListCellComponents().options({
          components: [
            new TextBoxValue().options({
              value: false,
            }),
          ],
        }),
        new ListCellComponents().options({
          components: [
            new TextBoxValue().options({
              value: (await manager.version).unwrap,
            }),
          ],
        }),
      ],
    });
    return row;
  }

  /**Name of conent */
  get name(): string {
    return "Systems Editor";
  }
}
defineElement(ManagerList);
