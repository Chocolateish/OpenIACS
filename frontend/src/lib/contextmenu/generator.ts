import { Devider } from "./devider";
import { Line } from "./line";
import { type Lines } from "./menu";
import { Option } from "./option";
import { Submenu } from "./submenu";

/**All options needed for creating a context menu line */
type LineOptions = {
  /**Text for line */
  text: string;
  /**Action for click on line */
  action?: () => void;
  /**Icon for line */
  icon?: SVGSVGElement;
  /**Keyboard shortcut for action */
  shortcut?: string;
  /**If the lines functionality is already active */
  checkmark?: boolean;
  /**Lines for sub menu */
  lines?: LinesOptions | Lines;
};

/**A line for the context menu */
type LinesOptions =
  | (LineOptions | number | (() => LineOptions | number))[]
  | (() =>
      | (LineOptions | number | (() => LineOptions | number))[]
      | Promise<(LineOptions | number | (() => LineOptions | number))[]>);

export let linesGenerator = async (
  options: LinesOptions | Lines
): Promise<Line[]> => {
  let optionsInst = typeof options === "function" ? options() : options;
  if (optionsInst instanceof Promise) {
    let optionsSync = await optionsInst;
    return linesGenerator(optionsSync);
  } else {
    let lines: Line[] = [];
    for (let i = 0; i < optionsInst.length; i++) {
      let option = optionsInst[i];
      let optionInst = typeof option === "function" ? option() : option;
      if (typeof optionInst === "number") {
        lines.push(new Devider());
      } else {
        if (optionInst instanceof Line) {
          lines.push(optionInst);
        } else if (optionInst.action) {
          lines.push(
            new Option(
              optionInst.text,
              optionInst.action,
              optionInst.icon,
              optionInst.shortcut,
              optionInst.checkmark
            )
          );
        } else if (optionInst.lines) {
          lines.push(
            new Submenu(
              optionInst.text,
              linesGenerator(optionInst.lines),
              optionInst.icon
            )
          );
        } else {
          console.warn(
            "Invalid option passed, missing either action or lines option",
            option
          );
        }
      }
    }
    return lines;
  }
};
