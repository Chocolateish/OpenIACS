import { defineElement } from "@libBase";
import { Button } from "@libComponents";
import {
  ListCellComponents,
  ListCellText,
  ListContainer,
  ListRow,
} from "@libLister";
import { Content, type ContentBaseOptions } from "@libUI";
import { Module, registerModule } from "@module/module";

//NMEA0183 Sentences
export class NMSEG extends Module {
  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return () => {
      return "NMEA0183 Sentence";
    };
  }

  get name() {
    return "NMEA0183 Sentence";
  }

  /**Provides list of sub modules available for the module*/
  subModuleAdder(options: SentenceAdderOptions): SentenceAdder {
    return new SentenceAdder({ ...options, ...{ module: this } });
  }

  /**Whether the module can add sub modules*/
  get canAddSubModules(): boolean {
    return true;
  }
}
registerModule("NMSEG", NMSEG);

type NMEA0183Sentence = {
  id: string;
  dec: string;
};

let NMEA0183Sentences: NMEA0183Sentence[] = [
  { id: "GPGLL", dec: "" },
  { id: "GPGLC", dec: "" },
  { id: "GPGGA", dec: "" },
  { id: "HCHDG", dec: "" },
  { id: "NMPPE", dec: "" },
  { id: "NMWWR", dec: "" },
  { id: "NMGMC", dec: "" },
  { id: "HEROT", dec: "" },
];

type SentenceAdderOptions = {
  module: NMSEG;
} & ContentBaseOptions;

class SentenceAdder extends Content {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-adder-nmseg";
  }
  static elementNameSpace() {
    return "lmui";
  }

  private __list: ListContainer;
  private __module: NMSEG;

  /**This creates an instance of the editor*/
  constructor(options: SentenceAdderOptions) {
    super();
    this.appendChild(
      (this.__list = new ListContainer().options({
        header: ["Indentifiers", "Description", "Add"],
        sizeable: false,
      }))
    );
    this.__module = options.module;
    for (const listindex in NMEA0183Sentences) {
      this.__list.addRow(
        //@ts-expect-error
        SentenceRow.create({ id: listindex.id, dec: listindex.dec, top: this })
      );
    }
  }

  get module(): NMSEG {
    return this.__module;
  }

  protected defaultName(): string {
    return "NMEA0183 Sentences";
  }
}
defineElement(SentenceAdder);

type SentenceOptions = {
  id: string;
  dec: string;
  top: SentenceAdder;
};

class SentenceRow extends ListRow {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-settings-nmseg-sentence-row";
  }
  static elementNameSpace() {
    return "lmui";
  }

  /**Creates an instance of the content*/
  constructor(options: SentenceOptions) {
    super();
    this.addCell(new ListCellText().options({ text: options.id }));
    this.addCell(new ListCellText().options({ text: options.dec }));
    this.addCell(
      new ListCellComponents().options({
        components: [
          new Button().options({
            text: "Add",
            click: () => {
              options.top.module.subModuleAdd(options.id, {
                order: options.id,
              });
            },
          }),
        ],
      })
    );
  }
}
