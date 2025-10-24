import { AlarmList } from "@alarm/alarmList";
import { alarmBuzzer } from "@alarm/alarmManager";
import { setModuleBrowserCustomScript } from "@components/moduleBrowser";
import { InstrButton } from "@libInstr";
import { ScaledPage } from "@libPages";
import { doLogging, ModuleManager } from "@system/moduleManager";
import * as managerManager from "@system/moduleManagerManager";
import { getManagerByIP } from "@system/moduleManagerManager";
import {
  pageSetup,
  registerPageGroup,
  registerPageToGroup,
  selectLastPage,
  selectPage,
} from "../modules/setup";
import { frontpageFunc } from "./frontpage";
import "./index.scss";
import { ballastGen } from "./pageBallastTank";
import { fuelGen } from "./pageFuelTank";
import { fwSWGen } from "./pageFWSW";
import { pms1Gen } from "./pagePMS";
import { pms2Gen } from "./pagePMS2";
declare global {
  interface Window {
    managerManager: typeof managerManager;
    setModuleBrowserCustomScript: typeof setModuleBrowserCustomScript;
  }
}
window.managerManager = managerManager;
window.setModuleBrowserCustomScript = setModuleBrowserCustomScript;

setModuleBrowserCustomScript((module) => {
  module.value.set = 0.05;
});

doLogging(false, false, false);

document.title = "LMUI";

let pages = {
  FrontPage: "Front Page",
  PMS1: "PMS1",
  PMS2: "PMS2",
  Ballast: "Ballast",
  Fuel: "Fuel",
  FWBW: "FW/BW",
  Alarms: "Alarm",
};

let navigationMaker = (page: ScaledPage, pageName: string) => {
  let length = Object.keys(pages).length;
  Object.entries(pages).forEach(([_key, value], i) => {
    page.appendInstrument(
      // Two Rows
      // instrnew Button().options({
      //   x: ((1270 / Math.ceil(length / 2)) * i + 10) % 1270,
      //   y: i >= Math.ceil(length / 2) ? 752 - 66 : 752 - 132,
      //   width: 1280 / Math.ceil(length / 2) - 10,
      //   height: 60,
      //   text: value,
      //   textSize: 20,
      //   light: value === pageName,
      //   click() {
      //     selectPage(value);
      //   },
      // })
      new InstrButton().options({
        x: ((1270 / length) * i + 10) % 1270,
        y: 752 - 66,
        width: 1280 / length - 10,
        height: 60,
        text: value,
        textSize: 20,
        light: value === pageName,
        click() {
          selectPage(value);
        },
      })
    );
  });
};

registerPageGroup("Main");
let frontpage = frontpageFunc(navigationMaker, pages.FrontPage);
registerPageToGroup("Main", pages.FrontPage, frontpage.page);
let pms1 = pms1Gen(navigationMaker, pages.PMS1);
registerPageToGroup("Main", pages.PMS1, pms1.page);
let pms2 = pms2Gen(navigationMaker, pages.PMS2);
registerPageToGroup("Main", pages.PMS2, pms2.page);
let ballast = ballastGen(navigationMaker, pages.Ballast);
registerPageToGroup("Main", pages.Ballast, ballast.page);
let fuel = fuelGen(navigationMaker, pages.Fuel);
registerPageToGroup("Main", pages.Fuel, fuel.page);
let fwBW = fwSWGen(navigationMaker, pages.FWBW);
registerPageToGroup("Main", pages.FWBW, fwBW.page);
registerPageToGroup(
  "Main",
  "Alarm",
  new AlarmList({
    buttons: true,
    backButton: true,
    backButtonAction: () => {
      selectLastPage();
    },
  })
);

let systems = [
  "192.168.1.251",
  "192.168.1.252",
  "192.168.1.253",
  "192.168.1.254",
];

(async () => {
  await new Promise((a) => setTimeout(a, 100));
  pageSetup();
  selectPage(pages.PMS2);
  try {
    systems.forEach((ip) => {
      getManagerByIP(ip)?.events.on("synced", (_ev) => {
        let modMan = _ev.target as ModuleManager;
        frontpage.registerFunc(modMan, ip);
        pms1.registerFunc(modMan, ip);
        pms2.registerFunc(modMan, ip);
        ballast.registerFunc(modMan, ip);
        fuel.registerFunc(modMan, ip);
        fwBW.registerFunc(modMan, ip);
      });
    });

    systems.forEach((ip) => {
      getManagerByIP(ip)?.events.on("closed", () => {
        alarmBuzzer.set = true;
      });
    });
  } catch (error) {}
})();
