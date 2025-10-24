import { InstrBackground } from "@libInstr";
import { ScaledPage } from "@libPages";
import { ModuleManager } from "@system/moduleManager";
import { textMaker } from "./helpers";
import background from "./pagePMS.svg?raw";

let full = { x: 0, y: 0, width: 1280, height: 752 };

export function pms1Gen(
  navigationMaker: (page: ScaledPage, pageName: string) => void,
  name: string
) {
  let page = new ScaledPage().options(full);
  page.appendInstrument(new InstrBackground().options({ background, ...full }));

  textMaker(page, [{ x: 10, y: 10, text: "PMS1", size: 20 }]);

  navigationMaker(page, name);
  let registerFunc = (_modMan: ModuleManager, _ip: string) => {};
  return { page, registerFunc };
}
