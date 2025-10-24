import { defineElement } from "@libBase";
import { Button, ValueComponent } from "@libComponents";
import { menu } from "@libIcons";
import {
  ListCell,
  ListCellComponents,
  ListCellText,
  ListContainer,
  ListRow,
  type ListRowOptions,
} from "@libLister";
import {
  Content,
  type ContentBaseOptions,
  getWindowManagerFromElement,
  UIWindow,
} from "@libUI";
import "./unitSelector.scss";

const defaultUnits = {
  Acceleration: {
    "Meter/Squaresecond": "m/s²",
    Gravity: "g",
    Galileo: "Gal",
    "Feet/Squaresecond": "ft/s²",
  },
  Angle: {
    Radian: "rad",
    Degree: "°",
    Gradian: "gon",
  },
  Area: {
    "Square Meter": {
      "Square Millimeter": "mm²",
      "Square Centimeter": "cm²",
      "Square Meter": "m²",
      "Square Kilometer": "km²",
    },
    "Square Inch": "in²",
    "Square Foot": "ft²",
    "Square Yard": "yd²",
    "Square Mile": "mi²",
  },
  Consumption: {
    "Liters/Hour": "l/h",
    "Hours/Liter": "h/l",
    "Kilometers/Liter": "km/l",
    "Liters/Kilometer": "l/km",
    "Liters/NauticalMile": "l/NM",
    "NauticalMiles/Liter": "NM/l",
    "Gallons/Hour": "gal/h",
    "Hours/Gallon": "h/gal",
    "Miles/Gallon": "mi/gal",
    "Gallons/Mile": "gal/mi",
    "Gallons/NauticalMile": "gal/NM",
    "NauticalMiles/Gallon": "NM/gal",
  },
  Distance: {
    Metric: { Millimeter: "mm", Centimeter: "cm", Meter: "m", Kilometer: "km" },
    Imperial: { Inch: "in", Foot: "ft", Yard: "yd", Mile: "mi" },
    Fathom: "ftm",
    Nauticalmile: "NM",
  },
  Energy: {
    Joule: { Millijoule: "mJ", Joule: "J", Kilojoule: "kJ", Megajoule: "MJ" },
    Watt: { Milliwatt: "mW", Watt: "W", Kilowatt: "kW", Megawatt: "MW" },
  },
  GPS: {
    "North/South": "N/S",
    "East/West": "E/W",
  },
  Light: {
    Candela: "cd",
    Nit: "nt",
    Lumen: "lm",
    Lux: "lx",
  },
  Mass: {
    Metric: { Milligram: "mg", Gram: "g", Kilogram: "kg", Tonne: "t" },
    Imperial: { Ounce: "oz", Pound: "lb", Stone: "st" },
  },
  Pressure: {
    Pascal: { Millipascal: "mPa", Pascal: "Pa", Kilopascal: "kPa" },
    Bar: { Millibar: "mBar", Bar: "Bar", Megabar: "kBar" },
    Atmosphere: {
      Milliatmosphere: "matm",
      Atmosphere: "atm",
      Kiloatmosphere: "katm",
    },
    Psi: "Psi",
  },
  Speed: {
    "Meters/Hour": "m/h",
    "Kilometers/Hour": "km/h",
    "Meters/Second": "m/s",
    "Kilometers/Second": "km/s",
    "Miles/Hour": "mi/h",
    Knots: "kn",
  },
  Temperature: {
    Celcius: { Millicelsius: "°mC", Celcius: "°C", Kilocelsius: "°kC" },
    Kelvin: { Millikelvin: "mK", Kelvin: "K", Kilokelvin: "kK" },
    Fahrenheit: "°F",
  },
  Volume: {
    "Cubic Meter": {
      "Cubic Millimeter": "mm³",
      "Cubic Centimeter": "cm³",
      "Cubic Meter": "m³",
      "Cubic Kilometer": "km³",
    },
    Liter: "l",
    Imperial: {
      "Cubic Inch": "in³",
      "Cubic Foot": "ft³",
      "Cubic Yard": "yd³",
      "Cubic Mile": "mi³",
    },
    Pint: "p",
    Quart: "qt",
    Gallon: "gal",
  },
  Power: {
    Ampere: { Milliamp: "mA", Ampere: "A", Kiloamp: "kA", Megaamp: "MA" },
    Voltage: { Millivolt: "mV", Volt: "V", Kilovolt: "kV", Megavolt: "MV" },
    Resistance: { Milliohm: "mΩ", Ohm: "Ω", Kiloohm: "kΩ", Megaohm: "MΩ" },
    Frequency: { Hertz: "Hz", Kilohertz: "kHz", Megahertz: "MHz" },
    "Kilo Volt Ampere": "kVA",
  },
  Force: {
    Millinewton: "mN",
    Newton: "N",
    Kilonewton: "kN",
    Meganewton: "MN",
  },
  Torque: {
    "Millinewton Meter": "mNm",
    "Newton Meter": "Nm",
    "Kilonewton Meter": "kNm",
    "Meganewton Meter": "MNm",
  },
  Percent: {
    Percent: "%",
    Permille: "‰",
  },
  Time: {
    Microsecond: "µs",
    Millisecond: "ms",
    Second: "s",
    Minute: "min",
    Hour: "hr",
    Day: "d",
    Week: "wk",
    Month: "mon",
    Year: "yr",
  },
  Other: {
    RPM: "RPM",
    Digital: "I/O",
  },
} as const;

