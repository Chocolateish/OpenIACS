import { ValueAsync } from "@libValues";
import { Module } from "./module";

export class InstrumentAPI extends ValueAsync {
  private __module: Module;

  constructor(module: Module<any, any>) {
    super();
    this.__module = module;
  }

  onListener(type: boolean) {
    if (type) {
      // @ts-expect-error
      this.__module.___instrumentAddUser();
    } else {
      // @ts-expect-error
      this.__module.___instrumentRemoveUser();
    }
  }

  /**This is called when the getter is used*/
  __getValueAsync() {
    this.__module.manager.sendMessage("IV", [this.__module.uid]);
  }

  /**Sends a command to the module
   * @param  command command code
   * @param data data to send along command
   * @param  response if command has response, if set true, method returns a promise of command response data*/
  command(command: string, data: { [key: string]: any }, response?: boolean) {
    let messageID = this.__module.manager.messageID;
    this.__module.manager.sendMessage("IC", {
      modID: this.__module.uid,
      mid: messageID,
      command: command,
      data: data,
    });
    if (response)
      return new Promise((a) => {
        this.__module.manager.registerMessagePromise(messageID, a);
      });
    return undefined;
  }
}
