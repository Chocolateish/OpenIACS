import { AccessTypes, defineElement } from "@libBase";
import { Button, ComponentGroup, TextBoxValue, Way } from "@libComponents";
import { Err, Ok } from "@libResult";
import { state, stateOk } from "@libState";
import {
  Content,
  type ContentBaseOptions,
  mainWindowManager,
  remToPx,
  UIWindow,
} from "@libUI";
import { Value } from "@libValues";
import { ASWUN } from "@modules/alarm";
import { ModuleManager } from "@system/moduleManager";
import {
  globalEventHandler,
  managerListEvents,
  master,
  masterEventHandler,
} from "@system/moduleManagerManager";
import "./watchSystem.scss";

let watchGroupBuff: false | ASWUN = false;
export let watchGroup = new Value(false, (val) => {
  //@ts-expect-error
  if (val instanceof ASWUN || typeof val === false) {
    return val;
  } else {
    console.warn("None watch group passed");
    return;
  }
});
watchGroup.addListener((val: ASWUN) => {
  if (watchGroupBuff) {
    watchGroupBuff.events.off(
      "updated",
      //@ts-expect-error
      watchGroup._updateListener
    );
  }
  watchGroupBuff = val;
  //@ts-expect-error
  watchGroup._updateListener = val.events.on(
    "updated",
    //@ts-expect-error
    (ev) => {
      updateWatchOptions(val);
    }
  );
  updateWatchOptions(val);
});

export let allowAlarmBuzzer = async (): Promise<boolean> => {
  if (watchGroupBuff) {
    if (watchGroupBuff["buzzWithMaster"]) return true;
    let onWatch = await groupOnWatch;
    if (onWatch.ok)
      return (
        watchGroupBuff === onWatch.value || watchGroupBuff["generalBuzzer"]!
      );
  }
  return true;
};

//Start watch sync when manager is synced
globalEventHandler.on("created", (ev) => {
  let alarmPlugin = (ev.target as ModuleManager).getPluginStorage("ALARM");
  alarmPlugin.watchGroup = new Value(false, (val) => {
    //@ts-expect-error
    if (val instanceof ASWUN || typeof val === false) {
      return val;
    } else {
      console.warn("None watch group passed");
      return;
    }
  });
  return false;
});

//Start watch sync when manager is synced
globalEventHandler.on("synced", (ev) => {
  let selfClient = (ev.target as ModuleManager).getPluginStorage("client").self;
  if (selfClient) {
    let alarmPlugin = (ev.target as ModuleManager).getPluginStorage("ALARM");
    if (alarmPlugin.asreg) {
      let children = alarmPlugin.asreg.children;
      for (let i = 0; i < children.length; i++) {
        if (children[i] instanceof ASWUN) {
          if (children[i].inGroup(selfClient)) {
            alarmPlugin.watchGroup.set = children[i];
            break;
          }
        }
      }
      (ev.target as ModuleManager).sendMessage("AO");
    }
  }
  return false;
});

//Start watch sync when manager is synced
masterEventHandler.on("synced", (ev) => {
  let selfClient = (ev.target as ModuleManager).getPluginStorage("client").self;
  if (selfClient) {
    let asreg = (ev.target as ModuleManager).getPluginStorage("ALARM").asreg;
    if (asreg) {
      let children = asreg.children;
      for (let i = 0; i < children.length; i++) {
        if (children[i] instanceof ASWUN) {
          if (children[i].inGroup(selfClient)) {
            watchGroup.set = children[i];
            break;
          }
        }
      }
    }
  }
  return false;
});

masterEventHandler.on(
  "message",
  (ev) => {
    let dataData = ev.data.data;
    if (typeof dataData["onWatch"] === "number") {
      let watchGroup = master()!.getModuleByUID(dataData["onWatch"]);
      if (watchGroup instanceof ASWUN) _groupOnWatch.set(Ok(watchGroup));
      else
        _groupOnWatch.set(
          Err({ reason: "No watch group on watch", code: "INV" })
        );
    }
  },
  ["A", "O"]
);