export type UnitSelectorOptions = {} & ContentBaseOptions;
export type UnitSelectorCallback = (unit: string) => void;

class UnitSelector extends Content {
  /**Returns the name used to define the element */
  static elementName() {
    return "unit-selector";
  }
  static elementNameSpace() {
    return "lmui";
  }

  //@ts-expect-error
  private __callbacks: UnitSelectorCallback[] = [];

  private __list = this.appendChild(
    new ListContainer().options({
      header: ["Name", "Symbol", "Select"],
      sizeable: false,
    })
  );
  constructor() {
    super();
    for (const key in defaultUnits) {
      const groupName = key as keyof typeof defaultUnits;
      this.__list.addRow(
        new UnitGroupRow({
          group: defaultUnits[groupName],
          groupName: key,
          top: this,
        })
      );
    }
  }

  /**Name of content */
  get name(): string {
    return "Unit Selector";
  }

  /**Function for unit row to called when selection happens */
  protected __finish(unit: string) {
    this.close(unit);
  }
}
defineElement(UnitSelector);

/**Options for unit group row*/
type UnitGroupRowOptions = {
  top: UnitSelector;
  group: {};
  groupName: string;
} & ListRowOptions;

class UnitGroupRow extends ListRow<UnitGroupRowOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "unit-group-row";
  }
  static elementNameSpace() {
    return "lmui";
  }

  private __top: UnitSelector;
  private __group: { [key: string]: string | {} };
  //@ts-expect-error
  private __name: ListCellText;

  /**Creates an instance of the content*/
  constructor(options: UnitGroupRowOptions) {
    super();
    this.openable = true;
    this.__top = options.top;
    this.__group = options.group;
    this.addCell(
      (this.__name = new ListCellText().options({ text: options.groupName }))
    );
    this.addCell(new ListCell().options({}));
    this.addCell(new ListCell().options({}));
  }

  async openFunc() {
    let rows: (UnitRow | UnitGroupRow)[] = [];
    for (const key in this.__group) {
      if (typeof this.__group[key] === "string") {
        rows.push(
          new UnitRow({
            unit: this.__group[key],
            unitName: key,
            top: this.__top,
          })
        );
      } else {
        rows.push(
          new UnitGroupRow({
            group: this.__group[key],
            groupName: key,
            top: this.__top,
          })
        );
      }
    }
    return rows;
  }
}
defineElement(UnitGroupRow);

/**Options for unit row*/
type UnitRowOptions = {
  top: UnitSelector;
  unit: string;
  unitName: string;
} & ListRowOptions;

class UnitRow extends ListRow {
  /**Returns the name used to define the element */
  static elementName() {
    return "unit-row";
  }
  static elementNameSpace() {
    return "lmui";
  }

  private __top: UnitSelector;
  //@ts-expect-error
  private __name: ListCellText;
  //@ts-expect-error
  private __unit: ListCellText;

  /**Creates an instance of the content*/
  constructor(options: UnitRowOptions) {
    super();
    this.__top = options.top;
    this.__name = this.addCell(
      new ListCellText().options({ text: options.unitName })
    );
    this.__unit = this.addCell(
      new ListCellText().options({ text: options.unit })
    );

    this.addCell(
      new ListCellComponents().options({
        components: [
          new Button().options({
            text: "Select",
            click: () => {
              //@ts-expect-error
              this.__top.__finish(options.unit);
            },
          }),
        ],
      })
    );
  }
}
defineElement(UnitRow);

export class UnitSelectorOpener extends ValueComponent {
  /**Returns the name used to define the element */
  static elementName() {
    return "unit-selector-opener";
  }
  static elementNameSpace() {
    return "lmui";
  }

  private __text: any;
  private __input: HTMLInputElement;
  private __button: any;
  private __selectorOpen?: boolean;
  private __selector?: UnitSelector;

  constructor() {
    super();
    let container = document.createElement("div");
    this.appendChild(container);
    container.appendChild((this.__input = document.createElement("input")));
    this.__input.maxLength = 20;
    this.__input.addEventListener("beforeinput", (e) => {
      if (!e.inputType.includes("delete")) {
        if (
          encodeURIComponent(this.__input.value).replace(/%[A-F\d]{2,6}/g, "U")
            .length >= 20
        ) {
          e.preventDefault();
        }
      }
    });
    this.__input.addEventListener("change", () => {
      this.__setValue(this.__input.value);
    });
    container.appendChild(
      (this.__button = new Button().options({ symbol: menu() }))
    );
    this.__button.onclick = async () => {
      if (!this.__selectorOpen) {
        this.__selectorOpen = true;
        this.__selector = new UnitSelector();
        getWindowManagerFromElement(this).appendWindow(
          new UIWindow().options({
            content: this.__selector,
            width: "80%",
            height: "80%",
          })
        );
        let res = await this.__selector.whenClosed;
        if (res && typeof res == "string") this.__setValue(res);
        this.__selectorOpen = false;
      }
    };
  }

  set text(text: string) {
    if (typeof text == "string") {
      if (!this.__text) {
        this.__text = this.insertBefore(
          document.createElement("span"),
          this.firstChild
        );
      }
      this.__text.innerHTML = text;
    } else if (this.__text) {
      this.removeChild(this.__text);
      delete this.__text;
    }
  }

  /**This is called when the user sets the value*/
  protected __newValue(val: string) {
    this.__input.value = val;
  }
}
defineElement(UnitSelectorOpener);
