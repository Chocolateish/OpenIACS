import { defineElement } from "@libBase";
import { container_background_color } from "@libColors";
import { line, rectangle, SVGAnchor, svgText } from "@libCommon";
import { addThemeVariable } from "@libTheme";
import { InstrumentBase, type InstrumentBaseOptions } from "./common";
import "./grid.scss";

addThemeVariable(
  "instrTankBackgroundColor",
  ["Instruments", "Button"],
  container_background_color.day,
  container_background_color.dusk
);

/**Defines options for Tank component */
export type InstrGridOptions = {
  rows: number;
  cols: number;
  rowTitles: string[];
  rowTitlesWidth: number;
  rowTitlesSize: number;
  colTitles: string[];
  colTitlesHeight: number;
  colTitlesSize: number;
} & InstrumentBaseOptions;

export class InstrGrid extends InstrumentBase<InstrGridOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "grid";
  }

  private __rows: number = 1;
  private __cols: number = 1;
  private __rowTitles: string[] = [];
  private __rowTitlesWidth: number = 0;
  private __rowTitlesSize: number = 16;
  private __colTitles: string[] = [];
  private __colTitlesHeight: number = 0;
  private __colTitlesSize: number = 16;

  /**Options toggeler*/
  options(options: InstrGridOptions): this {
    super.options(options);
    this.__rows = options.rows;
    this.__cols = options.cols;
    this.__rowTitles = options.rowTitles;
    this.__rowTitlesWidth = options.rowTitlesWidth;
    this.__rowTitlesSize = options.rowTitlesSize;
    this.__colTitles = options.colTitles;
    this.__colTitlesHeight = options.colTitlesHeight;
    this.__colTitlesSize = options.colTitlesSize;
    this.__drawLines();
    return this;
  }

  /**Original width of rendered graphics */
  get renderWidth(): number {
    return this.___width;
  }
  /**Original height of rendered graphics */
  get renderHeight(): number {
    return this.___height;
  }

  private __drawLines() {
    this.__svg.innerHTML = "";
    this.__svg.appendChild(
      rectangle(
        this.___width / 2,
        this.___height / 2,
        this.___width,
        this.___height,
        0
      )
    );
    this.__svg.appendChild(
      line(
        0,
        this.__colTitlesHeight,
        this.___width,
        this.__colTitlesHeight,
        "colTitleLine"
      )
    );
    let rowHeight = (this.___height - this.__colTitlesHeight) / this.__rows;
    for (let r = 1; r < this.__rows; r++) {
      this.__svg.appendChild(
        line(
          0,
          rowHeight * r + this.__colTitlesHeight,
          this.___width,
          rowHeight * r + this.__colTitlesHeight,
          "rowLine"
        )
      );
    }
    for (let r = 0; r < this.__rows; r++) {
      this.__svg.appendChild(
        svgText(
          5,
          rowHeight * r + rowHeight / 2 + this.__colTitlesHeight,
          this.__rowTitles[r] || "",
          this.__rowTitlesSize,
          "rowText",
          SVGAnchor.middleLeft
        )
      );
    }

    this.__svg.appendChild(
      line(
        this.__rowTitlesWidth,
        0,
        this.__rowTitlesWidth,
        this.___height,
        "rowTitleLine"
      )
    );
    let colWidth = (this.___width - this.__rowTitlesWidth) / this.__cols;
    for (let c = 1; c < this.__cols; c++) {
      this.__svg.appendChild(
        line(
          colWidth * c + this.__rowTitlesWidth,
          0,
          colWidth * c + this.__rowTitlesWidth,
          this.___height,
          "colLine"
        )
      );
    }
    for (let c = 0; c < this.__cols; c++) {
      this.__svg.appendChild(
        svgText(
          colWidth * c + colWidth / 2 + this.__rowTitlesWidth,
          5,
          this.__colTitles[c] || "",
          this.__colTitlesSize,
          "colText",
          SVGAnchor.topCenter
        )
      );
    }
  }
}
defineElement(InstrGrid);
