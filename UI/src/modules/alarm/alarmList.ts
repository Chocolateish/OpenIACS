import { AccessTypes, defineElement } from "@libBase";
import { red, yellow } from "@libColors";
import {
  dateTimeSecondsFromDateTwoLine,
  defineElementValues,
  WebComponent,
} from "@libCommon";
import {
  Button,
  ComponentGroup,
  ComponentGroupBorderStyle,
  Way,
} from "@libComponents";
import { notifications_off } from "@libIcons";
import { Ok } from "@libResult";
import { stateDerived } from "@libState";
import { addThemeVariable } from "@libTheme";
import {
  Content,
  type ContentBaseOptions,
  getWindowManagerFromElement,
  remToPx,
  UIWindow,
} from "@libUI";
import { ASALA, ASWUN } from "../modules/alarm";
import "./alarmList.scss";
import { AlarmLogViewer } from "./alarmLogViewer";
import {
  acknowledgedAlarms,
  alarmBuzzer,
  globalAlarmEventHandler,
  triggeredAlarms,
} from "./alarmManager";
import { AlarmStates } from "./types";
import {
  canChangeWatch,
  groupOnWatch,
  requestWatchChange,
  watchEnabled,
  WatchGroupSelector,
} from "./watchSystem";

addThemeVariable(
  "alarmListTriggeredBackgroundColor",
  ["AlarmList"],
  red["200"],
  "#4d3131"
);
addThemeVariable(
  "alarmListAcknowledgeBackgroundColor",
  ["AlarmList"],
  yellow["200"],
  "#4d492f"
);

/**Defines options for alarm list*/
export type AlarmListOptions = {
  /**Whether the alarm list shows built in buttons*/
  buttons: boolean;
  /**function to put log viewer where it needs to go, if nothing is provided log viewer is opened in window*/
  logHandler?: (viewer: AlarmLogViewer) => void;
  /**whether to show button to escape alarm list*/
  backButton?: boolean;
  /**function to run with back button*/
  backButtonAction?: () => void;
} & ContentBaseOptions;

