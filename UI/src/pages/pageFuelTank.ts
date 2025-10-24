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
import background from "./pageFuelTank.svg?raw";
import { sharedTanks } from "./shared";

let full = { x: 0, y: 0, width: 1280, height: 752 };

export function fuelGen(
  navigationMaker: (page: ScaledPage, pageName: string) => void,
  name: string
) {
  let page = new ScaledPage().options(full);
  page.appendInstrument(new InstrBackground().options({ background, ...full }));

  let tanksTotal = [
    sharedTanks.NO_1_FO_TK_P,
    sharedTanks.NO_1_FO_TK_S,
    sharedTanks.NO_2_FO_TK_P,
    sharedTanks.NO_2_FO_TK_S,
    sharedTanks.FO_DAY_TK_P,
    sharedTanks.FO_DAY_TK_S,
  ];
  let tanksExtra = [sharedTanks.F_O_OVERFLOW_TK, sharedTanks.DIRTY_OIL_TK];

  textMaker(page, [
    //{ x: 10, y: 10, text: "Fuel", size: 20 }
  ]);

  let tankRegister = tankMaker(
    page,
    tankGridMaker([...tanksTotal, ...tanksExtra], 10, 10, 4, 220, 336, 10)
  );
  let total = valueSumCreator(tanksTotal, (t) => t.id);
  tankMakerManual(page, {
    total: {
      x: 960,
      y: 10,
      headLine: "Total",
      maxValue: Number(
        tanksTotal.reduce((a, b) => a + b.maxValue, 0).toFixed(2)
      ),
    },
  }).total.value = total.sum;

  navigationMaker(page, name);
  let registerFunc = (modMan: ModuleManager, ip: string) => {
    tankRegister(modMan, ip);
    total.register(modMan, ip);
  };
  return { page, registerFunc };
}
