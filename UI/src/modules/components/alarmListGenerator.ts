import { AccessTypes, defineElement } from "@libBase";
import {
  Button,
  ComponentGroup,
  ComponentGroupBorderStyle,
  Way,
} from "@libComponents";
import { Content, mainWindowManager, UIWindow } from "@libUI";
import { ASALA, ASALL, ASREG } from "@modules/alarm";
import { managers } from "@system/moduleManagerManager";
import { download, generateCsv, mkConfig } from "export-to-csv";
import "./alarmListGenerator.scss";

/**This opens the time change dialog*/
export let generateAlarmList = (parent?: Content) => {
  mainWindowManager.appendWindow(
    new UIWindow().options({
      content: new AlarmListGenerator().options({ parent }),
      width: 600,
      height: 400,
    })
  );
};

type AlarmListGeneratorRows = {
  row: HTMLTableRowElement;
  cells: HTMLTableCellElement[];
};

type AlarmListGeneratorAlarm = {
  System: string;
  List: string;
  ID: string;
  Name: string;
  Enabled: string;
  "Alarm/Alert": string;
  TriggerDelay: string;
  RetriggerDelay: string;
  ClearDelay: string;
  Condition: string;
};

class AlarmListGenerator extends Content {
  /**Returns the name used to define the element */
  static elementName() {
    return "alarm-list-generator";
  }

  static elementNameSpace() {
    return "lmui";
  }

  group = this.appendChild(new ComponentGroup().options({ way: Way.LEFT }));
  save = this.appendChild(
    new ComponentGroup().options({
      way: Way.UP,
      position: Way.DOWN,
      border: ComponentGroupBorderStyle.OUTSET,
    })
  );
  progress = new Button().options({
    text: "",
    access: AccessTypes.READ,
  });
  list = this.group.appendChild(document.createElement("table"));
  rows: AlarmListGeneratorRows[] = [];
  data: AlarmListGeneratorAlarm[] = [];

  interval = 0;
  state = 0;
  alarms: ASALA[] = [];
  alarmProgress = 0;

  constructor() {
    super();
    this.list.appendChild(document.createElement("tr"));
    [
      "System",
      "List",
      "ID",
      "Name",
      "Enabled",
      "Alarm/Alert",
      "TriggerDelay",
      "RetriggerDelay",
      "ClearDelay",
      "Condition",
    ].forEach((v) => {
      let th = document.createElement("th");
      th.textContent = v;
      this.list.children[0].appendChild(th);
    });

    this.save.addComponent(this.progress);
    this.save.addComponent(
      new Button().options({
        text: "Export",
        click: () => {
          const csvConfig = mkConfig({
            useKeysAsHeaders: true,
            filename: `alarm_list_${new Date().toISOString()}`,
          });
          console.log(this.data);

          const csv = generateCsv(csvConfig)(this.data);
          download(csvConfig)(csv);
        },
      })
    );
    this.save.addComponent(
      new Button().options({
        text: "Close",
        click: () => {
          this.close();
        },
      })
    );

    this.interval = window.setInterval(async () => {
      switch (this.state) {
        case 0:
          this.progress.text = "Getting alarm amount";
          let alarmManagers = managers().map(
            (man) => man.getPluginStorage("ALARM").asreg as ASREG
          );
          this.alarms = alarmManagers
            .map((asreg) =>
              asreg.children
                .filter((c) => c instanceof ASALL)
                .map((c) => c.children as any as ASALA[])
            )
            .flat()
            .flat();
          this.state = 1;
          break;
        case 1:
          this.progress.text =
            "Generating alarm list " +
            this.alarmProgress +
            "/" +
            this.alarms.length;

          let data = await alarmToData(this.alarms[this.alarmProgress]);
          let row = alarmDataToRow(data);
          this.rows.push(row);
          this.list.appendChild(row.row);
          this.data.push(data);
          this.alarmProgress++;
          if (this.alarmProgress >= this.alarms.length) {
            this.state = 2;
          }

          break;
        case 2:
          this.progress.text =
            "Finished " + this.alarmProgress + "/" + this.alarms.length;
          break;
      }
    }, 500);
  }

  async onClose(_data: any): Promise<any> {
    clearInterval(this.interval);
  }

  /**Name of content*/
  get name(): string {
    return "Alarm List Generator";
  }
}
defineElement(AlarmListGenerator);

async function alarmToData(alarm: ASALA): Promise<AlarmListGeneratorAlarm> {
  let config = (await new Promise((r) => {
    let func = alarm.configs.subscribe((yo) => {
      r(yo);
      alarm.configs.unsubscribe(func);
    }, true);
  })) as any;
  return {
    System: (await alarm.manager.name).unwrap,
    List: alarm.parent!.name,
    ID: String(alarm.uid),
    Name: alarm.name,
    Enabled: config.enabled ? "Yes" : "No",
    "Alarm/Alert": alarm.alarmAlert ? "Alarm" : "Alert",
    TriggerDelay: String(config.trigDelay) + "s",
    RetriggerDelay: String(config.reTrigDelay) + "s",
    ClearDelay: String(config.clearDelay) + "s",
    Condition: conditionSerializer(alarm, config.condition),
  };
}

function alarmDataToRow(data: AlarmListGeneratorAlarm): AlarmListGeneratorRows {
  let row = document.createElement("tr");
  let cells: HTMLTableCellElement[] = [];
  (Object.values(data) as string[]).forEach((v) => {
    let td = document.createElement("td");
    td.textContent = v;
    row.appendChild(td);
    cells.push(td);
  });
  return { row, cells };
}

let conditionNames = [
  "IS DISABLED",
  " IS BIGGER THAN ",
  " IS SMALLER THAN ",
  " IS EQUAL TO ",
  " IS ON ",
  " IS OFF ",
  " IS INVALID ",
  " IS DIFFERENT FROM ",
  " IS BIGGER THAN OR EQUAL ",
  " IS SMALLER THAN OR EQUAL ",
];
let nextNames = [" AND ", " OR "];

function conditionSerializer(
  asala: ASALA,
  data: [{ val: number; modID: number; cond: number; next: number }]
): string {
  if (!(data instanceof Array)) return "Unknown";
  let ret = "WHEN ";
  data.forEach((v, i) => {
    switch (v.cond) {
      case 0:
        ret += "";
        break;
      case 1:
      case 2:
      case 3:
      case 7:
      case 8:
      case 9:
        let mod = asala.manager.getModuleByUID(v.modID);
        ret +=
          (mod?.name ?? "Unknown") +
          conditionNames[v.cond] +
          v.val +
          (mod?.unit.get ?? "");
        break;
      case 4:
      case 5:
      case 6:
        ret +=
          (asala.manager.getModuleByUID(v.modID)?.name ?? "Unknown") +
          conditionNames[v.cond];
        break;
      default:
        ret += "Unknown";
    }
    if (i < data.length - 1) ret += nextNames[v.next];
  });
  return ret;
}