export class AlarmList extends Content<AlarmListOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "alarm-list";
  }
  static elementNameSpace() {
    return "lmui";
  }

  /**Container for triggered alarms*/
  private __container = this.appendChild(document.createElement("div"));
  /**Container for triggered alarms*/
  private __table = this.__container.appendChild(document.createElement("div"));
  /**Container for headers*/
  private __header = this.__table.appendChild(document.createElement("tr"));
  /**Container for triggered alarms*/
  private __triggered = this.__table.appendChild(document.createElement("div"));
  /**Container for acknowledged alarms*/
  private __acknowledged = this.__table.appendChild(
    document.createElement("div")
  );
  __logHandler?: (viewer: AlarmLogViewer) => void;
  private __trigListener: any;
  private __ackListener: any;
  private __backButton?: boolean;
  private __logOpen?: AlarmLogViewer | false;
  private __backButtonAction: any;
  private __buttons?: ComponentGroup;
  private __watchButton?: Button;
  private __watchChangerOpen?: boolean;

  /**Options toggeler*/
  constructor(options: AlarmListOptions) {
    super();

    this.__header.appendChild(document.createElement("td")).innerHTML = "ID";
    this.__header.appendChild(document.createElement("td")).innerHTML = "Text";
    this.__header.appendChild(document.createElement("td")).innerHTML = "Group";
    this.__header.appendChild(document.createElement("td")).innerHTML =
      "System";
    this.__header.appendChild(document.createElement("td")).innerHTML = "Value";
    this.__header.appendChild(document.createElement("td")).innerHTML = "Time";
    this.__header.appendChild(document.createElement("td")).innerHTML = "Ack";

    if (typeof options.logHandler === "function") {
      this.__logHandler = options.logHandler;
    }

    this.__refillList();
    this.__trigListener = globalAlarmEventHandler.on("FirstTriggered", (ev) => {
      this.__triggered.prepend(
        new AlarmListAlarmLine({ alarm: ev.data.alarm, top: this })
      );
    });
    this.__ackListener = globalAlarmEventHandler.on(
      "FirstAcknowledge",
      (ev) => {
        this.__acknowledged.prepend(
          new AlarmListAlarmLine({ alarm: ev.data.alarm, top: this })
        );
      }
    );
  }

  /**Options toggeler*/
  options(options: AlarmListOptions): this {
    super.options(options);
    if (typeof options.backButton !== "undefined")
      this.__backButton = options.backButton;
    if (typeof options.backButtonAction !== "undefined")
      this.backAction = options.backButtonAction;
    if (typeof options.buttons !== "undefined") this.buttons = options.buttons;
    return this;
  }

  async onClose() {
    globalAlarmEventHandler.off("FirstTriggered", this.__trigListener);
    globalAlarmEventHandler.off("FirstAcknowledge", this.__ackListener);
  }

  /**This method refills the alarm list with all current alarms */
  private __refillList() {
    let children = this.__triggered.children;
    for (let i = children.length - 1; i >= 0; i--)
      //@ts-expect-error
      children[i].close();
    let trigs = triggeredAlarms();
    for (let i = 0; i < trigs.length; i++)
      this.__triggered.appendChild(
        new AlarmListAlarmLine({ alarm: trigs[i], top: this })
      );
    children = this.__acknowledged.children;
    for (let i = children.length - 1; i >= 0; i--)
      //@ts-expect-error
      children[i].close();
    let acks = acknowledgedAlarms();
    for (let i = 0; i < acks.length; i++)
      this.__acknowledged.appendChild(
        new AlarmListAlarmLine({ alarm: acks[i], top: this })
      );
  }

  get minSize() {
    return { width: remToPx(34), height: remToPx(12) };
  }

  /**Sets the function called with the back button*/
  set backAction(func: () => void) {
    if (typeof func === "function") this.__backButtonAction = func;
  }

  /**Sets wether the alarm list has built in buttons shown */
  set buttons(butts: boolean) {
    if (butts) {
      if (!this.__buttons) {
        this.__buttons = new ComponentGroup().options({
          position: Way.DOWN,
          border: ComponentGroupBorderStyle.OUTSET,
          way: Way.DOWN,
        });
        this.appendChild(this.__buttons);
        if (this.__backButton) {
          this.__buttons.addComponent(
            new Button().options({
              text: "Back",
              click: () => {
                this.__backButtonAction();
              },
            })
          );
        }
        this.__buttons.addComponent(
          new Button().options({
            text: "Silence",
            symbol: notifications_off(),
            click: () => {
              alarmBuzzer.set = false;
            },
          })
        );
        this.__buttons.addComponent(
          new Button().options({
            text: "Alarm Log",
            click: async () => {
              if (!this.__logOpen) {
                this.__logOpen = new AlarmLogViewer();
                getWindowManagerFromElement(this).appendWindow(
                  new UIWindow().options({
                    content: this.__logOpen,
                    width: "80%",
                    height: "80%",
                    layer: this.topContainer.layer + 1,
                  })
                );
                this.__logOpen.select();
                await this.__logOpen.whenClosed;
                this.__logOpen = false;
              } else {
                this.__logOpen.select();
              }
            },
          })
        );
        this.__buttons.addComponent(
          (this.__watchButton = new Button().options({
            click: async () => {
              if (!this.__watchChangerOpen) {
                this.__watchChangerOpen = true;
                let watchSelector = new WatchGroupSelector();
                getWindowManagerFromElement(this).appendWindow(
                  new UIWindow().options({
                    content: watchSelector,
                    width: remToPx(30),
                    height: "content",
                    moveable: false,
                    sizeable: false,
                    maxHeight: "80%",
                    layer: this.topContainer.layer + 1,
                  })
                );
                let group = await watchSelector.whenClosed;
                if (group instanceof ASWUN) {
                  requestWatchChange(group);
                }
                this.__watchChangerOpen = false;
              }
            },
            access: stateDerived(
              (values) => {
                if (!values[0].unwrap) {
                  return Ok(AccessTypes.NONE);
                } else if (values[1].unwrap) {
                  return Ok(AccessTypes.WRITE);
                } else {
                  return Ok(AccessTypes.READ);
                }
              },
              watchEnabled,
              canChangeWatch
            ),
          }))
        );
        this.__watchButton.attachState(
          stateDerived(
            (values) => {
              return values[0].map((val) => {
                return `On Watch: ${val.name}${
                  values[1].unwrap ? "<br>Change Watch" : ""
                }`;
              });
            },
            groupOnWatch,
            canChangeWatch
          ),
          (val) => {
            this.__watchButton!.text = val.unwrapOr("On Watch: None");
          }
        );
      }
    } else {
      if (this.__buttons) {
        this.removeChild(this.__buttons);
      }
    }
  }

  get name() {
    return "Alarm List";
  }
}
defineElement(AlarmList);

/**Defines options for alarm list*/

export type AlarmListAlarmLineOptions = {
  alarm: ASALA;
  top: AlarmList;
};

export class AlarmListAlarmLine extends WebComponent {
  /**Returns the name used to define the element */
  static elementName() {
    return "alarm-list-alarm-line";
  }
  static elementNameSpace() {
    return "lmui";
  }

