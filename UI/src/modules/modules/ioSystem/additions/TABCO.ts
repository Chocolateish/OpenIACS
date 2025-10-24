import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { UnitSelectorOpener } from "@components/unitSelector";
import { defineElement } from "@libBase";
import { objectEquals } from "@libCommon";
import {
  Button,
  ComponentGroup,
  InputBox,
  InputBoxTypes,
  type ComponentInternalValue,
} from "@libComponents";
import {
  ListCellComponents,
  ListContainer,
  ListRow,
  type ListRowOptions,
} from "@libLister";
import { Value } from "@libValues";
import { registerModule } from "@module/module";
import { VABAS } from "../../VABAS";

export class TABCO extends VABAS {
  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return () => {
      return "Table Converter";
    };
  }

  /**Returns whether the module has settings*/
  get hasSettings() {
    return true;
  }

  /**Generates an instance of the modules setting content*/
  async generateSettingsContent(
    options: ModuleSettingsOptions
  ): Promise<ModuleSettings> {
    //@ts-expect-error
    return new EDITOR().options(options);
  }
}
registerModule("TABCO", TABCO);

class EDITOR extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "tabco";
  }

  unit = this.group.addComponent(
    new UnitSelectorOpener().options({ id: "unit", access: this.userAccess })
  );
  tableLength = new Value(0);
  private __amountConvert = this.group.addComponent(
    new InputBox().options({
      value: this.tableLength,
      text: "Amount of points (Paste from excel here, two collums)",
      type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
    })
  );
  private __clipGroup = this.group.addComponent(
    new ComponentGroup().options({
      components: [
        new Button().options({
          text: "Paste from clipboard",
          click: async () => {
            this.paste = await navigator.clipboard.readText();
          },
        }),
        new Button().options({
          text: "Copy to clipboard",
          click: () => {
            navigator.clipboard.writeText(this.copy);
          },
        }),
      ],
    })
  );
  private __list = this.group.appendChild(
    new ListContainer().options({
      sizeable: false,
      header: ["Input", "Output"],
    })
  );
  private __rows: TableConverterEditorRow[] = [];
  private __axisBuffer: any;

  constructor() {
    super();
    this.__clipGroup;
    this.tableLength.addListener((val) => {
      if (val > this.__rows.length) {
        for (let i = this.__rows.length; i < val; i++) {
          this.__rows[i] = new TableConverterEditorRow();
          this.__list.addRow(this.__rows[i], i);
        }
      } else if (val < this.__rows.length) {
        for (let i = this.__rows.length; i > val; i--) {
          this.__rows[i - 1].remove();
          this.__rows.splice(i - 1, 1);
        }
      }
    });
  }

  protected __updateModuleValue() {
    this.unit.value = this.__module!.unit.get;
  }

  /** Updates special values from the module*/
  protected __newConfigs(val: { [key: string]: any }) {
    super.__newConfigs(val);
    this.__amountConvert.max = val["maxAmount"];
    this.tableLength.set = val["axis"].length;
    this.__axisBuffer = val["axis"];
    for (let i = 0; i < val["axis"].length; i++)
      this.__rows[i].options(val["axis"][i]);
  }

  /**Must be set true to show save button*/
  get canSave(): boolean {
    return true;
  }

  /** Saves the given data*/
  protected __saveSettings() {
    let saveData: {
      axis?: {
        xAxis: ComponentInternalValue | undefined;
        yAxis: ComponentInternalValue | undefined;
      }[];
    } = {};
    let axisData = this.__rows.map((e) => {
      return { xAxis: e.xInput.value, yAxis: e.yInput.value };
    });
    if (!objectEquals(axisData, this.__axisBuffer)) saveData["axis"] = axisData;
    super.__saveSettings(saveData);
  }

  protected defaultName(): string {
    return "Table Converter Editor";
  }

  onpasteglobal = async (e: ClipboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.paste = e.clipboardData!.getData("text/plain");
  };
  oncopyglobal = (e: ClipboardEvent) => {
    e.preventDefault();
    e.clipboardData!.setData("text/plain", this.copy);
  };

  set paste(text: string) {
    let data = text
      .replace(/^\s+|\s+$/g, "")
      .replace(/\n|\r\n|\r|\n\r/g, "\n")
      .split("\n")
      .map((e) => {
        return e.split("\t").map((e) => {
          return parseFloat(e.replace(",", "."));
        });
      });
    this.tableLength.set = data.length;
    data.forEach((e, i) => {
      this.__rows[i].xInput.value = e[0];
      this.__rows[i].yInput.value = e[1];
    });
  }

  get copy(): string {
    return this.__rows
      .map((e) => e.xInput.value + "\t" + e.yInput.value)
      .join("\n");
  }
}
defineElement(EDITOR);

/**Options for module row*/

type TableConverterEditorRowOptions = {
  xAxis?: number;
  yAxis?: number;
} & ListRowOptions;

class TableConverterEditorRow extends ListRow {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-settings-tabco-row";
  }
  static elementNameSpace() {
    return "lmui";
  }

  readonly xInput = new InputBox().options({
    value: 0,
    type: InputBoxTypes.NUMBER,
  });
  readonly yInput = new InputBox().options({
    value: 0,
    type: InputBoxTypes.NUMBER,
  });

  constructor() {
    super();
    this.addCell(
      new ListCellComponents().options({ components: [this.xInput] })
    );
    this.addCell(
      new ListCellComponents().options({ components: [this.yInput] })
    );
  }

  /**Options toggeler*/
  options(options: TableConverterEditorRowOptions): this {
    super.options(options);
    this.xInput.value = options["xAxis"] ?? 0;
    this.yInput.value = options["yAxis"] ?? 0;
    return this;
  }
}
defineElement(TableConverterEditorRow);