masterEventHandler.on(
  "message",
  (ev) => {
    let dataData = ev.data.data;
    if (typeof dataData["toID"] === "number") {
      let watchGroup = master()!.getModuleByUID(dataData["toID"]);
      if (watchGroup instanceof ASWUN) _groupOnWatch.set(Ok(watchGroup));
      else
        _groupOnWatch.set(
          Err({ reason: "No watch group on watch", code: "INV" })
        );
      if (watchChangerOpened) watchChangerOpened.close(true);
    }
  },
  ["A", "W"]
);

/**Whether watch is enabled*/
let _watchEnabled = state<boolean>(Ok(false));
export let watchEnabled = _watchEnabled.readable;

//Listens for change to master system
managerListEvents.on("masterChanged", (ev) => {
  let stor = ev.data.master.getPluginStorage("ALARM");
  if (stor.asreg) _watchEnabled.set(Ok(stor.asreg.watchSystemEnabled));
  return false;
});

//Listens for change to master system
masterEventHandler.on("synced", (ev) => {
  let stor = ev.target.getPluginStorage("ALARM");
  if (stor.asreg) _watchEnabled.set(Ok(stor.asreg.watchSystemEnabled));
  return false;
});

/**Which group is on watch*/
let _groupOnWatch = state<ASWUN>(
  Err({ reason: "No watch group on watch", code: "INV" })
);
export let groupOnWatch = _groupOnWatch.readable;

/**Whether this client can change who is on watch*/
let _canChangeWatch = stateOk<boolean>(Ok(false));
export let canChangeWatch = _canChangeWatch.readable;

/**Whether this client can change who is on watch*/
let _canAcknowledgeWatch = stateOk<boolean>(Ok(true));
export let canAcknowledgeWatch = _canAcknowledgeWatch.readable;

/**Updates watch options from the given watch group*/
let updateWatchOptions = (watchGroup: ASWUN) => {
  _canChangeWatch.set(Ok(watchGroup.canChangeWatch));
  _canAcknowledgeWatch.set(Ok(watchGroup.canAck));
};

/**Requests a watch change from the master server*/
export let requestWatchChange = (watchGroup: ASWUN) => {
  if (watchGroup instanceof ASWUN) {
    master()!.sendMessage("AW", { watchID: watchGroup.uid });
  } else {
    console.warn("WatchGroup must be class ASWUN");
  }
};

/**Selector menu for which group to set watch to */
export class WatchGroupSelector extends Content {
  /**Returns the name used to define the element */
  static elementName() {
    return "watch-group-selector";
  }
  static elementNameSpace() {
    return "lmui";
  }

  constructor() {
    super();
    let stor = master()!.getPluginStorage("ALARM");
    if ("asreg" in stor) {
      let children = stor["asreg"].children;
      for (let i = 0; i < children.length; i++) {
        if (children[i] instanceof ASWUN && children[i].canHaveWatch) {
          this.appendChild(
            new Button().options({
              text: children[i].name,
              click: () => {
                this.close(children[i]);
              },
            })
          );
        }
      }
    } else {
    }
  }

  /**Name of conent */
  get name(): string {
    return "Select Watch Group";
  }
}
defineElement(WatchGroupSelector);

/**Storage for opened watch changer*/
let watchChangerOpened: WatchChanger | false = false;

masterEventHandler.on(
  "message",
  (ev) => {
    let dataData = ev.data.data;
    if ("pendingID" in dataData && "timeOut" in dataData) {
      let group = watchGroup.get as ASWUN;
      if (group) {
        let onWatch = groupOnWatch.get();
        if (
          onWatch.ok &&
          (onWatch.value == group ||
            dataData["pendingID"] == group.uid ||
            canChangeWatch.get().value)
        ) {
          let options: WatchChangerOptions = {
            current: onWatch.value,
            pending: ev.target.getModuleByUID(dataData["pendingID"]) as ASWUN,
            timeout: dataData["timeOut"] as number,
            selfPending: dataData["pendingID"] == group.uid,
          };

          if (!watchChangerOpened) {
            watchChangerOpened = new WatchChanger().options(options);
            watchChangerOpened.whenClosed.then(() => {
              watchChangerOpened = false;
            });
            mainWindowManager.appendWindow(
              new UIWindow().options({
                content: watchChangerOpened,
                width: remToPx(20),
                height: "content",
                maxHeight: "60%",
                moveable: false,
                sizeable: false,
                layer: 1000,
              })
            );
          }
        }
      }
    } else if ("cancel" in ev.data) {
      if (watchChangerOpened) watchChangerOpened.close(true);
    }
  },
  ["A", "w"]
);

