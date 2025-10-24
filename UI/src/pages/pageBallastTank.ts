import { InstrBackground } from "@libInstr";
import { ScaledPage } from "@libPages";
import { ModuleManager } from "@system/moduleManager";
import {
  tankGridMaker,
  tankMaker,
  tankMakerManual,
  textMaker,
  valueSumCreator,
} from "./helpers";
import background from "./pageBallastTank.svg?raw";
import { sharedTanks } from "./shared";

let full = { x: 0, y: 0, width: 1280, height: 752 };

export function ballastGen(
  navigationMaker: (page: ScaledPage, pageName: string) => void,
  name: string
) {
  let page = new ScaledPage().options(full);
  page.appendInstrument(new InstrBackground().options({ background, ...full }));

  let tanks = [
    sharedTanks.NO_1_WB_TK_P,
    sharedTanks.NO_1_WB_TK_S,
    sharedTanks.NO_2_WB_TK_P,
    sharedTanks.NO_2_WB_TK_S,
    sharedTanks.NO_4_WB_TK_P,
    sharedTanks.NO_4_WB_TK_S,
    sharedTanks.NO_6_WB_TK_P,
    sharedTanks.NO_6_WB_TK_S,
    sharedTanks.NO_2_WB_WING_TK_P,
    sharedTanks.NO_2_WB_WING_TK_S,
    sharedTanks.NO_3_WB_WING_TK_P,
    sharedTanks.NO_3_WB_WING_TK_S,
    sharedTanks.NO_4_WB_WING_TK_P,
    sharedTanks.NO_4_WB_WING_TK_S,
    sharedTanks.NO_5_WB_WING_TK_P,
    sharedTanks.NO_5_WB_WING_TK_S,
    sharedTanks.FP_TK_WB_TK,
  ];

  textMaker(page, [
    // { x: 10, y: 10, text: "Ballast", size: 20 }
  ]);

  let tankRegister = tankMaker(
    page,
    tankGridMaker(tanks, 10, 10, 6, 146, 225, 10)
  );
  let total = valueSumCreator(tanks, (t) => t.id);
  tankMakerManual(page, {
    total: {
      x: 960,
      y: 10,
      headLine: "Total",
      maxValue: Number(tanks.reduce((a, b) => a + b.maxValue, 0).toFixed(2)),
    },
  }).total.value = total.sum;

  navigationMaker(page, name);
  let registerFunc = (modMan: ModuleManager, ip: string) => {
    tankRegister(modMan, ip);
    total.register(modMan, ip);
  };
  return { page, registerFunc };
}
