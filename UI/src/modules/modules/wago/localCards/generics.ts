import { Err, Ok, type Result } from "@libResult";
import { Module, registerModule } from "@module/module";

export type WCARDPreConfig = {
  cardNum: string;
};

//Wago Card Base
export class WCARD extends Module {
  readonly cardNum?: string;

  preConfigTransform(
    configs: Partial<WCARDPreConfig>
  ): Result<WCARDPreConfig, string> {
    if (typeof configs["cardNum"] !== "string")
      return Err("Invalid or missing cardNum");
    //@ts-expect-error
    this.cardNum = configs["cardNum"];
    return Ok({
      cardNum: configs["cardNum"],
    });
  }

  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return (_values: string[]) => {
      let cards = this.manager.getInitialData("WLOCA", "cards") as
        | {
            [key: string]: { desc: string };
          }
        | undefined;
      let card = this.cardNum;
      if (card && cards) {
        return (
          "Card:" +
          this.sid +
          " " +
          card.replace(/(\/0000-0000)|(^0)/g, "").replace(/-0/g, "-") +
          " " +
          cards[card].desc
        );
      } else {
        return "";
      }
    };
  }
}

//#####     Generic Cards       #####
//Wago Generic Digital Input Output Card
export class WGDIO extends WCARD {}
registerModule("WGDIO", WGDIO);

//Wago Generic Digital Output Card
export class WGDOU extends WCARD {}
registerModule("WGDOU", WGDOU);

//Wago Generic Digital Input Card
export class WGDIN extends WCARD {}
registerModule("WGDIN", WGDIN);

//Wago Generic Analog Output Card
export class WGAOU extends WCARD {}
registerModule("WGAOU", WGAOU);

//Wago Generic Analog Input Card
export class WGAIN extends WCARD {}
registerModule("WGAIN", WGAIN);
