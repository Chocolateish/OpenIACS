import {
  alarmBuzzer,
  globalAlarmEventHandler,
  nthAcknowledgedAlarms,
  nthTriggeredAlarm,
} from "@alarm/alarmManager";
import { changeTime } from "@components/timeChanger";
import { attachClickListener, WebComponent } from "@libCommon";
import {
  Button,
  InputBoxTypes,
  Lamp,
  LampColors,
  Slider,
  TextBox,
  TextBoxValue,
} from "@libComponents";
import { externalBrightness, externalBrightnessSupported } from "@libExtFeat";
import {
  brightness_4,
  brightness_high,
  brightness_low,
  lyngaa,
  lyngaa_marine,
  menu,
  menu_open,
  notifications,
  notifications_active,
  notifications_none,
  notifications_off,
  settings,
} from "@libIcons";
import {
  SideBarSides,
  sideMenu,
  TopBar,
  TopBarButton,
  TopBarSides,
  UIMenu,
  UIMenuParts,
} from "@libMenu";
import { PromptCodes, promptDropdown, promptInput } from "@libPrompts";
import {
  attachContextMenu,
  Content,
  ContentContainer,
  Context,
  mainWindowManager,
  remToPx,
  UIWindow,
  type ContentBase,
} from "@libUI";
import { Value } from "@libValues";
import info from "@package";
import {
  managers,
  master,
  percentageOfManagersSynced,
} from "@system/moduleManagerManager";
import "./setup.scss";

import { AlarmList } from "@alarm/alarmList.js";
import { generateAlarmList } from "@components/alarmListGenerator";
import { EventLogViewer } from "@components/eventLogViewer.js";
import { ModuleBrowser } from "@components/moduleBrowser.js";
import { ModuleLogViewer } from "@components/moduleLogViewer.js";
import { ManagerEditor } from "@components/moduleManagerEditor.js";
import { ManagerList } from "@components/moduleManagerList.js";
import { AccessTypes, defineElement, type BaseOptions } from "@libBase";
import type { ESubscriber } from "@libEvent";
import "@modules/index";
import { ASALA } from "./modules/alarm/index.js";

//#######################################################
//####  Check if the page is running on http
try {
  new WebSocket("ws://1.1.1.1:1");
} catch (error) {
  document.body.style.display = "flex";
  document.body.style.justifyContent = "center";
  document.body.style.alignItems = "center";
  let warning = document.createElement("div");
  document.body.appendChild(warning);
  warning.innerHTML = "Page does not work with https, please use http";
  warning.style.fontSize = "2rem";
  warning.style.color = "red";
  let link = document.createElement("a");
  document.body.appendChild(link);
  link.href = window.location.href.replace("https", "http");
  link.innerHTML = "Reload without SSL";
  link.style.fontSize = "1.5rem";
  link.style.color = "blue";
  throw new Error("No internet connection");
}

let rootContainer = new ContentContainer();
let root = new Context().options({ tabs: false });

let pageGroup = "";
let pageGroups: {
  [groupName: string]: { [pageName: string]: ContentBase };
} = {};

/**Used to register a page group
 * @param name name of the group*/
export let registerPageGroup = (name: string) => {
  pageGroups[name] = {};
};

/**Used to register a page in a page group
 * @param  groupName name of the group
 * @param  pageName name of the page
 * @param  page actual page*/
export let registerPageToGroup = (
  groupName: string,
  pageName: string,
  page: ContentBase
) => {
  pageGroups[groupName][pageName] = page;
};

let lastSelected: { select: () => void } | Content = { select: () => {} };

export let selectPage = (pageName: string) => {
  lastSelected = root.selected ?? { select: () => {} };
  pageGroups[pageGroup][pageName].select();
};

export let selectLastPage = () => {
  lastSelected.select();
};

registerPageGroup("Module Browser");
registerPageToGroup(
  "Module Browser",
  "Module Browser",
  new ModuleBrowser().options({})
);

