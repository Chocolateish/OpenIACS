import { AccessTypes, defineElement } from "@libBase";
import {
  Button,
  DropDown,
  InputBox,
  InputBoxTypes,
  ToggleSwitch,
  Way,
} from "@libComponents";
import type { ESubscriber } from "@libEvent";
import { add, delete_ } from "@libIcons";
import {
  ListCellComponents,
  ListCellText,
  ListContainer,
  ListRow,
} from "@libLister";
import { promptInput, promptResult } from "@libPrompts";
import { Content } from "@libUI";
import { ModuleManager } from "@system/moduleManager";
import {
  addManager,
  changeMaster,
  managerListEvents,
  managers,
  removeManager,
} from "@system/moduleManagerManager";
import { connectionTypeList, connectionTypeListAdmin } from "@system/types";
import "./moduleManagerEditor.scss";

export class ManagerEditor extends Content {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-manager-editor";
  }
  static elementNameSpace() {
    return "lmui";
  }

  private __list = this.appendChild(
    new ListContainer().options({
      header: [],
      sizeable: false,
      maxHeight: 200,
    })
  );
  private __manListenerCreated?: ESubscriber<"created", {}, any>;
  private __manListenerRemoved?: ESubscriber<"removed", {}, any>;
  private __manListenerMasterChanged?: ESubscriber<"masterChanged", {}, any>;
  private __hasAdmin: boolean = false;

  constructor() {
    super();
    managers().forEach((manager) => {
      if (manager.user === 1) {
        this.__hasAdmin = true;
        return;
      }
      this.__hasAdmin = false;
    });

    this.__list.header = [
      "Name",
      "IP Address",
      "Perma-nent",
      "Main System",
      "Connection Type",
      "Remove",
      ...(this.__hasAdmin ? ["Simulated IP"] : []),
    ];

    this.appendChild(
      new Button().options({
        text: "Add Manager",
        symbol: add(),
        click: async () => {
          let res = await promptInput({
            text: "Ip address of system",
            buttonText: "Add",
            input: { type: InputBoxTypes.IP },
          }).promise;
          if (res.code == "enter") {
            //@ts-expect-error
            promptResult({ result: addManager({ ipAddress: res.data }) });
          }
        },
      })
    );
    this.fillList();
  }

  connectedCallback() {
    this.fillList();
    this.__manListenerCreated = managerListEvents.on("created", () => {
      this.fillList();
      return false;
    });
    this.__manListenerRemoved = managerListEvents.on("removed", () => {
      this.fillList();
      return false;
    });
    this.__manListenerMasterChanged = managerListEvents.on(
      "masterChanged",
      () => {
        this.fillList();
        return false;
      }
    );
  }

  disconnectedCallback() {
    if (this.__manListenerCreated)
      managerListEvents.off("created", this.__manListenerCreated);
    if (this.__manListenerRemoved)
      managerListEvents.off("removed", this.__manListenerRemoved);
    if (this.__manListenerMasterChanged)
      managerListEvents.off("masterChanged", this.__manListenerMasterChanged);
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
        new ListCellText().options({ text: (await manager.name).unwrap }),
        new ListCellText().options({ text: manager.ipAddress }),
        new ListCellComponents().options({
          way: Way.UP,
          components: [
            new ToggleSwitch().options({
              way: Way.LEFT,
              access: AccessTypes.WRITE,
              value: manager.permanent,
            }),
          ],
        }),
        new ListCellComponents().options({
          way: Way.UP,
          components: [
            new Button().options({
              text: manager.master ? "Is Master" : "Set as master",
              access: manager.master ? AccessTypes.READ : AccessTypes.WRITE,
              click: () => {
                changeMaster(manager);
              },
            }),
          ],
        }),
        new ListCellComponents().options({
          way: Way.UP,
          components: [
            new DropDown().options({
              access: AccessTypes.WRITE,
              options: this.__hasAdmin
                ? connectionTypeListAdmin
                : connectionTypeList,
              value: manager.connectionType,
            }),
          ],
        }),
        new ListCellComponents().options({
          way: Way.RIGHT,
          components: [
            new Button().options({
              symbol: delete_(),
              access: AccessTypes.WRITE,
              click: () => {
                promptResult({
                  result: removeManager(manager),
                  showSuccess: false,
                });
              },
            }),
          ],
        }),
        ...(this.__hasAdmin
          ? [
              new ListCellComponents().options({
                way: Way.RIGHT,
                components: [
                  new InputBox().options({
                    type: InputBoxTypes.IP,
                    access: AccessTypes.WRITE,
                    value: manager.simulatedIP,
                  }),
                ],
              }),
            ]
          : []),
      ],
    });
    return row;
  }

  /**Name of conent */
  get name(): string {
    return "Systems Editor";
  }
}
defineElement(ManagerEditor);
