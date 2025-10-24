import { defineElement } from "@libBase";
import { Button } from "@libComponents";
import {
  ListCellComponents,
  ListCellText,
  ListContainer,
  ListRow,
  type ListRowOptions,
} from "@libLister";
import { Content } from "@libUI";
import { Module, registerModule } from "@module/module";
import { registerInitialDataDecoder } from "@system/initialData";
import "./WLOCA.scss";

registerInitialDataDecoder("WLOCA", (_manager, storage, data) => {
  if ("cards" in data) {
    if (!("cards" in storage)) storage.cards = {};
    for (const key in data.cards) storage.cards[key] = data.cards[key];
  }
});

//Local Cards
export class WLOCA extends Module {
  get name() {
    return "Local IO Cards";
  }

  /**Provides list of sub modules available for the module*/
  subModuleAdder(options: CardAdderOptions): CardAdder {
    return new CardAdder({ ...options, ...{ module: this } });
  }

  /**Whether the module can add sub modules */
  get canAddSubModules() {
    return true;
  }
}
registerModule("WLOCA", WLOCA);

type CardAdderOptions = {
  module: WLOCA;
};

class CardAdder extends Content {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-adder-wloca";
  }
  static elementNameSpace() {
    return "lmui";
  }

  private __list = this.appendChild(
    new ListContainer().options({
      header: ["Card", "Description", "Add"],
      sizeable: false,
    })
  );
  readonly module: WLOCA;

  /**This creates an instance of the editor*/
  constructor(options: CardAdderOptions) {
    super();
    this.module = options.module;
    let cards = options.module.manager.getInitialData("WLOCA", "cards") as
      | {
          [key: string]: { des: string; desc: string };
        }
      | undefined;
    if (!cards) return;
    for (const key in cards) {
      this.__list.addRow(
        new CardRow({
          cardNum: key,
          cardDes: cards[key].des,
          card: cards[key],
          top: this,
        })
      );
    }
  }

  get name() {
    return "Wago Local Cards";
  }
}
defineElement(CardAdder);

/**Options for card row*/
type CardRowOptions = ListRowOptions & {
  cardNum: string;
  cardDes: string;
  card: { desc: string };
  top: CardAdder;
};

class CardRow extends ListRow {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-adder-wloca-row";
  }
  static elementNameSpace() {
    return "lmui";
  }

  /**Creates an instance of the content*/
  constructor(options: CardRowOptions) {
    super();
    this.addCell(
      new ListCellText().options({
        text: options.cardNum
          .replace(/(\/0000-0000)|(^0)/g, "")
          .replace(/-0/g, "-"),
      })
    );
    this.addCell(new ListCellText().options({ text: options.card.desc }));
    this.addCell(
      new ListCellComponents().options({
        components: [
          new Button().options({
            text: "Add",
            click: () => {
              options.top.module.subModuleAdd(options.cardDes, {
                order: options.cardNum,
              });
            },
          }),
        ],
      })
    );
  }
}
defineElement(CardRow);