registerPageGroup("Alarm List");
registerPageToGroup(
  "Alarm List",
  "Alarm List",
  new AlarmList({ buttons: true })
);

(async () => {
  await new Promise((a) => {
    setTimeout(a, 100);
  });
})();

export let pageSetup = () => {
  //#######################################################
  //####  TopBar
  let topBarInst = new TopBar();
  document.body.appendChild(topBarInst);
  topBarInst.addItem(
    TopBarSides.LEFT,
    new TopBarButton().options({
      symbol: menu(),
      click: () => {
        sideMenuInst.toggle = false;
      },
    })
  );

  //#######################################################
  //####  SideBar
  let sideMenuInst = sideMenu({
    width: remToPx(20),
    minWidth: remToPx(16),
    maxWidth: remToPx(32),
  });
  mainWindowManager.appendWindow(sideMenuInst.window);

  sideMenuInst.topBar.addItem(
    TopBarSides.LEFT,
    new TopBarButton().options({
      symbol: menu_open(),
      click: () => {
        sideMenuInst.toggle = true;
      },
    })
  );

  sideMenuInst
    .addItem(
      SideBarSides.BOTTOM,
      new TextBox().options({ text: "Base Version: " + info.version })
    )
    .classList.add("sideButton");
  sideMenuInst
    .addItem(
      SideBarSides.BOTTOM,
      new TextBox().options({ text: "Project Version: " + info.projectversion })
    )
    .classList.add("sideButton");

  let settingButton = sideMenuInst.addItem(
    SideBarSides.BOTTOM,
    new Button().options({
      symbol: settings(),
      text: "Settings",
      click: () => {
        mainWindowManager.appendWindow(
          new UIWindow().options({
            content: new ModuleBrowser(),
            width: 600,
            height: 400,
          })
        );
        sideMenuInst.toggle = true;
      },
    })
  );
  settingButton.classList.add("sideButton");

  let eventLog = sideMenuInst.addItem(
    SideBarSides.BOTTOM,
    new Button().options({
      text: "Event Log",
      click: () => {
        mainWindowManager.appendWindow(
          new UIWindow().options({
            content: new EventLogViewer(),
            width: 600,
            height: 400,
          })
        );
        sideMenuInst.toggle = true;
      },
    })
  );
  eventLog.classList.add("sideButton");

  let moduleLog = sideMenuInst.addItem(
    SideBarSides.BOTTOM,
    new Button().options({
      text: "Settings Log",
      click: () => {
        mainWindowManager.appendWindow(
          new UIWindow().options({
            content: new ModuleLogViewer(),
            width: 600,
            height: 400,
          })
        );
        sideMenuInst.toggle = true;
      },
    })
  );
  moduleLog.classList.add("sideButton");

  let sidelogo = sideMenuInst.addItem(SideBarSides.BOTTOM, lyngaa_marine());
  sidelogo.classList.add("sideLogo");
  //@ts-expect-error
  sidelogo.adminClicks = 0;
  //@ts-expect-error
  sidelogo.onclick = () => {
    //@ts-expect-error
    sidelogo.adminClicks++;
    //@ts-expect-error
    clearTimeout(sidelogo.adminTimeout);
    //@ts-expect-error
    sidelogo.adminTimeout = setTimeout(() => {
      //@ts-expect-error
      sidelogo.adminClicks = 0;
    }, 1000);
    //@ts-expect-error
    if (sidelogo.adminClicks > 5) {
      mainWindowManager.appendWindow(
        new UIWindow().options({
          height: 400,
          width: 600,
          content: new ManagerEditor(),
        })
      );
      //@ts-expect-error
      sidelogo.adminClicks = 0;
    }
  };

  //#######################################################
  //####  UI Menu
  let uiMenuInst = new UIMenu();
  let uiMenuInstWindow = new UIWindow().options({
    left: remToPx(3),
    top: 0,
    layer: 99,
    height: "content",
    width: 240,
    title: false,
    hide: true,
    autoHide: true,
    sizeable: false,
    content: uiMenuInst,
  });
  mainWindowManager.appendWindow(uiMenuInstWindow);

  let brightnessSelector = new Slider().options({
    text: "Brightness",
    min: 0,
    max: 100,
    value: externalBrightness,
    live: true,
    rightSymbol: brightness_high(),
    leftSymbol: brightness_low(),
  });
  uiMenuInst.addOption(brightnessSelector, UIMenuParts.BASIC);
  externalBrightnessSupported.addListener((val) => {
    brightnessSelector.access = val ? AccessTypes.WRITE : AccessTypes.NONE;
  }, true);

  let cleanScreen = new Button().options({
    text: "Clean Screen",
    click: () => {
      let screenCleanCounter = new Value(30);
      let screenCleanCont = new Content().options({});
      screenCleanCont.appendChild(
        new TextBoxValue().options({
          text: "Cancel by clicking this 10 times rapidly<br>Screen cleaner will close in:",
          value: screenCleanCounter,
          unit: "s",
        })
      );
      screenCleanCont.style.padding = "3.4rem";
      screenCleanCont.style.textAlign = "center";
      let screenCleanWind = new UIWindow().options({
        layer: 999999999,
        content: screenCleanCont,
        height: 200,
        width: 240,
        modal: true,
        closeable: false,
        title: false,
        sizeable: false,
      });
      mainWindowManager.appendWindow(screenCleanWind);
      setInterval(() => {
        screenCleanCounter.set = screenCleanCounter.get - 1;
        if (screenCleanCounter.get <= 0) screenCleanCont.close();
      }, 1000);
      let counter = 0;
      let counterReset = 0;
      screenCleanCont.addEventListener("pointerup", () => {
        counter++;
        if (counter >= 10) {
          screenCleanCont.close();
          return;
        }
        clearTimeout(counterReset);
        counterReset = window.setTimeout(() => {
          counter = 0;
        }, 1000);
      });
    },
  });
  uiMenuInst.addOption(cleanScreen, UIMenuParts.BASIC);

  topBarInst.addItem(
    TopBarSides.LEFT,
    new TopBarButton().options({
      symbol: brightness_4(),
      click: () => {
        uiMenuInstWindow.hide = !uiMenuInstWindow.hide;
      },
    })
  );
  sideMenuInst.topBar.addItem(
    TopBarSides.LEFT,
    new TopBarButton().options({
      symbol: brightness_4(),
      click: () => {
        uiMenuInstWindow.hide = !uiMenuInstWindow.hide;
      },
    })
  );

  //#######################################################
  //####  Connection list*/
  let connectionText = topBarInst.addItem(
    TopBarSides.MID,
    new TopBarButton().options({ text: "PLC Status" })
  );
  let connection = new Lamp().options({
    colors: [LampColors.RED, LampColors.YELLOW, LampColors.GREEN],
  });
  topBarInst.addItem(TopBarSides.MID, connection);
  percentageOfManagersSynced.subscribe((val) => {
    if (val.unwrap === 0) {
      connection.value = 0;
    } else if (val.unwrap < 100) {
      connection.value = 1;
    } else {
      connection.value = 2;
    }
  });
  connection.style.height = "2rem";
  connection.style.width = "2rem";
  connection.style.minHeight = "2rem";
  connection.style.alignSelf = "center";

  let managerLister = new ManagerList();
  managerLister.closeable = false;
  let managerListerContext = new Context().options({
    content: [managerLister],
    tabs: "auto",
  });
  let managerListerInstWindow = new UIWindow().options({
    left: remToPx(1),
    top: 0,
    layer: 99,
    maxWidth: "90%",
    maxHeight: "90%",
    height: 300,
    width: 600,
    title: false,
    hide: true,
    autoHide: true,
    sizeable: "rbv",
    content: managerListerContext,
  });
  mainWindowManager.appendWindow(managerListerInstWindow);
  attachClickListener(connectionText, () => {
    managerListerInstWindow.hide = !managerListerInstWindow.hide;
  });

  //#######################################################
  //####  Alarm Menu
  topBarInst.addItem(TopBarSides.RIGHT, alarmPreview);

  let alarmListInst = new AlarmList({
    buttons: true,
    logHandler: (viewer) => {
      alarmListContext.addContent(viewer);
    },
  });
  alarmListInst.closeable = false;
  let alarmListContext = new Context().options({
    content: [alarmListInst],
    tabs: "auto",
  });
  alarmListInstWindow = new UIWindow().options({
    right: remToPx(1),
    top: 0,
    layer: 99,
    maxWidth: "90%",
    maxHeight: "90%",
    height: "80%",
    width: "80%",
    title: false,
    hide: true,
    autoHide: true,
    sizeable: "lbv",
    content: alarmListContext,
  });
  mainWindowManager.appendWindow(alarmListInstWindow);

  topBarInst.addItem(TopBarSides.RIGHT, alarmButton);
  attachContextMenu(alarmButton, [
    {
      text: "Generate Alarm List",
      func: () => {
        generateAlarmList();
      },
    },
  ]);

  //#######################################################
  //Page Content
  document.body.appendChild(rootContainer);
  pageGroup = localStorage["pageGroup"] || "Module Browser";
  root = new Context().options({ tabs: false });
  for (const key in pageGroups[pageGroup]) {
    root.addContent(pageGroups[pageGroup][key]);
  }
  rootContainer.content = root;

  //TopBar Clock
  let clock = topBarInst.addItem(
    TopBarSides.RIGHT,
    new TopBarButton().options({})
  );
  setInterval(() => {
    let master2 = master();
    let offsetDateTime = new Date(
      new Date().getTime() +
        (master2?.timeOffset ?? 0) * 3600000 +
        (master2?.clientTimeOffset ?? 0)
    );
    clock.text = `${String(offsetDateTime.getUTCHours()).padStart(
      2,
      "0"
    )}:${String(offsetDateTime.getMinutes()).padStart(2, "0")}:${String(
      offsetDateTime.getSeconds()
    ).padStart(2, "0")}<br>${String(offsetDateTime.getDate()).padStart(
      2,
      "0"
    )}-${String(offsetDateTime.getMonth() + 1).padStart(
      2,
      "0"
    )}-${offsetDateTime.getFullYear()}`;
  }, 1000);
  attachContextMenu(clock, [
    {
      text: "Adjust Time",
      func: () => {
        changeTime();
      },
    },
  ]);

  //Logo
  let logo = topBarInst.addItem(
    TopBarSides.RIGHT,
    new TopBarButton().options({ symbol: lyngaa() })
  );
  //@ts-expect-error
  attachContextMenu(logo, () => {
    let hasAdmin = false;
    managers().forEach((manager) => {
      if (manager.user === 1) {
        hasAdmin = true;
      }
    });
    if (hasAdmin) {
      return [
        {
          text: "Refresh all screens",
          func: () => {
            managers().forEach((manager) => {
              manager.sendMessage("CR", { tc: "Cr" });
            });
          },
        },
        {
          text: "Start technician mode (Block alarm retrigger)",
          func: async () => {
            let time = await promptInput({
              title: "Technician mode",
              text: "Amount of time to activate technician mode",
              input: {
                type: InputBoxTypes.NUMBERPOSITIVE,
                min: 0,
                max: 18,
                unit: "h",
              },
            }).promise;
            managers().forEach((manager) => {
              manager
                .getPluginStorage("ALARM")
                //@ts-expect-error
                .asreg.command({ technicianMode: parseFloat(time.data) });
            });
          },
        },
        {
          text: "Select page group",
          func: async () => {
            let group = await promptDropdown({
              title: "Page Group",
              dropdown: {
                options: Object.keys(pageGroups).map((key) => {
                  return { text: key, value: key };
                }),
                value: pageGroup,
              },
              window: {
                height: 200,
              },
            }).promise;
            if (group.code === PromptCodes.ENTER) {
              pageGroup = group.data;
              localStorage["pageGroup"] = pageGroup;
              root = new Context().options({ tabs: false });
              for (const key in pageGroups[pageGroup]) {
                root.addContent(pageGroups[pageGroup][key]);
              }
              rootContainer.content = root;
            }
          },
        },
      ];
    }
    return [];
  });

  return {
    topBar: topBarInst,
    sideMenu: sideMenuInst,
  };
};
let buzzerActiveSym = notifications_active();
let alarmActiveSym = notifications();
let noAlarmActiveSym = notifications_none();

