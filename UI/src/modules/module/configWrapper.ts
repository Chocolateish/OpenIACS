import { Value } from "@libValues";
import type { ModuleBase } from "@modCommon";

export class ConfigWrapper extends Value {
  private __module: ModuleBase;
  private __promises?: ((value: unknown) => void)[];

  constructor(module: ModuleBase) {
    super({});
    this.__module = module;
  }

  /**Retrieves config data from server or directly if cached*/
  get get() {
    if (this.hasListener) {
      return this.___value;
    } else {
      if (!this.__promises) this.__promises = [];
      let configPromise = new Promise((a) => {
        this.__promises!.push(a);
      });
      return configPromise;
    }
  }

  /**Sends new config data to server */
  set set(configs: {}) {
    if (typeof configs === "object") {
      this.__module.manager.sendMessage("SC", {
        modID: this.__module.uid,
        mid: this.__module.manager.messageID,
        data: configs,
      });
    }
  }

  /** Used when new config is recieved from server*/
  set setSilent(configs: {}) {
    if (this.__promises) for (const prom of this.__promises) prom(configs);
    this.___value = configs;
    this.update();
  }

  /**Overwrite this function to listen to managment events such as when value and unit listeners are added
   * @param type is true on first listener and false on last listener */
  onListener(type: boolean) {
    if (type)
      this.__module.manager.sendMessage("SM", { modID: this.__module.uid });
    else this.___value = {};
  }
}
