import { InstrBackground } from "@libInstr";
import { ScaledPage } from "@libPages";
import { ModuleManager } from "@system/moduleManager";
import background from "./frontpage.svg?raw";
import { readOutMakerManual, textMaker } from "./helpers";

let full = { x: 0, y: 0, width: 1280, height: 752 };

export function frontpageFunc(
  navigationMaker: (page: ScaledPage, pageName: string) => void,
  name: string
) {
  let page = new ScaledPage().options(full);
  page.appendInstrument(new InstrBackground().options({ background, ...full }));

  textMaker(page, [{ x: 20, y: 20, text: "INSERT SHIPNAME HERE ", size: 100 }]);
  readOutMakerManual(page, {
    depthAft: { x: 100, y: 100 },
  });

  navigationMaker(page, name);
  let registerFunc = (_modMan: ModuleManager, _ip: string) => {};
  return { page, registerFunc };
}