let alarmListInstWindow: UIWindow;
let alarmButton = new TopBarButton().options({
  symbol: noAlarmActiveSym,
  click: () => {
    alarmBuzzer.set = false;
  },
});

let stateListener: ESubscriber<any, any, any> | undefined;
let lastAlarm: ASALA | undefined;

globalAlarmEventHandler.on("FirstTriggered", (ev) => {
  setAlarm(ev.data.alarm);
});
globalAlarmEventHandler.on("FirstRetriggered", (ev) => {
  setAlarm(ev.data.alarm);
});
globalAlarmEventHandler.on("FirstAcknowledge", (ev) => {
  if (!lastAlarm) setAlarm(ev.data.alarm);
});
globalAlarmEventHandler.on("allClear", () => {
  alarmButton.symbol = noAlarmActiveSym;
  alarmPreview.__reset();
  lastAlarm = undefined;
  stateListener = undefined;
});

let setAlarm = (alarm: ASALA) => {
  if (lastAlarm && stateListener)
    lastAlarm.alarmEvents.off("STATE", stateListener);
  alarmPreview.alarm = lastAlarm = alarm;
  stateListener = lastAlarm.alarmEvents.on("STATE", () => {
    let next = nthTriggeredAlarm(0) || nthAcknowledgedAlarms(0);
    if (next) setAlarm(next);
  });
};

