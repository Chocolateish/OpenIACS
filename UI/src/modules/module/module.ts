import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { AccessTypes } from "@libBase";
import { InputBoxTypes } from "@libComponents";
import { EventHandler, type ESubscriber } from "@libEvent";
import { close, done } from "@libIcons";
import { promptButtons, PromptCodes, promptInput } from "@libPrompts";
import { Err, Ok, type Result } from "@libResult";
import {
  state,
  stateOk,
  type State,
  type StateOk,
  type StateRead,
} from "@libState";
import { Content, type ContentBase } from "@libUI";
import { Value, ValueProxy } from "@libValues";
import {
  ModuleValueAccessEnum,
  type ModuleBase,
  type ModuleBaseFixedConfigs,
  type ModuleBasePreConfigs,
  type ModuleDesignator,
  type ModuleEvents,
  type ModuleManagerBase,
} from "@modCommon";
import { InstrumentAPI } from "./moduleInstrument";
import { ModuleValue, ModuleValueFormatted } from "./moduleValue";

/*
This adds specialised functionality to different modules
.updateExt(values) is for when a module has special values which are delivered via the sync
.initSettings(node,values,mod) if this method is present, the settings button will be shown for the module
the node is the node in which the settings should be created
the values are the initial values retreived from the PLC for the settings
the mod is the module itself
.saveSettings(node,mod) if this method is present, the save button will be shown for the module
the node is the node in which the settings are
the mod is the module being saved
.updateSettings(node,mod) if this method is present, it is called when the module is updated when the settings are open
the node is the node in which the settings are
the mod is the module being updated
.text(values) if this method is present, it will override the text shown about the module in most places
if the module uses textValues, the values retrieved are passed to the method in values
.addSubModules() if this method is present, a botton for adding sub modules is shown
it must return a named list with functions eg {Alarm(mod){code},AlarmList(mod){code}}
when the user adds the module, the function is called with the parent module as parameter

Name expressions
$pat inserts the .text of the parent
$par inserts the name of the parent
$sub inserts the sub id of the module
$uid inserts the uid of the module
$des inserts the des of the module
$uns inserts the unit symbol of the module

The module also has an event handler with the following events available
updated = when updated value are recieved {data:{}}
removed = when module is removed {}
settings = when new setting values are retreived {data:{}}
cyclicSettings = when cyclic settings values are recieved {data:{}}
settingCommand = when setting based command is recieved {data:{}}
*/

