import { defineElement } from "@libBase";
import { WebComponent } from "@libCommon";
import {
  Button,
  ComponentGroup,
  ComponentGroupBorderStyle,
  InputBox,
  InputBoxTypes,
  Way,
} from "@libComponents";
import type { ESubSubscriber } from "@libEvent";
import {
  externalFeatureExportSupported,
  externalFeatureRunExport,
} from "@libExtFeat";
import { promptButtons, promptInfo, promptInput } from "@libPrompts";
import { Content, type ContentBaseOptions } from "@libUI";
import { Value } from "@libValues";
import { ModuleManager } from "@system/moduleManager";
import { managers, master } from "@system/moduleManagerManager";
import { download, generateCsv, mkConfig } from "export-to-csv";
import "./alarmLogViewer.scss";

/**Defines the alarm log data*/
type AlarmLog = {
  time: string;
  uid: number;
  alarmID: number;
  state: string;
  name: string;
  value: number;
  unit: string;
  valID: number;
};

let maxShown = 20;

/**Defines options for alarm log viewer*/
export type AlarmLogViewerOptions = {
  manager?: ModuleManager;
} & ContentBaseOptions;

export class AlarmLogViewer extends Content<AlarmLogViewerOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "alarm-log-viewer";
  }
  static elementNameSpace() {
    return "lmui";
  }

  /**Storage of downloaded*/
  private __logStorage: AlarmLog[] = [];
  private __newestLog = 0;
  private __amount = 0;
  private __max = 0;
  private __shown: (HTMLTableRowElement | AlarmLogViewerLine)[] = [];
  private __shownPosition = 0;
  private __container = this.appendChild(document.createElement("div"));
  private __headers: HTMLTableRowElement;
  private __logs: HTMLDivElement;
  private __shownPositionVal: Value;
  save: ComponentGroup;
  private __systemButton: Button;
  private __selecting?: boolean;
  private __manager?: ModuleManager | null;
  private __firstConnect?: boolean;
  private __interval: any;
  private __initListener?: ESubSubscriber<any, any, any>;
  private __logListener?: ESubSubscriber<any, any, any>;

  constructor() {
    super();
    let table = this.__container.appendChild(document.createElement("div"));
    this.__headers = table.appendChild(document.createElement("tr"));

    this.__headers.appendChild(document.createElement("td")).innerHTML =
      "UTC Time";
    this.__headers.appendChild(document.createElement("td")).innerHTML = "UID";
    this.__headers.appendChild(document.createElement("td")).innerHTML =
      "Alarm ID";
    this.__headers.appendChild(document.createElement("td")).innerHTML =
      "State";
    this.__headers.appendChild(document.createElement("td")).innerHTML = "Name";
    this.__headers.appendChild(document.createElement("td")).innerHTML =
      "Value";
    this.__headers.appendChild(document.createElement("td")).innerHTML = "Unit";
    this.__headers.appendChild(document.createElement("td")).innerHTML =
      "Sensor ID";

    this.__logs = document.createElement("div");
    table.appendChild(this.__logs);

    this.__shownPositionVal = new Value(0, (val) => {
      return Math.max(Math.min(val, this.__amount - maxShown), 0);
    });
    this.__shownPositionVal.addListener((val) => {
      this.__shownPosition = val;
      this.__redrawShown();
    });

    this.appendChild(
      (this.save = new ComponentGroup().options({
        way: Way.UP,
        position: Way.DOWN,
        border: ComponentGroupBorderStyle.OUTSET,
      }))
    );
    this.save.addComponent(
      (this.__systemButton = new Button().options({
        text: "Select System",
        click: async () => {
          if (!this.__selecting) {
            this.__selecting = true;
            let selector = promptButtons({
              parent: this,
              title: "Select System",
              text: "Select System",
              buttons: await Promise.all(
                managers().map(async (e) => {
                  return {
                    text: (await e.name).value,
                    value: e,
                  };
                })
              ),
            });
            let selection = await selector.promise;
            if (selection && (selection.data as any) instanceof ModuleManager) {
              this.manager = selection.data as any;
            }
            this.__selecting = false;
          }
        },
      }))
    );
    this.save.addComponent(
      new InputBox().options({
        type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
        value: this.__shownPositionVal,
        change: () => {},
      })
    );
    this.save.addComponent(
      new Button().options({
        text: "Previous " + maxShown,
        click: () => {
          this.__shownPositionVal.set = this.__shownPositionVal.get - maxShown;
        },
      })
    );
    this.save.addComponent(
      new Button().options({
        text: "Next " + maxShown,
        click: () => {
          this.__shownPositionVal.set = this.__shownPositionVal.get + maxShown;
        },
      })
    );
    this.save.addComponent(
      new Button().options({
        text: "Export",
        click: async () => {
          let { data } = await promptInput({
            title: "Amount of logs to export",
            text:
              (externalFeatureExportSupported.get
                ? "Remember to plug in USB Storage<br>"
                : "") +
              "Max is " +
              this.__amount +
              " logs<br>Logs are downloaded at a rate of 1200 logs per second.",
            input: {
              type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
              max: this.__amount,
            },
          }).promise;
          data = Math.min(Number(data), this.__amount);
          if (data > 0) {
            let master2 = master()!;
            let ofDT = new Date(
              new Date().getTime() +
                master2.timeOffset * 3600000 +
                master2.clientTimeOffset
            );
            let time = `${ofDT.getFullYear()}-${String(
              ofDT.getMonth() + 1
            ).padStart(2, "0")}-${String(ofDT.getDate()).padStart(
              2,
              "0"
            )}-${String(ofDT.getUTCHours()).padStart(2, "0")}-${String(
              ofDT.getMinutes()
            ).padStart(2, "0")}-${String(ofDT.getSeconds()).padStart(2, "0")}`;
            const csvConfig = mkConfig({
              useKeysAsHeaders: true,
              filename: `alarmLogOn${await this.__manager!
                .name}${data}LogsAt${time}`,
            });
            if (this.__logStorage.length < data) {
              var infoPrompt = promptInfo({
                title: "Downloading logs",
                text: this.__logStorage.length + " out of " + data + " logs",
              });
              let downloads = data - this.__logStorage.length;
              let oldestHave = this.__logStorage.length;
              let cancel = false;
              infoPrompt.promise.then(() => {
                cancel = true;
              });
              while (
                this.__logStorage.length < data &&
                downloads > 0 &&
                !cancel
              ) {
                let amount = Math.min(downloads, 5);
                let order = this.__createOrder(oldestHave, amount);
                downloads -= amount;
                oldestHave += amount;
                infoPrompt.text = oldestHave + " out of " + data + " logs";
                this.__manager!.sendMessage("LL", { type: "A", log: order });
                await new Promise((a) => {
                  setTimeout(a, 250);
                });
              }
              infoPrompt.close();
              if (cancel) {
                return;
              }
            }
            const csv = generateCsv(csvConfig)(
              this.__logStorage.slice(0, data)
            );
            download(csvConfig)(csv);
            if (externalFeatureExportSupported.get) {
              let infoPrompt2 = promptInfo({
                title: "Exporting to USB Storage",
                text: "Please don't remove USB storage device",
              });
              await new Promise((a) => {
                setTimeout(a, 5000);
              });
              infoPrompt2.close();
              externalFeatureRunExport();
            }
          }
        },
      })
    );
  }

  /**Options toggeler*/
  options(options: AlarmLogViewerOptions): this {
    super.options(options);
    this.manager = options.manager;
    return this;
  }

  /** Changes the manager which logs are shown*/
  set manager(man: ModuleManager | undefined) {
    if (this.__manager) {
      this.__manager.events.off("message", this.__initListener!, ["L", "A"]);
      this.__manager.events.off("message", this.__logListener!, ["L", "L"]);
      clearInterval(this.__interval);
    }

    if (man instanceof ModuleManager) {
      this.__manager = man;
    } else {
      this.__manager = master();
    }

    (async () => {
      this.__systemButton.text = `Selected: ${await this.__manager!
        .name}<br>Click to change`;
    })();
    this.__firstConnect = true;

    this.__logStorage = [];
    this.__logs.innerHTML = "";
    for (let i = 0; i < maxShown; i++) {
      this.__shown[i] = this.__logs.appendChild(document.createElement("tr"));
    }

    this.__initListener = this.__manager!.events.on(
      "message",
      (ev) => {
        if (ev.data.data["type"] === "A") {
          let oldNewestLog = this.__newestLog;
          this.__newestLog = ev.data.data["newest"];
          this.__amount = ev.data.data["amount"];
          this.__max = ev.data.data["max"];
          if (this.__firstConnect) {
            this.__firstConnect = false;
            this.__manager!.sendMessage("LL", {
              type: "A",
              log: this.__createOrder(this.__shownPosition, maxShown),
            });
          } else {
            if (oldNewestLog != this.__newestLog) {
              let newestDiff = this.__newestLog - oldNewestLog;
              if (newestDiff < 0) {
                newestDiff += this.__max;
              }
              if (newestDiff > 0) {
                this.__logStorage.unshift(...Array(newestDiff));
              }
              this.__redrawShown();
            }
          }
        }
      },
      ["L", "A"]
    );

    this.__logListener = this.__manager!.events.on(
      "message",
      (ev) => {
        if (ev.data.data["type"] === "A")
          this.__newLog(
            this.__newestLog - ev.data.data["num"] - 1,
            ev.data.data["log"]
          );
      },
      ["L", "L"]
    );

    this.__manager!.sendMessage("LA", { type: "A" });
    this.__interval = setInterval(() => {
      this.__manager!.sendMessage("LA", { type: "A" });
    }, 2000);
  }

  private __newLog(num: number, log: AlarmLog) {
    this.__logStorage[num] = log;
    if (num >= this.__shownPosition && num < this.__shownPosition + maxShown) {
      let relativeNum = num - this.__shownPosition;
      let newLog = new AlarmLogViewerLine({ log: log });
      this.__logs.replaceChild(newLog, this.__shown[relativeNum]);
      this.__shown[relativeNum] = newLog;
    }
  }

  private __createOrder(start: number, amount: number) {
    let orders: number[] = [];
    if (this.__amount == 0) return orders;
    if (amount > this.__amount) amount = this.__amount;
    if (start + amount > this.__amount) amount = this.__amount - start;
    for (let i = 0; i < amount; i++) {
      let num = this.__newestLog - i - start - 1;
      if (num < 0) num += this.__max;
      orders[i] = num;
    }
    return orders;
  }

  private __redrawShown() {
    let orders = [];
    for (let i = 0; i < maxShown; i++) {
      let newLog: HTMLTableRowElement | AlarmLogViewerLine;
      let relativeNum = this.__shownPosition + i;
      if (this.__logStorage[relativeNum]) {
        newLog = new AlarmLogViewerLine({
          log: this.__logStorage[relativeNum],
        });
      } else {
        newLog = document.createElement("tr");
        if (relativeNum < this.__amount)
          orders.push(...this.__createOrder(relativeNum, 1));
      }
      this.__logs.replaceChild(newLog, this.__shown[i]);
      this.__shown[i] = newLog;
    }
    if (orders.length > 0) {
      this.__manager!.sendMessage("LL", { type: "A", log: orders });
    }
  }

  async onClose() {
    if (this.__manager) {
      this.__manager.events.off("message", this.__initListener!, ["L", "A"]);
      this.__manager.events.off("message", this.__logListener!, ["L", "L"]);
      clearInterval(this.__interval);
    }
  }

  get name() {
    return "Alarm Log Viewer";
  }
}
defineElement(AlarmLogViewer);

/**Defines options for alarm list*/
type AlarmLogViewerLineOptions = {
  log: AlarmLog;
};

export class AlarmLogViewerLine extends WebComponent {
  /**Returns the name used to define the element */
  static elementName() {
    return "alarm-log-viewer-row";
  }
  static elementNameSpace() {
    return "lmui";
  }

  /**Creates an instance of the content*/
  constructor(options: AlarmLogViewerLineOptions) {
    super();
    this.appendChild(document.createElement("td")).innerHTML = options.log.time;
    this.appendChild(document.createElement("td")).innerHTML = String(
      options.log.uid
    );
    this.appendChild(document.createElement("td")).innerHTML = String(
      options.log.alarmID
    );
    this.appendChild(document.createElement("td")).innerHTML =
      options.log.state;
    this.appendChild(document.createElement("td")).innerHTML = options.log.name;
    this.appendChild(document.createElement("td")).innerHTML = String(
      options.log.value
    );
    this.appendChild(document.createElement("td")).innerHTML = options.log.unit;
    this.appendChild(document.createElement("td")).innerHTML = String(
      options.log.valID
    );
  }
}
defineElement(AlarmLogViewerLine);