  private __id = this.appendChild(document.createElement("td"));
  private __text: HTMLDivElement;
  private __group: HTMLTableCellElement;
  private __system: HTMLTableCellElement;
  private __alarm: ASALA;
  private __value: Text;
  private __unit: Text;
  private __time: HTMLTableCellElement;
  private __ack: HTMLTableCellElement;
  private __ackButton: any;
  private __state: AlarmStates;
  private __stateListener: any;
  system: any;
  value: any;
  unit: any;
  private __updateListener: any;

  /**Creates an instance of the content*/
  constructor(options: AlarmListAlarmLineOptions) {
    super();
    let alarm = (this.__alarm = options.alarm);

    let text = document.createElement("td");
    this.__text = text.appendChild(document.createElement("div"));
    this.appendChild(text);

    this.__group = document.createElement("td");
    this.__group.innerHTML = alarm.parent!.name;
    this.appendChild(this.__group);

    this.__system = document.createElement("td");
    this.appendChild(this.__system);

    let valContainer = this.appendChild(document.createElement("td"));
    this.__value = valContainer.appendChild(document.createTextNode(""));
    valContainer.appendChild(document.createTextNode(" "));
    this.__unit = valContainer.appendChild(document.createTextNode(""));

    this.__time = document.createElement("td");
    this.appendChild(this.__time);

    this.__ack = document.createElement("td");
    this.appendChild(this.__ack);
    this.__ack.appendChild(
      (this.__ackButton = new Button().options({
        text: "Ack",
        click: () => alarm.acknowledge(),
      }))
    );

    this.classList.add(alarm.state);
    this.__state = alarm.state;
    this.__stateListener = alarm.alarmEvents.on("STATE", (ev) => {
      this.__state = ev.data.state;
      switch (ev.data.oldState) {
        case AlarmStates.TRIGGERED:
          switch (ev.data.state) {
            case AlarmStates.CLEARED: {
              this.close();
              break;
            }
            case AlarmStates.ACKNOWLEDGED:
              this.classList.remove(AlarmStates.TRIGGERED);
              this.classList.add(AlarmStates.ACKNOWLEDGED);
              //@ts-expect-error
              options.top.__acknowledged.prepend(this);
              break;
          }
          break;
        case AlarmStates.ACKNOWLEDGED:
          switch (ev.data.state) {
            case AlarmStates.CLEARED: {
              this.close();
              break;
            }
            case AlarmStates.TRIGGERED:
              this.classList.remove(AlarmStates.ACKNOWLEDGED);
              this.classList.add(AlarmStates.TRIGGERED);
              //@ts-expect-error
              options.top.__triggered.prepend(this);
              break;
          }
          break;
      }
    });

    //@ts-expect-error
    this.__updateListener = alarm.addEListener(ModuleEventTypes.UPDATED, () => {
      this.__updateLineValues();
    });

    this.__updateLineValues();
  }

  __updateLineValues() {
    this.__id.innerHTML = String(this.__alarm.alarmID ?? "N/A");
    this.__text.innerHTML = this.__alarm.name;
    this.system = this.__alarm.manager.name;
    let val = this.__alarm.manager.getModuleByUID(this.__alarm.valID ?? 0);
    if (val) {
      this.value = val.value;
      this.unit = val.unit;
    }
    this.__time.innerHTML = dateTimeSecondsFromDateTwoLine(
      this.__alarm.trigTime
    );
  }

  /**Closes the row and cleans up */
  close() {
    this.__alarm.alarmEvents.off("STATE", this.__stateListener);
    this.__alarm.events.off("updated", this.__updateListener);
    this.remove();
  }

  protected $vfvalue(value: any) {
    switch (typeof value) {
      case "number":
        this.__value.nodeValue = value.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        });
        break;
      case "boolean":
        if (value) {
          this.__value.nodeValue = "On";
        } else {
          this.__value.nodeValue = "Off";
        }
        break;
      case "string":
        this.__value.nodeValue = value;
        break;
    }
  }
  protected $vfunit(value: string) {
    this.__unit.nodeValue = value;
  }
  protected $vfsystem(value: string) {
    this.__system.innerHTML = value;
  }
  protected $vfcanAck(value: string) {
    switch (this.__state) {
      case AlarmStates.TRIGGERED: {
        if (value && this.__alarm.ackAllowed) {
          this.__ackButton.access = AccessTypes.WRITE;
        } else {
          this.__ackButton.access = AccessTypes.READ;
        }
        break;
      }
      case AlarmStates.ACKNOWLEDGED: {
        this.__ackButton.access = AccessTypes.READ;
        break;
      }
    }
  }
}
defineElement(AlarmListAlarmLine);
defineElementValues(AlarmListAlarmLine, ["value", "unit", "system", "canAck"]);