export class Module<PreConfigs extends {} = {}, Configs extends {} = {}>
  implements ModuleBase<PreConfigs, Configs>
{
  protected _events = new EventHandler<
    ModuleEvents,
    ModuleBase<PreConfigs, Configs>
  >(this as ModuleBase<PreConfigs, Configs>);
  /**Module Events */
  readonly events = this._events.consumer;

  /**Module Manager */
  readonly manager: ModuleManagerBase;

  /**Fixed Module Base Configs*/
  readonly baseFixedConfigs: ModuleBaseFixedConfigs;
  /**Changeable Module Base Configs*/
  protected ___basePreConfigs: StateOk<ModuleBasePreConfigs>;
  readonly basePreConfigsState: StateRead<ModuleBasePreConfigs>;
  readonly basePreConfigs: ModuleBasePreConfigs;

  /**Preloaded Configs are loaded during sync and kept updated*/
  protected ___preConfigs: State<PreConfigs, PreConfigs> = state(
    Err({ reason: "Configs not loaded", code: "NRD" })
  );
  readonly preConfigsState = this.___preConfigs.readable;
  readonly preConfigs: PreConfigs;
  /**Configs are only retrieved from server when needed*/
  protected ___configs: State<Configs, Configs> = state(
    Err({ reason: "Configs not loaded", code: "NRD" })
  );
  readonly configs = this.___configs.readable;

  /**The parent of the module*/
  private ___parent?: Module | undefined;
  /**List of all direct child modules*/
  private ___moduleChildren: Module[] = [];
  /**Name of module */
  private ___name: string = "";

  /**Type of module value*/
  private ___valueAccess?: ModuleValueAccessEnum;

  //##############  Value
  private ___valueAmountUsers = 0;
  value: ModuleValue = new ModuleValue(this as any);
  valueFormatted: ModuleValueFormatted = new ModuleValueFormatted(this.value);
  unit = new Value("");

  //##############  Instrument
  private ___instrumentAmountUsers = 0;
  instrument = new InstrumentAPI(this);

  //############## Command
  private ___commandNum = 0;
  private ___commands: { [key: string]: (d: { [key: string]: any }) => void } =
    {};

  //##############  Acess
  private _accessValue = stateOk<AccessTypes>(Ok(AccessTypes.READ));
  private _accessConfig = stateOk<AccessTypes>(Ok(AccessTypes.READ));
  private _accessCommand = stateOk<AccessTypes>(Ok(AccessTypes.READ));
  private _accessViewing = stateOk<AccessTypes>(Ok(AccessTypes.READ));
  accessValue = this._accessValue.readable;
  accessConfig = this._accessConfig.readable;
  accessCommand = this._accessCommand.readable;
  accessViewing = this._accessViewing.readable;
  readonly user = 0;
  readonly user2 = 0;
  private ___accessListener?: ESubscriber<any, any, any>;

  //##############  Status
  /**The status value object for the module*/
  status = new Value(0);
  /**The status text value object for the module*/
  statusText = new ValueProxy(this.status, this.___statusText());
  private ___statusAmountUsers = 0;

  constructor(
    manager: ModuleManagerBase,
    baseFixed: ModuleBaseFixedConfigs,
    basePre: ModuleBasePreConfigs,
    preConfigs: PreConfigs
  ) {
    this.manager = manager;
    this.baseFixedConfigs = baseFixed;
    this.___basePreConfigs = stateOk<ModuleBasePreConfigs>(Ok(basePre));
    this.basePreConfigsState = this.___basePreConfigs.readable;
    this.basePreConfigs = basePre;
    this.___basePreConfigs.subscribe((res) => {
      //@ts-expect-error
      if (res.ok) this.basePreConfigs = res.value;
    });
    this.___preConfigs.set(Ok(preConfigs));
    this.preConfigs = preConfigs;

    this.status.onListener = (type) => {
      if (type) this.___statusStartConnection();
      else this.___statusStopConnection();
    };
  }

  /**Creates an instance of the module manager*/
  static create(
    manager: ModuleManagerBase,
    options: { [key: string]: any },
    moduleClass: typeof Module
  ): Result<Module, string> {
    let baseFixedConfig = this.baseFixedConfigExtractor(options);
    if (baseFixedConfig.err) return baseFixedConfig;
    let basePreConfig = this.basePreConfigExtractor(options);
    if (basePreConfig.err) return basePreConfig;
    let preConfig = moduleClass.prototype.preConfigTransform(options);
    if (preConfig.err) return preConfig;
    return Ok(
      new moduleClass(
        manager,
        baseFixedConfig.value,
        basePreConfig.value,
        preConfig.value
      )
    );
  }

  static baseFixedConfigExtractor(options: {
    [key: string]: any;
  }): Result<ModuleBaseFixedConfigs, string> {
    if (typeof options.uid !== "number") return Err("uid missing");
    if (typeof options.des !== "string") return Err("des missing");
    if (typeof options.manager !== "object") return Err("manager missing");
    if (typeof options.pid !== "number") return Err("pid missing");
    return Ok({
      uid: options.uid,
      des: options.des,
      manager: options.manager,
      pid: options.pid,
    });
  }
  static basePreConfigExtractor(options: {
    [key: string]: any;
  }): Result<ModuleBasePreConfigs, string> {
    if (typeof options.sid !== "number") return Err("sid missing");
    if (typeof options.name !== "string") return Err("name missing");
    if (typeof options.access !== "number") return Err("access missing");
    if (typeof options.unit !== "number") return Err("unit missing");
    if (typeof options.vt !== "number") return Err("value type missing");
    if (typeof options.va !== "number") return Err("value access missing");
    if (typeof options.vf !== "number") return Err("value format missing");
    if (typeof options.user !== "number") return Err("user missing");
    if (typeof options.user2 !== "number") return Err("user2 missing");
    return Ok({
      sid: options.sid,
      name: options.name,
      access: options.access,
      unit: options.unit,
      vt: options.vt,
      va: options.va as ModuleValueAccessEnum,
      vf: options.vf,
      user: options.user,
      user2: options.user2,
    });
  }

  preConfigTransform(_configs: {
    [key: string]: any;
  }): Result<PreConfigs, string> {
    return Ok({} as PreConfigs);
  }
  configTransform(_configs: { [key: string]: any }): Result<Configs, string> {
    return Ok({} as Configs);
  }

  /***/
  updatePreConfigs(
    synced: boolean,
    options: { [key: string]: any }
  ): Result<{}, string> {
    let basePreConfig = Module.basePreConfigExtractor(options);
    if (basePreConfig.err) return basePreConfig;
    let preConfig = this.preConfigTransform(options);
    if (preConfig.err) return preConfig;
    this.___basePreConfigs.set(Ok(basePreConfig.value));
    //@ts-expect-error
    this.basePreConfigs = basePreConfig.value;
    this.___preConfigs.set(Ok(preConfig.value));
    if (synced) this.__linking();
    this._events.emit("updated", {});
    return Ok({});
  }

  /**Updates modules config storage*/
  updateConfigs(options: { [key: string]: any }): Result<{}, string> {
    let config = this.configTransform(options);
    if (config.err) return config;
    this.___configs.set(Ok(config.value));
    return Ok({});
  }

  /**This overwriteable method is run after value update, to let module link references to each other
   * During sync, the linking is run after all modules have been synced, to avoid linking to none existing modules*/
  protected __linking() {}

  /**This tells the manager that is has been removed and should clean up afte itself*/
  protected __remove() {
    this.___updateParent();
    this._events.emit("removed", {});
  }

  //#######################################################################################################################################################################################
  //#    _____ _   _ ______ ____  _____  __  __       _______ _____ ____  _   _    ########################################################################################################
  //#   |_   _| \ | |  ____/ __ \|  __ \|  \/  |   /\|__   __|_   _/ __ \| \ | |   ########################################################################################################
  //#     | | |  \| | |__ | |  | | |__) | \  / |  /  \  | |    | || |  | |  \| |   ########################################################################################################
  //#     | | | . ` |  __|| |  | |  _  /| |\/| | / /\ \ | |    | || |  | | . ` |   ########################################################################################################
  //#    _| |_| |\  | |   | |__| | | \ \| |  | |/ ____ \| |   _| || |__| | |\  |   ########################################################################################################
  //#   |_____|_| \_|_|    \____/|_|  \_\_|  |_/_/    \_\_|  |_____\____/|_| \_|   ########################################################################################################
  //#######################################################################################################################################################################################
  /**Returns the unique id of the module*/
  get uid(): number {
    return this.baseFixedConfigs.uid;
  }

  /**Returns the modules designator*/
  get designator(): ModuleDesignator {
    return this.baseFixedConfigs.des;
  }

  /**Returns modules parents id*/
  get pid(): number {
    return this.baseFixedConfigs.pid;
  }

  /**Returns the modules subid*/
  get sid(): number {
    return this.basePreConfigs.sid;
  }

  /**This This method returns the name of the module*/
  get name(): string {
    return this.___nameDecode(3);
  }

  /**Returns an id number which can be user to identify the module across reboots*/
  get offlineID(): string {
    return this.manager.offlineID + "^" + this.uid;
  }

  /**This decodes the name of the module which can contain special codes
   * @param  layer how deep the decode should go if moduel name refers to other module names, which in term refers to other*/
  ___nameDecode(layer: number): string {
    if (typeof this.___name === "string") {
      layer--;
      if (layer == 0) return "";
      return this.___name.replace(
        /\$(([a-z]{2}\d{1,5})|([a-z]{3}))/gi,
        (compare) => {
          switch (compare[1]) {
            case "p":
              if (compare == "$par") {
                return this.___parent!.___nameDecode(layer);
              }
              break;
            case "s": {
              if (compare == "$sub") {
                return String(this.sid);
              }
              break;
            }
            case "u":
              switch (compare) {
                case "$uid": {
                  return String(this.uid);
                }
                case "$uns": {
                  return this.unit.get;
                }
                case "$unn": {
                  return this.unit.get;
                }
              }
              break;
            case "d": {
              if (compare == "$des") {
                return this.designator;
              }
              break;
            }
            case "i":
              let mod = this.manager.getModuleByUID(
                Number(compare.slice(3, compare.length))
              );
              if (mod) {
                switch (compare[2]) {
                  case "r": {
                    return mod.___nameDecode(layer);
                  }
                  case "d": {
                    return mod.designator;
                  }
                }
              }
              break;
          }
          return "";
        }
      );
    } else {
      return "";
    }
  }

  /**This brings up a dialog to change the name of the module*/
  async rename(parentElement?: ContentBase) {
    let res = await promptInput({
      parent: parentElement,
      buttonText: "Save",
      input: { value: this.___name, type: InputBoxTypes.TEXT },
      title: "Rename " + this.name,
    }).promise;
    if (res.code == PromptCodes.ENTER) {
      //@ts-expect-error
      this.___rename(res.data);
    }
  }

  /**Sends command to rename module */
  ___rename(name: string) {
    this.manager.sendMessage("SC", {
      modID: this.uid,
      num: this.manager.messageID,
      data: { name: name },
    });
  }

  /**This gives a warning about deletion then deletes the module if accepted*/
  async deleteWithWarning(parentElement?: Content) {
    let res = await promptButtons({
      parent: parentElement,
      title: "Delete " + this.name,
      text: "Are you sure?",
      buttons: [
        { text: "<b>Y</b>es", value: "y", key: "y", symbol: done() },
        { text: "<b>N</b>o", value: "n", key: "n", symbol: close() },
      ],
    }).promise;
    if (res.code == PromptCodes.ENTER && res.data == "y") {
      this.doDelete();
    }
  }

  /**This deletes the module*/
  doDelete() {
    this.manager.sendMessage("SD", { modID: this.uid });
  }

  //#######################################################################################################################################################################################
  //#    _____      _       _   _                    ######################################################################################################################################
  //#   |  __ \    | |     | | (_)                   ######################################################################################################################################
  //#   | |__) |___| | __ _| |_ _  ___  _ __  ___    ######################################################################################################################################
  //#   |  _  // _ \ |/ _` | __| |/ _ \| '_ \/ __|   ######################################################################################################################################
  //#   | | \ \  __/ | (_| | |_| | (_) | | | \__ \   ######################################################################################################################################
  //#   |_|  \_\___|_|\__,_|\__|_|\___/|_| |_|___/   ######################################################################################################################################
  //#######################################################################################################################################################################################
  /**Sets the parent of the module*/
  private ___updateParent() {
    if (this.___parent) this.___parent.__removeChildModule(this);
    let par = this.manager.getModuleByUID(this.pid);
    if (par instanceof Module) {
      this.___parent = par;
      this.___parent.__addChildModule(this);
    }
  }

  /**Sets the parent of the module */
  get parent(): ModuleBase | undefined {
    return this.___parent;
  }

  /**Returns the path of the module including the manager, with the manager first and the module itself last*/
  get path(): (ModuleBase | ModuleManagerBase)[] {
    let path: (ModuleBase<any, any> | ModuleManagerBase)[] = [this];
    while (path[0] instanceof Module && path[0].parent)
      path.unshift(path[0].parent);
    return path;
  }

  /**Returns the amount of direct children registered with the manager*/
  get amountChildren(): number {
    return this.___moduleChildren.length;
  }

  /**Returns a list of all direct children of the manager*/
  get children(): Module[] {
    return [...this.___moduleChildren];
  }

  /**Adds a module as child of the manager*/
  private __addChildModule(module: Module<any, any>) {
    this.___moduleChildren[module.sid! - 1] = module;
    this._events.emit("childAdded", { module });
  }

  /**Removes the module from the managers child list*/
  private __removeChildModule(module: Module<any, any>) {
    let index = this.___moduleChildren.indexOf(module);
    if (index !== -1) {
      this.___moduleChildren.splice(index, 1);
      this._events.emit("childRemoved", { module: module });
      if (index < this.___moduleChildren.length) {
        for (let i = index; i < this.___moduleChildren.length; i++) {
          //@ts-expect-error
          this.manager.__updateModule(this.___moduleChildren[i], {
            sid: i + 1,
          });
        }
      }
    }
  }

  //#######################################################################################################################################################################################
  //#     _____       _       __  __           _       _              #####################################################################################################################
  //#    / ____|     | |     |  \/  |         | |     | |             #####################################################################################################################
  //#   | (___  _   _| |__   | \  / | ___   __| |_   _| | ___  ___    #####################################################################################################################
  //#    \___ \| | | | '_ \  | |\/| |/ _ \ / _` | | | | |/ _ \/ __|   #####################################################################################################################
  //#    ____) | |_| | |_) | | |  | | (_) | (_| | |_| | |  __/\__ \   #####################################################################################################################
  //#   |_____/ \__,_|_.__/  |_|  |_|\___/ \__,_|\__,_|_|\___||___/   #####################################################################################################################
  //#######################################################################################################################################################################################
  /**Provides list of sub modules available for the module*/
  subModuleAdder(_options: {}): ContentBase {
    return new Content();
  }

  /**Whether the module can add sub modules*/
  get canAddSubModules(): boolean {
    return false;
  }

  /**This calls the command to add the given sub module
   * @param  des designator of module to add
   * @param  options parameters to pass to sub module */
  subModuleAdd(des: string, options = {}) {
    this.manager.sendMessage("SA", {
      modID: this.uid,
      des: des,
      num: this.manager.messageID,
      data: options,
    });
  }

  //#######################################################################################################################################################################################
  //#       /\                            #################################################################################################################################################
  //#      /  \   ___ ___ ___  ___ ___    #################################################################################################################################################
  //#     / /\ \ / __/ __/ _ \/ __/ __|   #################################################################################################################################################
  //#    / ____ \ (_| (_|  __/\__ \__ \   #################################################################################################################################################
  //#   /_/    \_\___\___\___||___/___/   #################################################################################################################################################
  //#######################################################################################################################################################################################
  protected ___accessListening(listen: boolean) {
    if (listen && !this.___accessListener)
      this.___accessListener = this.manager.events.on("accessChanged", (e) => {
        let access: AccessTypes =
          e.data.user == 1
            ? AccessTypes.WRITE
            : this.user == e.data.user || this.user2 == e.data.user
            ? AccessTypes.WRITE
            : AccessTypes.READ;

        this._accessValue.set(Ok(access));
        this._accessConfig.set(Ok(access));
        this._accessCommand.set(Ok(access));
        this._accessViewing.set(Ok(access));
        return false;
      });
    else if (!listen && this.___accessListener)
      this.manager.events.off("accessChanged", this.___accessListener);
  }

  /**This brings up a dialog to change the name of the module*/
  async reaccess(parentElement?: ContentBase) {
    let res = await promptInput({
      parent: parentElement,
      buttonText: "Save",
      input: { value: this.user, type: InputBoxTypes.NUMBERWHOLEPOSITIVE },
      title: "Change User1 for " + this.name,
    }).promise;
    if (res.code == PromptCodes.ENTER) {
      let res2 = await promptInput({
        parent: parentElement,
        buttonText: "Save",
        input: {
          value: this.user2,
          type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
        },
        title: "Change User2 for " + this.name,
      }).promise;
      if (res2.code == PromptCodes.ENTER) {
        //@ts-expect-error
        this.___access(res.data, res2.data);
      }
    }
  }

  /**Sends command to change access of module*/
  ___access(user1: number, user2: number) {
    this.manager.sendMessage("aC", {
      modID: this.uid,
      user: user1,
      user2: user2,
    });
  }

  //#######################################################################################################################################################################################
  //#   __      __   _               ######################################################################################################################################################
  //#   \ \    / /  | |              ######################################################################################################################################################
  //#    \ \  / /_ _| |_   _  ___    ######################################################################################################################################################
  //#     \ \/ / _` | | | | |/ _ \   ######################################################################################################################################################
  //#      \  / (_| | | |_| |  __/   ######################################################################################################################################################
  //#       \/ \__,_|_|\__,_|\___|   ######################################################################################################################################################
  //#######################################################################################################################################################################################
  /**Returns if the module has a value to be read */
  get hasValue(): boolean {
    //@ts-expect-error
    return this.___valueAccess > 0;
  }

  /**Returns if the module has a value to be read*/
  get valueAccess(): ModuleValueAccessEnum {
    return this.___valueAccess || ModuleValueAccessEnum.NONE;
  }

  /**Starts the value connection for the module */
  protected ___valueStartConnection() {
    if (this.___valueAccess! > 0) {
      if (this.___valueAmountUsers === 0) {
        //@ts-expect-error
        this.manager.__registerValueListener(this);
      }
      this.___valueAmountUsers++;
    }
  }

  /**Stops the value connection for the module*/
  protected ___valueStopConnection() {
    if (this.___valueAccess! > 0 || this.___valueAmountUsers) {
      this.___valueAmountUsers--;
      if (this.___valueAmountUsers === 0) {
        //@ts-expect-error
        this.manager.__deregisterValueListener(this);
      }
    }
  }

  //#######################################################################################################################################################################################
  //#     _____             __ _              #############################################################################################################################################
  //#    / ____|           / _(_)             #############################################################################################################################################
  //#   | |     ___  _ __ | |_ _  __ _ ___    #############################################################################################################################################
  //#   | |    / _ \| '_ \|  _| |/ _` / __|   #############################################################################################################################################
  //#   | |___| (_) | | | | | | | (_| \__ \   #############################################################################################################################################
  //#    \_____\___/|_| |_|_| |_|\__, |___/   #############################################################################################################################################
  //#                             __/ |       #############################################################################################################################################
  //#                            |___/        #############################################################################################################################################
  //#######################################################################################################################################################################################

  /**Returns whether the module has settings*/
  get hasSettings() {
    return false;
  }

  /**Generates an instance of the modules setting content*/
  async generateSettingsContent(
    _options: ModuleSettingsOptions
  ): Promise<ModuleSettings> {
    return undefined as any;
  }

  //#######################################################################################################################################################################################
  //#    _____           _                                   _      #######################################################################################################################
  //#   |_   _|         | |                                 | |     #######################################################################################################################
  //#     | |  _ __  ___| |_ _ __ _   _ _ __ ___   ___ _ __ | |_    #######################################################################################################################
  //#     | | | '_ \/ __| __| '__| | | | '_ ` _ \ / _ \ '_ \| __|   #######################################################################################################################
  //#    _| |_| | | \__ \ |_| |  | |_| | | | | | |  __/ | | | |_    #######################################################################################################################
  //#   |_____|_| |_|___/\__|_|   \__,_|_| |_| |_|\___|_| |_|\__|   #######################################################################################################################
  //#######################################################################################################################################################################################

  /**Starts the value connection for the module*/
  protected ___instrumentAddUser() {
    if (this.___instrumentAmountUsers === 0) {
      //@ts-expect-error
      this.manager.__registerInstrumentListener(this);
    }
    this.___instrumentAmountUsers++;
  }

  /**Stops the value connection for the module*/
  protected ___instrumentRemoveUser() {
    this.___instrumentAmountUsers--;
    if (this.___instrumentAmountUsers === 0) {
      //@ts-expect-error
      this.manager.__deregisterInstrumentListener(this);
    }
  }

  //#######################################################################################################################################################################################
  //#     _____                                          _    #############################################################################################################################
  //#    / ____|                                        | |   #############################################################################################################################
  //#   | |     ___  _ __ ___  _ __ ___   __ _ _ __   __| |   #############################################################################################################################
  //#   | |    / _ \| '_ ` _ \| '_ ` _ \ / _` | '_ \ / _` |   #############################################################################################################################
  //#   | |___| (_) | | | | | | | | | | | (_| | | | | (_| |   #############################################################################################################################
  //#    \_____\___/|_| |_| |_|_| |_| |_|\__,_|_| |_|\__,_|   #############################################################################################################################
  //#######################################################################################################################################################################################
  /**Sends a command to the module with the given data
   * @param data data to send to module*/
  command(data: { [key: string]: any }) {
    this.manager.sendMessage("M", {
      id: this.uid,
      num: this.___commandNextNum,
      data: data,
    });
  }

  /**Calls a module command with the given data
   * @param  data data to send to module
   * @param timeout timeout time for response standard is 3 seconds
   * @returns  returns null if timeout */
  async commandResponse(
    data: { [key: string]: any },
    timeout?: number
  ): Promise<{ [key: string]: any } | null> {
    let num = this.___commandNextNum;
    let res = await Promise.race([
      new Promise((a) =>
        setTimeout(a, (timeout || 3000) + this.manager.connectionTimeOutOffset)
      ),
      new Promise((a) => {
        this.___commands[num] = a;
        this.manager.sendMessage("M", {
          id: this.uid,
          num: num,
          data: data,
        });
      }),
    ]);
    delete this.___commands[num];
    return res as any;
  }

  /**Returns the next command number*/
  protected get ___commandNextNum(): number {
    if (this.___commandNum > 9999) {
      this.___commandNum = 0;
    }
    return this.___commandNum++;
  }

  /**Used by manager to run command response to listeners*/
  protected ___commandResponse(data: { id: number; num: number; data: {} }) {
    if (data["num"] in this.___commands) {
      this.___commands[data["num"]](data["data"]);
      delete this.___commands[data["num"]];
    }
  }

  //#######################################################################################################################################################################################
  //#     _____ _        _                #################################################################################################################################################
  //#    / ____| |      | |               #################################################################################################################################################
  //#   | (___ | |_ __ _| |_ _   _ ___    #################################################################################################################################################
  //#    \___ \| __/ _` | __| | | / __|   #################################################################################################################################################
  //#    ____) | || (_| | |_| |_| \__ \   #################################################################################################################################################
  //#   |_____/ \__\__,_|\__|\__,_|___/   #################################################################################################################################################
  //#######################################################################################################################################################################################
  /**Returns if the module has status value to be read */
  get hasStatusValues(): boolean {
    return false;
  }

  /**Returns the function used to generate the text*/
  protected ___statusText(): (values: any[]) => PromiseLike<string> | string {
    return () => {
      return "";
    };
  }

  /**Starts the value connection for the module*/
  protected ___statusStartConnection() {
    if (this.hasStatusValues) {
      if (this.___statusAmountUsers === 0) {
        //@ts-expect-error
        this.manager.__registerStatusListener(this);
      }
      this.___statusAmountUsers++;
    }
  }

  /**Stops the value connection for the module*/
  protected ___statusStopConnection() {
    if (this.hasStatusValues || this.___statusAmountUsers) {
      this.___statusAmountUsers--;
      if (this.___statusAmountUsers === 0) {
        //@ts-expect-error
        this.manager.__deregisterStatusListener(this);
      }
    }
  }

  //#######################################################################################################################################################################################
  //#    ____                                     #########################################################################################################################################
  //#   |  _ \                                    #########################################################################################################################################
  //#   | |_) |_ __ _____      _____  ___ _ __    #########################################################################################################################################
  //#   |  _ <| '__/ _ \ \ /\ / / __|/ _ \ '__|   #########################################################################################################################################
  //#   | |_) | | | (_) \ V  V /\__ \  __/ |      #########################################################################################################################################
  //#   |____/|_|  \___/ \_/\_/ |___/\___|_|      #########################################################################################################################################
  //#######################################################################################################################################################################################
  /**Overrideable method to generate*/
  get browserActions(): { text: string; action: () => void }[] {
    return [];
  }
}

/**The different event types available for the modules*/
export let ModuleTypes: {
  [key: string]: typeof Module;
} = {
  Module: Module,
};
/**The different event types available for the modules*/
export function registerModule(
  name: string,
  moduleClass: typeof Module<any, any>
) {
  ModuleTypes[name] = moduleClass;
}
