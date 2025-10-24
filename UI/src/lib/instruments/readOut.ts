import { defineElement } from "@libBase";
import { blue, grey } from "@libColors";
import { defineElementValues, svgMultiLineText } from "@libCommon";
import { addThemeVariable } from "@libTheme";
import { Value } from "@libValues";
import { InstrumentBase, type InstrumentBaseOptions } from "./common";
import "./readOut.scss";

addThemeVariable(
  "instrReadOutTextColor",
  ["Instruments", "Read Out"],
  grey["700"],
  grey["300"]
);
addThemeVariable(
  "instrReadOutValueColor",
  ["Instruments", "Read Out"],
  blue["700"],
  blue["300"]
);

/**Defines options for readOut instrument*/
export type InstrReadOutOptions = {
  value: string | number | Value;
  unit: string | Value;
  decimals: number;
} & InstrumentBaseOptions;

export class InstrReadOut extends InstrumentBase<InstrReadOutOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "readout";
  }

  private __valueCont = this.__svg.appendChild(
    svgMultiLineText(0, 0, 32, 6, "", 5, "value", 2)
  ).firstChild!;
  private __valueText = this.__valueCont.appendChild(
    document.createTextNode("")
  );
  private __unitText = this.__valueCont.appendChild(
    document.createElement("span")
  );
  private ___invalid = true;
  private __decimals?: number;

  constructor() {
    super();
    this.classList.add("invalid");
  }

  /**Options toggeler*/
  options(options: InstrReadOutOptions): this {
    super.options(options);
    if (typeof options.decimals !== "undefined")
      this.__decimals = options.decimals;
    if (typeof options.value !== "undefined") this.value = options.value;
    if (typeof options.unit !== "undefined") this.unit = options.unit;
    return this;
  }

  /**Sets value of readout*/
  set value(_val: string | number | Value) {}

  /**Sets unit of readout*/
  set unit(_val: string | Value) {}

  get renderWidth() {
    return 32;
  }

  get renderHeight() {
    return 32;
  }

  /** Internal value setter*/
  protected $vfvalue(value: any) {
    switch (typeof value) {
      case "number":
        this.__valueText.nodeValue = value.toFixed(this.__decimals);
        if (this.___invalid) {
          this.classList.remove("invalid");
          this.___invalid = false;
        }
        break;
      case "string":
        this.__valueText.nodeValue = value;
        if (this.___invalid) {
          this.classList.remove("invalid");
          this.___invalid = false;
        }
        break;
      case "object":
        this.__valueText.nodeValue = value.reason;
        this.classList.add("invalid");
        this.___invalid = true;
        break;
      default:
        this.__valueText.nodeValue = "N/A";
        this.classList.add("invalid");
        this.___invalid = true;
        break;
    }
  }

  /** Internal Unit setter*/
  protected $vfunit(unit: string) {
    this.__unitText.innerHTML = unit;
  }
}
defineElement(InstrReadOut);
defineElementValues(InstrReadOut, ["value", "unit"]);
