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
import background from "./pageFWSW.svg?raw";
import { sharedTanks } from "./shared";

let full = { x: 0, y: 0, width: 1280, height: 752 };

export function fwSWGen(
  navigationMaker: (page: ScaledPage, pageName: string) => void,
  name: string
) {
  let page = new ScaledPage().options(full);
  page.appendInstrument(new InstrBackground().options({ background, ...full }));

  let tanksFW = [
    sharedTanks.NO_1_FW_TK_P,
    sharedTanks.NO_1_FW_TK_S,
    sharedTanks.NO_2_FW_TK,
  ];
  let tanksExtra = [sharedTanks.BILGE_TK, sharedTanks.SEWAGE_TK];

  textMaker(page, [
    //{ x: 10, y: 10, text: "Fuel", size: 20 }
  ]);

  let tankRegister = tankMaker(
    page,
    tankGridMaker([...tanksFW, ...tanksExtra], 10, 10, 3, 220, 336, 10)
  );
  let total = valueSumCreator(tanksFW, (t) => t.id);
  tankMakerManual(page, {
    total: {
      x: 960,
      y: 10,
      headLine: "Total",
      maxValue: Number(tanksFW.reduce((a, b) => a + b.maxValue, 0).toFixed(2)),
    },
  }).total.value = total.sum;

  navigationMaker(page, name);
  let registerFunc = (modMan: ModuleManager, ip: string) => {
    tankRegister(modMan, ip);
    total.register(modMan, ip);
  };
  return { page, registerFunc };
}