/**Defines options for watch changer*/

export type WatchChangerOptions = {
  pending: ASWUN;
  current: ASWUN;
  timeout: number;
  selfPending: boolean;
} & ContentBaseOptions;

/**Menu handling watch change */
class WatchChanger extends Content<WatchChangerOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "watch-changer";
  }
  static elementNameSpace() {
    return "lmui";
  }

  private __group = this.appendChild(
    new ComponentGroup().options({ way: Way.LEFT })
  );
  current = this.__group.addComponent(
    new TextBoxValue().options({ text: "Currently on watch" })
  );
  pending = this.__group.addComponent(
    new TextBoxValue().options({ text: "Pending for watch" })
  );
  timeout = this.__group.addComponent(
    new TextBoxValue().options({ text: "Timeout" })
  );
  acceptButton: Button;
  private __acceptInterval: any;
  private __timeoutTimeout: any;
  private __timeoutInterval: any;

  constructor() {
    super();
    this.__group.addComponent(
      new Button().options({
        text: "Cancel Watch Change",
        click: () => {
          this.close();
        },
      })
    );

    let accept = new Value(false);
    this.acceptButton = this.__group.addComponent(
      new Button().options({
        text: "Accept Watch Change<br>Hold Down 3 sec",
        value: accept,
      })
    );
    accept.addListener((val) => {
      if (val) {
        let acceptTime = 3;
        this.__acceptInterval = setInterval(() => {
          acceptTime--;
          if (acceptTime <= 0) {
            clearInterval(this.__acceptInterval);
            master()!.sendMessage("Aw", { accept: true });
          }
          this.acceptButton.text = `Accept Watch Change<br>Hold Down ${acceptTime} sec`;
        }, 1000);
      } else {
        clearInterval(this.__acceptInterval);
        this.acceptButton.text = `Accept Watch Change<br>Hold Down 3 sec`;
      }
      console.log(val);
    });
  }

  /**Options toggeler*/
  options(options: WatchChangerOptions): this {
    super.options(options);
    if (options.pending) {
      this.pending.value = options.pending.name;
    } else {
      this.pending.value = "None";
    }
    if (options.current) {
      this.current.value = options.current.name;
    } else {
      this.current.value = "None";
    }
    clearInterval(this.__acceptInterval);
    if (options.timeout) {
      clearInterval(this.__timeoutInterval);
      clearTimeout(this.__timeoutTimeout);
      this.timeout.access = AccessTypes.WRITE;
      this.timeout.value = options.timeout;
      this.__timeoutInterval = setInterval(() => {
        (this.timeout.value as number)--;
      }, 1000);
      this.__timeoutTimeout = setTimeout(() => {
        clearInterval(this.__timeoutInterval);
      }, options.timeout * 1000);
    } else {
      this.timeout.access = AccessTypes.NONE;
    }
    if (options.selfPending) this.acceptButton.access = AccessTypes.WRITE;
    else this.acceptButton.access = AccessTypes.READ;
    return this;
  }

  async onClose(server: boolean) {
    if (!server) {
      master()!.sendMessage("Aw", { cancel: true });
    }
    clearInterval(this.__acceptInterval);
    clearInterval(this.__timeoutInterval);
    clearTimeout(this.__timeoutTimeout);
  }

  /**Name of conent */
  get name(): string {
    return "Watch Changeover";
  }
}
defineElement(WatchChanger);
