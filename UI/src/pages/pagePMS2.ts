import { InstrBackground, InstrGrid } from "@libInstr";
import { ScaledPage } from "@libPages";
import { ModuleManager } from "@system/moduleManager";
import { textMaker } from "./helpers";
import background from "./pagePMS2.svg?raw";

let full = { x: 0, y: 0, width: 1280, height: 752 };

export function pms2Gen(
  navigationMaker: (page: ScaledPage, pageName: string) => void,
  name: string
) {
  let page = new ScaledPage().options(full);
  page.appendInstrument(new InstrBackground().options({ background, ...full }));

  textMaker(page, [
    // { x: 10, y: 10, text: "PMS2", size: 20 }
  ]);

  page.appendInstrument(
    new InstrGrid().options({
      x: 10,
      y: 10,
      width: 1260,
      height: 670,
      rows: 16,
      cols: 4,
      rowTitles: ["Power", "Voltage", "Current"],
      rowTitlesWidth: 300,
      rowTitlesSize: 20,
      colTitles: ["Emerg Gen", "Main Gen 1", "Main Gen 2", "Shaft Gen"],
      colTitlesHeight: 30,
      colTitlesSize: 22,
    })
  );

  navigationMaker(page, name);
  let registerFunc = (_modMan: ModuleManager, _ip: string) => {};
  return { page, registerFunc };
}
