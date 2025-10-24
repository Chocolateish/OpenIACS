import { AccessTypes, defineElement } from "@libBase";
import {
  Button,
  ComponentGroup,
  ComponentGroupBorderStyle,
  InputBox,
  InputBoxTypes,
  Way,
} from "@libComponents";
import { Content, mainWindowManager, UIWindow } from "@libUI";
import { managers, master } from "@system/moduleManagerManager";
import "./timeChanger.scss";

/**This opens the time change dialog*/
export let changeTime = (parent?: Content) => {
  mainWindowManager.appendWindow(
    new UIWindow().options({
      content: new TimeChanger().options({ parent }),
      width: 600,
      height: 400,
    })
  );
};

class TimeChanger extends Content {
  /**Returns the name used to define the element */
  static elementName() {
    return "time-changer";
  }
  static elementNameSpace() {
    return "lmui";
  }

  group = this.appendChild(new ComponentGroup().options({ way: Way.LEFT }));
  update: Button;
  save: ComponentGroup;

  constructor() {
    super();
    this.group.addComponent(
      new Button().options({
        text: "Update automatically from this device",
        click: () => {
          let date = new Date();
          managers().forEach((e) => {
            e.sendMessage("ST", {
              adjust: Math.ceil(date.getTime() / 1000),
              //Timezone disabled until fixed on server
              offset: 0 /*-(date.getTimezoneOffset() / 60)*/,
            });
          });
        },
      })
    );
    let values = {
      adjust: 0,
      offset: 0,
    };
    this.group.addComponent(
      new InputBox().options({
        text: "System Offset UTC±, use this to adjust time offset from UTC",
        type: InputBoxTypes.NUMBER,
        value: master()!.timeOffset,
        unit: "h",
        min: -30,
        max: 30,
        change: (e: number) => {
          values.offset = e;
        },
        //Timezone disabled until fixed on server
        access: AccessTypes.NONE,
      })
    );
    this.group.addComponent(
      new InputBox().options({
        text: "System Time UTC, only set this to correct the UTC time of the system",
        type: InputBoxTypes.DATETIMESECOND,
        change: (e: number) => {
          values.adjust = Math.ceil(new Date(e).getTime() / 1000);
        },
      })
    );
    this.update = this.group.addComponent(
      new Button().options({
        text: "Update manually",
        click: () => {
          managers().forEach((e) => {
            e.sendMessage("ST", values);
          });
        },
      })
    );

    this.save = this.appendChild(
      new ComponentGroup().options({
        way: Way.UP,
        position: Way.DOWN,
        border: ComponentGroupBorderStyle.OUTSET,
      })
    );
    this.save.addComponent(
      new Button().options({
        text: "Close",
        click: () => {
          this.close();
        },
      })
    );
  }
  /**Name of content*/
  get name(): string {
    return "Update System Time";
  }
}
defineElement(TimeChanger);