alarmBuzzer.addListener((val) => {
  if (val) alarmButton.symbol = buzzerActiveSym;
  else alarmButton.symbol = alarmActiveSym;
}, true);

type TopBarAlarmOptions = {
  alarm?: ASALA;
} & BaseOptions;

class TopBarAlarm extends WebComponent<TopBarAlarmOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "top-bar-alarm";
  }
  static elementNameSpace() {
    return "lmui";
  }

  private __container = this.appendChild(document.createElement("div"));
  private __text = this.__container.appendChild(document.createElement("div"));
  private __alarm?: ASALA;
  private __updateListener: any;

  constructor() {
    super();
    let buzzOff = notifications_off();
    this.__container.appendChild(buzzOff);
    this.__text.innerHTML = "No Alarms";
    attachClickListener(this, () => {
      alarmBuzzer.set = false;
      alarmListInstWindow.hide = !alarmListInstWindow.hide;
    });

    alarmBuzzer.addListener((val) => {
      if (val) buzzOff.classList.remove("h");
      else buzzOff.classList.add("h");
    }, true);
  }

  /**Options toggeler*/
  options(options: TopBarAlarmOptions): this {
    super.options(options);
    return this;
  }

  set alarm(alarm: ASALA) {
    if (this.__updateListener && this.__alarm) {
      this.__alarm.events.off("updated", this.__updateListener);
    }
    this.__alarm = alarm;
    this.__updateListener = alarm.events.on("updated", () => {
      this.__updateLineValues();
    });
    this.__updateLineValues();
  }

  __updateLineValues() {
    this.__container.className = this.__alarm!.state;
    this.__text.innerHTML = this.__alarm!.name;
  }

  __reset() {
    this.__container.className = "";
    this.__text.innerHTML = "No Alarms";
  }
}
defineElement(TopBarAlarm);

let alarmPreview = new TopBarAlarm();
