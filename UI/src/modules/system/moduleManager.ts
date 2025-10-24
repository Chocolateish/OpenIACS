import { AccessTypes } from "@libBase";
import { ipAddressToU32, sha1 } from "@libCommon";
import { EventHandlerSub } from "@libEvent";
import {
  PromptCodes,
  promptInfo,
  promptLogin,
  promptResult,
} from "@libPrompts";
import { Err, Ok, type Result } from "@libResult";
import { stateOk, type StateOk } from "@libState";
import { Content } from "@libUI";
import { Value } from "@libValues";
import {
  serverResultMessageToResult,
  type Message,
  type ModuleBase,
  type ModuleDesignator,
  type ModuleManagerBase,
  type ModuleManagerEvents,
} from "@modCommon";
import { Module, ModuleTypes } from "@module/module";
import { USERU } from "../modules/system";
import { initialDataDecoders } from "./initialData";
import {
  ConnectionType,
  connectionTypeCheck,
  type ModuleManagerOptions,
  type ModuleManagerSaveData,
} from "./types";

let __logSendMessage = true;
let __logRecievedMessage = true;
let __logSendVSMessage = true;
let __logRecievedVSMessage = true;
let __logSendPings = true;
let __logRecievedPings = true;

/**Sets if messages should be logged
 * @param logMessages log normal messages
 * @param logValueStatus log value and status messages
 * @param logPings log ping messages*/
export let doLogging = (
  logMessages: boolean,
  logValueStatus: boolean,
  logPings: boolean
) => {
  __logRecievedMessage = logMessages;
  __logSendMessage = logMessages;
  __logSendVSMessage = logValueStatus;
  __logRecievedVSMessage = logValueStatus;
  __logSendPings = logPings;
  __logRecievedPings = logPings;
};

/**Defines the maximum amount of values which can be send in one message*/
let maxValuesPerMessage = 200;
/**Defines the maximum amount of status values which can be send in one message*/
let maxStatussesPerMessage = 40;

export class ModuleManager implements ModuleManagerBase {
  protected _events = new EventHandlerSub<
    ModuleManagerEvents,
    ModuleManagerBase
  >(this as ModuleManagerBase);
  /**Module manager Events */
  readonly events = this._events.consumer;

  /**The type of connection to the server*/
  readonly name: StateOk<string>;
  readonly nameValue: Value = new Value("");
  readonly version = stateOk<string>(Ok(""));
  readonly versionValue: Value = new Value("");

  //######################################
  //############  Connection process
  /**Wether the manager is connected to its server*/
  readonly connected = stateOk(Ok(false));
  /**Number id used to identify messages*/
  private ___messageNumber = 0;
  /**Storage for promises made for messages*/
  private ___messagePromises: { [key: number]: (value: any) => void } = {};
  /**Offset for connection timeouts, is increased when connected over slower networks*/
  connectionTimeOutOffset = 0;
  /**The ip address of the manager*/
  private __ipAddress: string;
  /**Wether the manager is a master*/
  private __isMaster = false;
  /**The type of connection to the server*/
  readonly connectionType: Value;
  /**The maximum message size the server supports*/
  private __maxMessageSize = 100;
  /**Default timeout time for responses from server in ms*/
  private __responseTimeout = 4000;
  /**Wether the connection is saved in local storage*/
  readonly permanent: Value;
  readonly simulatedIP: Value;
  private __webSocket?: WebSocket;
  amountSent: number = 0;
  private __reconnectTimeout?: number;
  private __connectionTimeout?: number;
  /**Stores if connection has been aborted by the server once*/
  private __connectionAbortedByServer?: boolean;

  //######################################
  //############  Sync process
  private _synced = false;
  readonly synced = stateOk(Ok(false));
  /**Saves the save number of the server, if connection is lost to the server, but save number is the same at reconnect, no syncing is needed*/
  private __saveNumber = 0;
  /**Stores the number amount of module the server reports having*/
  private __amountOnServer = 0;
  /**Is true when manager has been synced once*/
  private __onceSynced = false;
  private __syncedModules?: (Module | undefined)[];
  private __newModules: number = 0;
  private __saveNumOnServer?: number;

  readonly clientTimeOffset: number = 0;
  readonly timeOffset: number = 0;

  //######################################
  //############  Modules process
  /**List of all modules contained in manager*/
  private __moduleList: (Module | undefined)[] = [];
  /**Actual amount of modules in system*/
  private __moduleAmount = 0;

  //######################################
  //############  Instrument
  private __instrGettersStaging: Module[] = [];
  private __instrGetters: Module[] = [];
  private __instrGettersBuff: number[] = [];
  private __maxInstrumentOrders?: number;
  private __instrGettersInterval?: number;

  //######################################
  //############  Access
  /**Current access level of the client*/
  private __userlist: (USERU | undefined)[] = [];
  /**Current access level of the client*/
  private __user = 0;
  /**Access token for last login*/
  private __accessToken: string;
  /**The access object for the module*/
  adminAccess = stateOk<AccessTypes>(Ok(AccessTypes.READ));

  //######################################
  //############  Value
  private __valueGettersStaging: Module[] = [];
  private __valueGetters: Module[] = [];
  private __valueGettersBuff: number[] = [];
  private __valueGettersInterval?: number;

  //######################################
  //############  Status
  private __statusGettersStaging: Module[] = [];
  private __statusGetters: Module[] = [];
  private __statusGettersBuff: number[] = [];
  private __statusGettersInterval?: number;

  //Plugins
  private __pluginStorage: { [key: string]: any } = {};
  /**Storage for all initial data*/
  private __initialDataStorage: { [key: string]: {} } = {};

  constructor(options: ModuleManagerOptions) {
    this.name = stateOk<string>(Ok(""));
    this.name.subscribe((value) => {
      this.nameValue.set = value.unwrap;
    });

    //######################################
    //############  Connection process
    this.__ipAddress = options.ipAddress;
    this.connectionType = new Value(
      options.type || ConnectionType.SETTINGS,
      (value) => {
        if (connectionTypeCheck.includes(value)) return value;
        else return;
      }
    );
    this.connectionType.addListener(this.__ConnectionType.bind(this));
    this.permanent = new Value(options.permanent ?? false, (value) => {
      if (typeof value === "boolean") return value;
      else return;
    });
    this.permanent.addListener(() => {
      this._events.emit("save", {});
    });
    this.simulatedIP = new Value(options.simulatedIp ?? "", (value) => {
      if (typeof value === "string") return value;
      else return;
    });
    this.simulatedIP.addListener(() => {
      this._events.emit("save", {});
    });
    this.__connectionEventListeners();

    //######################################
    //############  Sync process
    this.synced.subscribe((val) => {
      if (val.ok) this._synced = val.unwrap;
    });
    this.__syncEventListeners();

    //######################################
    //############  Modules process
    //Adds module manager as root
    this.__addModule({
      uid: 1,
      sid: 1,
      pid: this,
      des: "MODMA",
      user: 2,
      user2: 2,
      access: 65488,
    });
    this.__moduleEventListeners();

    //######################################
    //############  Config
    this.__configEventListeners();

    //######################################
    //############  Instrument
    this.__instrumentEventListeners();

    //######################################
    //############  Access
    this.__accessToken = options.accessToken || "";
    this.__accessEventListeners();

    //######################################
    //############  Value
    this.__valueEventListeners();

    //######################################
    //############  Command
    this.__commandListeners();

    //######################################
    //############  Status
    this.__statusEventListeners();

    //Initial Data
    this.__initialDataConstructor();

    //Starts connection to server
    this.__connect();
  }
  /**Creates an instance of the module manager*/
  static create(options: ModuleManagerOptions): ModuleManager {
    if (typeof options.ipAddress !== "string")
      throw new Error("Ip address must be passed");
    return new ModuleManager(options);
  }
  /**This tells the manager that is has been removed and should clean up afte itself*/
  remove() {
    this.__close();
    this._events.emit("removed", {});
  }

  /**Sets if the manager is a master*/
  set master(master: boolean) {
    this.__isMaster = Boolean(master);
  }
  /**Returns if the manager is a master */
  get master(): boolean {
    return this.__isMaster;
  }

  /**Returns ip address of module manager*/
  get ipAddress(): string {
    return this.__ipAddress;
  }

  /**Returns the data to be saved into local storage*/
  get saveData(): ModuleManagerSaveData | undefined {
    return this.permanent.get
      ? {
          permanent: true,
          ipAddress: this.__ipAddress,
          master: this.__isMaster,
          type: this.connectionType.get,
          accessToken: this.__accessToken,
          simulatedIp: this.simulatedIP.get,
        }
      : undefined;
  }

  /**Returns an id to be used to identify the manager across reboots*/
  get offlineID(): string {
    return this.__ipAddress;
  }

  /**Returns whether the manager is the local manager*/
  get isLocalManager(): boolean {
    return false;
  }

  //###################################################################################################################################################################################
  //#     _____                            _   _                #######################################################################################################################
  //#    / ____|                          | | (_)               #######################################################################################################################
  //#   | |     ___  _ __  _ __   ___  ___| |_ _  ___  _ __     #######################################################################################################################
  //#   | |    / _ \| '_ \| '_ \ / _ \/ __| __| |/ _ \| '_ \    #######################################################################################################################
  //#   | |___| (_) | | | | | | |  __/ (__| |_| | (_) | | | |   #######################################################################################################################
  //#    \_____\___/|_| |_|_| |_|\___|\___|\__|_|\___/|_| |_|   #######################################################################################################################
  //###################################################################################################################################################################################
  /**This sets up the websocket connection to the given url*/
  __connect() {
    //This creates the websocket and saves the modulemanager to the websocket for reference
    console.log("Connecting to: " + this.ipAddress);
    this.__webSocket = new WebSocket("ws://" + this.ipAddress + ":9000");
    this.__webSocket.onopen = () => {
      this.__resetWatchDog();
      this.connected.set(Ok(true));
      console.log("Connection open to " + this.ipAddress);
      this._events.emit("opened", {});
      switch (this.connectionType.get) {
        case ConnectionType.SETTINGS:
        case ConnectionType.FIXED:
          this.sendMessage("CT" + this.connectionType.get);
          break;
        case ConnectionType.FIXEDSIMULATED:
          this.sendMessage("CT" + this.connectionType.get, {
            ip: ipAddressToU32(this.simulatedIP.get),
          });
          break;
      }
    };
    //This handles incoming messages from the websocket connection
    this.__webSocket.onmessage = (e) => {
      this.__resetWatchDog();
      let receivedBuffer = e.data;
      if (receivedBuffer[0] == "\u001D" && receivedBuffer.length > 1) {
        let valuesStart = receivedBuffer.indexOf("\u001F");
        let data = {};
        let typeCodes: string[] = [];
        if (valuesStart != -1) {
          data = JSON.parse(receivedBuffer.substring(valuesStart + 1));
          typeCodes = receivedBuffer.substring(1, valuesStart).split("");
        } else {
          typeCodes = receivedBuffer.substring(1).split("");
        }
        if (__logRecievedMessage) {
          if (
            (typeCodes[0] === "S" && typeCodes[1] === "s") ||
            typeCodes[1] === "V"
          ) {
            if (__logRecievedVSMessage) console.log("Reci:" + receivedBuffer);
          } else if (typeCodes[0] === "C" && typeCodes[1] === "p") {
            if (__logRecievedPings) console.log("Reci:" + receivedBuffer);
          } else console.log("Reci:" + receivedBuffer);
        }
        this._events.emit("message", { typeCodes, data }, typeCodes);
      }
    };
    //This handles what happens when the connection is closed
    this.__webSocket.onclose = () => {
      this.__onCloseActions();
      this.__reconnectTimeout = window.setTimeout(() => {
        this.__connect();
      }, 1000);
    };
    this.__webSocket.onerror = (e) => {
      console.warn("Error detected on " + this.ipAddress + ": " + e);
    };
  }

  /**Resets watchdog for connection inactivity */
  private __resetWatchDog() {
    clearTimeout(this.__connectionTimeout);
    this.__connectionTimeout = window.setTimeout(() => {
      this.sendMessage("CP");
      this.__connectionTimeout = window.setTimeout(() => {
        this.__webSocket?.close(1000);
        this.__onCloseActions();
      }, 10000);
    }, 5000);
  }

  /**Closes the connection to the server and prevents reconnects*/
  private __close() {
    clearTimeout(this.__reconnectTimeout);
    //This creates the websocket and saves the modulemanager to the websocket for reference
    console.log("Closing connection to: " + this.ipAddress);
    //This handles what happens when the connection is closed
    this.__webSocket!.onclose = () => {
      this.__onCloseActions();
    };
    this.__webSocket?.close();
  }

  /**Actions to perform when connection is closed */
  private async __onCloseActions() {
    if ((await this.connected).unwrap) {
      console.log(
        "Connection terminated for " + this.ipAddress + ", attempting reconnect"
      );
      this.connected.set(Ok(false));
      this._events.emit("closed", {});
    }
  }

  /**Changes the connection type and reconnects */
  private __ConnectionType() {
    this._events.emit("save", {});
  }

  /**This sends a message over the websocket connection
   * message example SD{"num":6847}
   * @param typeCodes Event typecodes
   * @param object message data*/
  sendMessage(typeCodes: string, object?: {}) {
    let messageBuffer = "\u001D" + typeCodes;
    if (typeof object !== "undefined") {
      messageBuffer += "\u001F" + JSON.stringify(object);
    }
    if (messageBuffer.length <= this.__maxMessageSize) {
      if (__logSendMessage) {
        if (typeCodes === "Ss" || typeCodes === "SV") {
          if (__logSendVSMessage) console.log("Send:" + messageBuffer);
        } else if (typeCodes === "CP") {
          if (__logSendPings) console.log("Send:" + messageBuffer);
        } else console.log("Send:" + messageBuffer);
      }
      this.amountSent++;
      this.__webSocket?.send(messageBuffer);
    } else console.warn("Was not sent, too large:" + messageBuffer);
  }

  /**This sends a message over the websocket connection and returns a promise which is fulfilled when a message with the responseCodes is recieved
   * @param typeCodes Event typecodes
   * @param object message data
   * @param responseCodes codes of expected response
   * @param timeout overwrites the standard timeout value with the given one*/
  sendMessageResponse(
    typeCodes: string,
    object: {},
    responseCodes: string,
    timeout?: number
  ): Promise<Message> {
    let sub = responseCodes.split("");
    let promise = new Promise<Message>((a) => {
      let listener = this._events.on(
        "message",
        (e) => {
          a(e.data);
          clearTimeout(timeouthandle);
          return true;
        },
        sub
      );

      let timeouthandle = setTimeout(
        listener,
        timeout || this.__responseTimeout,
        false
      );
    });
    this.sendMessage(typeCodes, object);
    return promise;
  }

  /**Generates a psudo unique id number for the message between 1-9999*/
  get messageID(): number {
    if ((this.___messageNumber = 9999)) this.___messageNumber = 1;
    else this.___messageNumber++;
    return this.___messageNumber;
  }

  /**Registers a function which can be invoked with a returning message
   * @param messageID id to know message by
   * @param resolver function to*/
  registerMessagePromise(messageID: number, resolver: (value: any) => void) {
    this.___messagePromises[messageID] = resolver;
  }

  /**Registers a function which can be invoked with a returning message
   * @param messageID id to know message by
   * @param data data to pass to promise */
  invokeMessagePromise(messageID: number, data: {}) {
    if (this.___messagePromises[messageID])
      this.___messagePromises[messageID](data);
    delete this.___messagePromises[messageID];
  }

  private __connectionEventListeners() {
    //Response for type negotiation
    this._events.on(
      "message",
      (e) => {
        if (!this.__connectionAbortedByServer) {
          switch (e.data.typeCodes[2]) {
            case "T": {
              promptInfo({
                title: this.ipAddress + " Connection type not supported",
              });
              break;
            }
            case "N": {
              promptInfo({
                title: this.ipAddress + " Too many users connected",
              });
              break;
            }
            case "A": {
              promptInfo({
                title: this.ipAddress + " Same client already connected",
              });
              break;
            }
            case "n": {
              promptInfo({
                title:
                  this.ipAddress + " Fixed client not registered in system",
              });
              break;
            }
            case "e": {
              promptInfo({ title: this.ipAddress + " Sent variables wrong" });
              break;
            }
          }
        }
        switch (e.data.typeCodes[2]) {
          case "Y": {
            this.sendMessage("CI");
            return false;
          }
        }
        this.__connectionAbortedByServer = true;
        return false;
      },
      ["C", "T"]
    );

    //Response with server technical information
    this._events.on(
      "message",
      (e) => {
        this.__maxMessageSize = e.data.data["buffSize"];
        this.__maxInstrumentOrders = ~~(this.__maxMessageSize / 407);
        this.version.set = e.data.data["version"];
        this._events.emit("connected", {});
        this.connected.set(Ok(true));
        return false;
      },
      ["C", "I"]
    );

    //Reloads window
    this._events.on(
      "message",
      () => {
        window.location.reload();
        return false;
      },
      ["C", "r"]
    );
  }

  //#######################################################################################################################################################################################
  //#     _______     ___   _  _____    ###################################################################################################################################################
  //#    / ____\ \   / / \ | |/ ____|   ###################################################################################################################################################
  //#   | (___  \ \_/ /|  \| | |        ###################################################################################################################################################
  //#    \___ \  \   / | . ` | |        ###################################################################################################################################################
  //#    ____) |  | |  | |\  | |____    ###################################################################################################################################################
  //#   |_____/   |_|  |_| \_|\_____|   ###################################################################################################################################################
  //#######################################################################################################################################################################################

  /**Starts the sync process*/
  private __startSync() {
    console.log("Starting sync");
    if (this.__onceSynced) {
      console.log("Resync started");
      this.__syncedModules = [...this.__moduleList];
      this.__newModules = 0;
    }
    this.sendMessage("SS");
  }

  /**Finishes the sync process */
  private __finishSync() {
    this.synced.set(Ok(true));
    if (this.__onceSynced) this.__finishResync();
    else this.__linkModules();
    this.__onceSynced = true;
    this.sendMessage("Sd");
    this._events.emit("synced", {});
  }

  /**Updates parents of all modules*/
  private __linkModules() {
    for (let i = 1, n = this.__moduleList.length; i <= n; i++) {
      let mod = this.__moduleList[i];
      //@ts-expect-error
      if (mod) mod.__linking();
    }
  }

  /**Finishes resyncing*/
  private __finishResync() {
    if (this.__syncedModules) {
      for (let i = 1, n = this.__syncedModules.length; i < n; i++) {
        let mod = this.__syncedModules[i];
        if (mod) this.__removeModule(mod);
      }
      delete this.__syncedModules;
    }
    this.__linkModules();
    this._events.emit("resynced", {});
  }

  /**Function to attach listeners
   * @private */
  __syncEventListeners() {
    //Request for module sync
    this._events.on("connected", () => {
      if (this.__saveNumber == 0) this.__startSync();
      else this.sendMessage("SN");
      return false;
    });
    //When manager is disconnected
    this._events.on("closed", () => {
      this.synced.set(Ok(false));
      return false;
    });

    this.timeOffset;

    //Response with sync header
    this._events.on(
      "message",
      (e) => {
        let data = e.data;
        if (typeof data.data === "object") {
          let dataData = data.data;
          this.__amountOnServer = dataData["amount"];
          this.__saveNumOnServer = dataData["num"];
          this.name.set = dataData["name"];
          let time = new Date();
          //@ts-expect-error
          this.clientTimeOffset = dataData["time"] * 1000 - time.getTime();
          //@ts-expect-error
          this.timeOffset = dataData!["timeOffset"];
        } else {
          console.warn("Sync header malformed");
        }
      },
      ["S", "S"]
    );
    //Response with time header
    this._events.on(
      "message",
      (e) => {
        let data = e.data;
        if (typeof data.data === "object") {
          let dataData = data.data;
          if (typeof dataData.adjust === "number") {
            let time = new Date();
            //@ts-expect-error
            this.clientTimeOffset = dataData.adjust * 1000 - time.getTime();
          }
          if (typeof dataData.offset === "number")
            //@ts-expect-error
            this.timeOffset = dataData.offset;
        } else {
          console.warn("Time header malformed");
        }
      },
      ["S", "T"]
    );
    //Response with sync header when connection has previously been there
    this._events.on(
      "message",
      (e) => {
        let data = e.data;
        if (typeof data.data === "object") {
          let dataData = data.data;
          if (
            this.__saveNumber == dataData["num"] &&
            this.__moduleAmount == dataData["amount"]
          ) {
            console.log("Sync Done");
            this.__finishSync();
          } else this.__startSync();
        } else {
          console.warn("Sync header malformed");
        }
      },
      ["S", "N"]
    );
    //Response when all modules have been sent
    this._events.on(
      "message",
      () => {
        console.log("Sync Done");
        this.__saveNumber = this.__saveNumOnServer!;
        this.__finishSync();
        return false;
      },
      ["S", "D"]
    );
    //Response to module removal
    this._events.on(
      "message",
      (e) => {
        switch (e.data.typeCodes[2]) {
          case "E": {
            promptInfo({ title: "Module not found" });
            break;
          }
          case "N": {
            promptInfo({ title: "Access insufficient to remove module" });
            break;
          }
          default: {
            let mod = this.getModuleByUID(e.data.data["modID"]);
            if (mod) this.__removeModule(mod);
          }
        }
        return false;
      },
      ["S", "R"]
    );
  }
  //#######################################################################################################################################################################################
  //#    __  __  ____  _____  _    _ _      ______  _____    ##############################################################################################################################
  //#   |  \/  |/ __ \|  __ \| |  | | |    |  ____|/ ____|   ##############################################################################################################################
  //#   | \  / | |  | | |  | | |  | | |    | |__  | (___     ##############################################################################################################################
  //#   | |\/| | |  | | |  | | |  | | |    |  __|  \___ \    ##############################################################################################################################
  //#   | |  | | |__| | |__| | |__| | |____| |____ ____) |   ##############################################################################################################################
  //#   |_|  |_|\____/|_____/ \____/|______|______|_____/    ##############################################################################################################################
  //#######################################################################################################################################################################################
  /**Returns the module of the given unique id*/
  getModuleByUID(uid: number): Module | undefined {
    return this.__moduleList[uid];
  }

  /**Returns the root module */
  get root(): ModuleBase {
    return this.__moduleList[1]!;
  }

  /**Returns a list of all modules*/
  get modules(): (ModuleBase | undefined)[] {
    return [...this.__moduleList];
  }

  /**Returns the amount of modules registered with the manager*/
  get amountModules(): number {
    return this.__moduleAmount;
  }

  /**Updates an exsisting module from the given options*/
  private ___updateModule(options: { [key: string]: any }) {
    if (typeof options.uid !== "number") {
      console.warn("Module uid missing from config package");
      return;
    }
    let mod = this.getModuleByUID(options.uid);
    if (this._synced) {
      if (mod) this.__updateModule(mod, options);
      else this.__addModule(options);
    } else {
      if (this.__onceSynced) {
        if (mod instanceof Module) {
          this.__syncedModules![mod.uid] = undefined;
          if (mod.designator == options.des) {
            this.__updateModule(mod, options);
          } else {
            this.__removeModule(mod);
            mod = this.__addModule(options).unwrap;
            this.__newModules++;
          }
        } else {
          mod = this.__addModule(options).unwrap;
          this.__newModules++;
        }
        this._events.emit("syncProgress", {
          amount: this.__newModules,
          total: this.__amountOnServer,
        });
      } else {
        if (mod) {
          this.__updateModule(mod, options);
        } else {
          this.__addModule(options);
        }
        this._events.emit("syncProgress", {
          amount: this.__moduleList.length,
          total: this.__amountOnServer,
        });
      }
    }
  }

  /**Creates and stores a module from the given options*/
  private __addModule(options: { [key: string]: any }): Result<Module, string> {
    if (typeof options.des !== "string")
      return Err("Designator must be passed");
    if (!(options.des in ModuleTypes))
      return Err("Designator not registered: " + options.des);
    let res = Module.create(this, options, ModuleTypes[options["des"]]);
    if (res.err) return res;
    this.__moduleList[res.value.uid] = res.value;
    this.__moduleAmount++;
    this._events.emit("moduleAdded", { module: res.value }, ["des"]);
    if (this._synced) {
      this.__saveNumber = options["num"];
      //@ts-expect-error
      res.__linking();
    }
    return res;
  }

  /**Creates and stores a module from the given options*/
  private __updateModule(
    module: Module,
    options: { [key: string]: any }
  ): Result<{}, string> {
    return module.updatePreConfigs(this._synced, options);
  }

  /**Removes module from storage*/
  private __removeModule(module: Module) {
    this._events.emit("moduleRemoved", { module });
    let uid = module.uid;
    //@ts-expect-error
    module.__remove();
    this.__moduleList[uid] = undefined;
  }

  /**Function to attach listeners*/
  private __moduleEventListeners() {
    //Response with module for syncing
    this._events.on(
      "message",
      (e) => {
        this.___updateModule(e.data.data);
      },
      ["S", "O"]
    );
    this._events.on(
      "message",
      (e) => {
        switch (e.data.typeCodes[2]) {
          case "E": {
            promptInfo({ title: "Module not found" });
            break;
          }
          case "N": {
            promptInfo({ title: "Access insufficient to rename module" });
            break;
          }
          case "T": {
            promptInfo({ title: "Module is not renameable" });
            break;
          }
        }
        return false;
      },
      ["o", "R"]
    );

    this._events.on(
      "message",
      (e) => {
        switch (e.data.typeCodes[2]) {
          case "E": {
            promptInfo({ title: "Module not found" });
            break;
          }
          case "N": {
            promptInfo({ title: "Access insufficient to add to module" });
            break;
          }
        }
        return false;
      },
      ["S", "A"]
    );
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

  /**Function to attach listeners*/
  private __configEventListeners() {
    this._events.on(
      "message",
      (e) => {
        switch (e.data.typeCodes[2]) {
          case "E": {
            promptInfo({ title: "Module not found" });
            break;
          }
          case "N": {
            promptInfo({ title: "Access insufficient to save module" });
            break;
          }
          case "C": {
            promptInfo({ title: "No data found" });
            break;
          }
        }
        return false;
      },
      ["S", "C"]
    );
    this._events.on(
      "message",
      (e) => {
        switch (e.data.typeCodes[2]) {
          case "E": {
            promptInfo({ title: "Module not found" });
            break;
          }
          case "N": {
            promptInfo({ title: "Access insufficient to get module configs" });
            break;
          }
          default:
            let mod = this.getModuleByUID(e.data.data["modID"]);
            if (mod && e.data.data) mod.updateConfigs(e.data.data);
        }
        return false;
      },
      ["S", "M"]
    );
  }

  //#######################################################################################################################################################################################
  //#    _____           _                                   _      #######################################################################################################################
  //#   |_   _|         | |                                 | |     #######################################################################################################################
  //#     | |  _ __  ___| |_ _ __ _   _ _ __ ___   ___ _ __ | |_    #######################################################################################################################
  //#     | | | '_ \/ __| __| '__| | | | '_ ` _ \ / _ \ '_ \| __|   #######################################################################################################################
  //#    _| |_| | | \__ \ |_| |  | |_| | | | | | |  __/ | | | |_    #######################################################################################################################
  //#   |_____|_| |_|___/\__|_|   \__,_|_| |_| |_|\___|_| |_|\__|   #######################################################################################################################
  //#######################################################################################################################################################################################

  /**This registers the module as a value listener*/
  protected __registerInstrumentListener(mod: Module) {
    if (this.__instrGetters.length === 0) {
      this.__instrGetters.push(mod);
      this.__instrGettersBuff.push(mod.uid);
      this.__instrGettersInterval = window.setInterval(() => {
        if (this.__instrGettersStaging.length > 0) {
          for (let i = 0, n = this.__instrGettersStaging.length; i < n; i++) {
            this.__instrGetters.push(this.__instrGettersStaging[i]);
            this.__instrGettersBuff.push(this.__instrGettersStaging[i].uid);
          }
          this.__instrGettersStaging = [];
        }
        if (this.__instrGettersBuff.length <= this.__maxInstrumentOrders!) {
          this.sendMessage("IV", this.__instrGettersBuff);
        } else {
          for (
            let i = 0, n = this.__instrGettersBuff.length;
            i < n;
            i += this.__maxInstrumentOrders!
          ) {
            this.sendMessage(
              "IV",
              this.__instrGettersBuff.slice(i, i + this.__maxInstrumentOrders!)
            );
          }
        }
      }, 1000);
    } else {
      this.__instrGettersStaging.push(mod);
    }
  }

  /**This deregisters the module as a value listener*/
  protected __deregisterInstrumentListener(mod: Module) {
    let index = this.__instrGetters.indexOf(mod);
    if (index != -1) {
      this.__instrGetters.splice(index, 1);
      this.__instrGettersBuff.splice(index, 1);
      if (this.__instrGetters.length === 0) {
        clearInterval(this.__instrGettersInterval);
      }
      return;
    }
    index = this.__instrGettersStaging.indexOf(mod);
    if (index != -1) {
      this.__instrGettersStaging.splice(index, 1);
    }
  }

  /**Function to attach listeners */
  protected __instrumentEventListeners() {
    this._events.on(
      "message",
      (e) => {
        if (e.data.typeCodes.length > 2) {
          promptInfo({
            title:
              e.data.data["result"]["code"] +
              " " +
              e.data.data["result"]["reason"],
          });
        } else {
          for (const key in e.data) {
            //@ts-expect-error
            let mod = this.__moduleList[key];
            if (mod) mod.instrument.setAsync = e.data.data[key];
          }
        }
        return false;
      },
      ["I", "V"]
    );
    this._events.on(
      "message",
      (e) => {
        switch (e.data.typeCodes[2]) {
          case "E": {
            promptInfo({ title: "Module not found" });
            break;
          }
          case "N": {
            promptInfo({ title: "Access insufficient to get module configs" });
            break;
          }
          default:
            let mod = this.getModuleByUID(e.data.data["modID"]);
            if (mod && e.data.data) mod.updateConfigs(e.data.data);
        }
        return false;
      },
      ["I", "C"]
    );
    this._events.on("closed", () => {
      for (let i = 0; i < this.__moduleList.length; i++)
        if (this.__moduleList[i])
          this.__moduleList[i]!.instrument.setAsync = null;
      return false;
    });
  }

  //#######################################################################################################################################################################################
  //#                                     #################################################################################################################################################
  //#       /\                            #################################################################################################################################################
  //#      /  \   ___ ___ ___  ___ ___    #################################################################################################################################################
  //#     / /\ \ / __/ __/ _ \/ __/ __|   #################################################################################################################################################
  //#    / ____ \ (_| (_|  __/\__ \__ \   #################################################################################################################################################
  //#   /_/    \_\___\___\___||___/___/   #################################################################################################################################################
  //#######################################################################################################################################################################################
  /**Opens login window for the manager but only if manager is not yet logged in, returns promise for login
   * returns user id*/
  async loginPrompt(parent?: Content): Promise<number> {
    let prompt = promptLogin({
      parent: parent,
      manualClose: true,
      title: "Login",
      usertext: "Username (optional)",
    });
    while (true) {
      let result = await prompt.promise;
      if (result.code == PromptCodes.CLOSED) {
        prompt.close();
        return 0;
      } else {
        let user = await this.login(result.password, result.username);
        if (user === false) {
          prompt.passtext = "Password wrong";
        } else {
          prompt.close();
        }
      }
    }
  }

  /**Internal login */
  async login(password: string, username: string): Promise<boolean | number> {
    let response = await this.sendMessageResponse(
      "aA",
      { password: sha1(password), username: username },
      "aA"
    );
    if (response && response.typeCodes.length == 2) {
      if (this.__user != response.data!["user"]) {
        let oldUser = this.__user;
        this.__user = response.data!["user"];
        this._events.emit("accessChanged", {
          user: this.__user,
          oldUser: oldUser,
        });
        if (this.__user == 1) this.adminAccess.set(Ok(AccessTypes.WRITE));
      }
      if (response.data!["accessToken"]) {
        this.__accessToken = response.data!["accessToken"];
        this._events.emit("save", {});
      }
      return response.data!["user"];
    } else {
      return false;
    }
  }

  /**Internal login*/
  async loginWithToken(password: string): Promise<boolean | number> {
    let response = await this.sendMessageResponse(
      "aA",
      { accessToken: password },
      "aA"
    );
    if (response && response.typeCodes.length == 2) {
      if (this.__user != response.data!["user"]) {
        let oldUser = this.__user;
        this.__user = response.data!["user"];
        this._events.emit("accessChanged", {
          user: this.__user,
          oldUser: oldUser,
        });
        if (this.__user == 1) this.adminAccess.set(Ok(AccessTypes.WRITE));
      }
      return response.data!["user"];
    } else return false;
  }

  /**Returns the user which logged in*/
  async access(parent: Content, neededUser?: number): Promise<number> {
    let prompt = promptLogin({
      parent: parent,
      manualClose: true,
      title: "Login",
    });
    while (true) {
      let result = await prompt.promise;
      if (result.code == PromptCodes.CLOSED) {
        prompt.close();
        return 0;
      } else {
        let response = await this.sendMessageResponse(
          "aP",
          //@ts-expect-error
          { password: sha1(passwordBox.value), username: usernameBox.value },
          "aA"
        );
        if (response && response.typeCodes.length == 2) {
          if (typeof neededUser == "number") {
            //@ts-expect-error
            if ((response["user"] = neededUser)) {
              prompt.close();
              return response.data!["user"];
            } else {
              //@ts-expect-error
              usernameBox.text = "Username wrong";
            }
          } else {
            prompt.close();
            return response.data!["user"];
          }
        } else {
          //@ts-expect-error
          passwordBox.text = "Password wrong";
        }
      }
    }
  }

  /**Logs out the user from the manager*/
  logout() {
    this.sendMessage("aL");
  }

  /**Handles internal call when manager is logged out */
  protected __logoutInternal() {
    let oldUser = this.__user;
    this.__user = 0;
    this.__accessToken = "";
    this._events.emit("accessChanged", { user: 0, oldUser: oldUser });
    this.adminAccess.set(Ok(AccessTypes.READ));
  }

  /**Returns the logged in user*/
  get user(): number {
    return this.__user;
  }

  /**Add a user to the user list*/
  registerUser(user: USERU, id: number) {
    this.__userlist[id] = user;
    return user;
  }

  /**Add a user to the user list*/
  deregisterUser(user: USERU) {
    let index = this.__userlist.indexOf(user);
    if (index != -1) this.__userlist[index] = undefined;
  }

  /**Gets the user using the user id */
  getUserById(id: number): USERU | undefined {
    return this.__userlist[id];
  }

  /*Function to attach access related listeners*/
  __accessEventListeners() {
    this._events.on(
      "message",
      () => {
        promptInfo({ title: "Access was denied" });
        return false;
      },
      ["a", "D"]
    );
    this._events.on(
      "message",
      () => {
        this.__logoutInternal();
        return false;
      },
      ["a", "L"]
    );
    this._events.on("synced", () => {
      if (this.__accessToken != "") this.loginWithToken(this.__accessToken);
      return false;
    });
    this._events.on("resynced", () => {
      if (this.__accessToken != "") this.loginWithToken(this.__accessToken);
      return false;
    });
    this._events.on(
      "message",
      (e) => {
        switch (e.data.typeCodes[2]) {
          case "E": {
            promptInfo({ title: "Module not found" });
            break;
          }
          case "N": {
            promptInfo({ title: "Access insufficient to save module" });
            break;
          }
        }
        return false;
      },
      ["a", "C"]
    );
  }

  //#######################################################################################################################################################################################
  //#   __      __   _               ######################################################################################################################################################
  //#   \ \    / /  | |              ######################################################################################################################################################
  //#    \ \  / /_ _| |_   _  ___    ######################################################################################################################################################
  //#     \ \/ / _` | | | | |/ _ \   ######################################################################################################################################################
  //#      \  / (_| | | |_| |  __/   ######################################################################################################################################################
  //#       \/ \__,_|_|\__,_|\___|   ######################################################################################################################################################
  //#######################################################################################################################################################################################

  /**This registers the module as a value listener*/
  protected __registerValueListener(mod: Module) {
    if (this.__valueGetters.length === 0) {
      this.__valueGetters.push(mod);
      this.__valueGettersBuff.push(mod.uid);
      this.__valueGettersInterval = window.setInterval(() => {
        if (this.__valueGettersStaging.length > 0) {
          for (let i = 0, n = this.__valueGettersStaging.length; i < n; i++) {
            this.__valueGetters.push(this.__valueGettersStaging[i]);
            this.__valueGettersBuff.push(this.__valueGettersStaging[i].uid);
          }
          this.__valueGettersStaging = [];
        }
        if (this.__valueGettersBuff.length <= maxValuesPerMessage) {
          this.sendMessage("SV", this.__valueGettersBuff);
        } else {
          for (
            let i = 0, n = this.__valueGettersBuff.length;
            i < n;
            i += maxValuesPerMessage
          ) {
            this.sendMessage(
              "SV",
              this.__valueGettersBuff.slice(i, i + maxValuesPerMessage)
            );
          }
        }
      }, 1000);
    } else {
      this.__valueGettersStaging.push(mod);
    }
  }

  /**This deregisters the module as a value listener*/
  protected __deregisterValueListener(mod: Module) {
    let index = this.__valueGetters.indexOf(mod);
    if (index != -1) {
      this.__valueGetters.splice(index, 1);
      this.__valueGettersBuff.splice(index, 1);
      if (this.__valueGetters.length === 0) {
        clearInterval(this.__valueGettersInterval);
      }
      return;
    }
    index = this.__valueGettersStaging.indexOf(mod);
    if (index != -1) {
      this.__valueGettersStaging.splice(index, 1);
    }
  }

  /** Function to attach value related listeners
   * @private */
  __valueEventListeners() {
    this._events.on(
      "message",
      (e) => {
        for (const key in e.data) {
          //@ts-expect-error
          let mod = this.__moduleList[key];
          if (mod) {
            mod.value.serverUpdate(e.data.data[key]);
          }
        }
        return false;
      },
      ["S", "V"]
    );
    this._events.on("closed", () => {
      for (let i = 0; i < this.__moduleList.length; i++)
        if (this.__moduleList[i])
          // @ts-expect-error
          this.__moduleList[i]!.value.serverUpdate("CL");
      return false;
    });
  }

  //#######################################################################################################################################################################################
  //#     _____                                          _    #############################################################################################################################
  //#    / ____|                                        | |   #############################################################################################################################
  //#   | |     ___  _ __ ___  _ __ ___   __ _ _ __   __| |   #############################################################################################################################
  //#   | |    / _ \| '_ ` _ \| '_ ` _ \ / _` | '_ \ / _` |   #############################################################################################################################
  //#   | |___| (_) | | | | | | | | | | | (_| | | | | (_| |   #############################################################################################################################
  //#    \_____\___/|_| |_| |_|_| |_| |_|\__,_|_| |_|\__,_|   #############################################################################################################################
  //#######################################################################################################################################################################################
  /** Function to attach command related listeners */
  protected __commandListeners() {
    this._events.on(
      "message",
      (e) => {
        switch (e.data.typeCodes[1]) {
          case "A": {
            promptInfo({ title: "Access insufficient to run command" });
            if (e.data.data["id"]) {
              let mod = this.getModuleByUID(e.data.data["id"]);
              if (mod) {
                //@ts-expect-error
                mod.___commandResponse(e.data.data!);
              }
            }
            break;
          }
          case "E": {
            promptInfo({ title: "Module not found" });
            break;
          }
          case "R": {
            let res = serverResultMessageToResult(e.data.data["result"]);
            if (!res.success) promptResult({ result: res });
            break;
          }
          default: {
            if (e.data.data!["id"]) {
              let mod = this.getModuleByUID(e.data.data["id"]);
              if (mod) {
                //@ts-expect-error
                mod.___commandResponse(e.data.data);
              }
            }
            break;
          }
        }
        return false;
      },
      ["M"]
    );
  }
  //#######################################################################################################################################################################################
  //#     _____ _        _                #################################################################################################################################################
  //#    / ____| |      | |               #################################################################################################################################################
  //#   | (___ | |_ __ _| |_ _   _ ___    #################################################################################################################################################
  //#    \___ \| __/ _` | __| | | / __|   #################################################################################################################################################
  //#    ____) | || (_| | |_| |_| \__ \   #################################################################################################################################################
  //#   |_____/ \__\__,_|\__|\__,_|___/   #################################################################################################################################################
  //#######################################################################################################################################################################################

  /**This registers the module as a status listener*/
  protected __registerStatusListener(mod: Module) {
    if (this.__statusGetters.length === 0) {
      this.__statusGetters.push(mod);
      this.__statusGettersBuff.push(mod.uid);
      this.__statusGettersInterval = window.setInterval(() => {
        if (this.__statusGettersStaging.length > 0) {
          for (let i = 0, n = this.__statusGettersStaging.length; i < n; i++) {
            this.__statusGetters.push(this.__statusGettersStaging[i]);
            this.__statusGettersBuff.push(this.__statusGettersStaging[i].uid);
          }
          this.__statusGettersStaging = [];
        }
        if (this.__statusGettersBuff.length <= maxStatussesPerMessage) {
          this.sendMessage("Ss", this.__statusGettersBuff);
        } else {
          for (
            let i = 0, n = this.__statusGettersBuff.length;
            i < n;
            i += maxStatussesPerMessage
          ) {
            this.sendMessage(
              "Ss",
              this.__statusGettersBuff.slice(i, i + maxStatussesPerMessage)
            );
          }
        }
      }, 1000);
    } else {
      this.__statusGettersStaging.push(mod);
    }
  }

  /**This deregisters the module as a status listener*/
  protected __deregisterStatusListener(mod: Module) {
    let index = this.__statusGetters.indexOf(mod);
    if (index != -1) {
      this.__statusGetters.splice(index, 1);
      this.__statusGettersBuff.splice(index, 1);
      if (this.__statusGetters.length === 0) {
        clearInterval(this.__statusGettersInterval);
      }
      return;
    }
    index = this.__statusGettersStaging.indexOf(mod);
    if (index != -1) {
      this.__statusGettersStaging.splice(index, 1);
    }
  }

  /** Function to attach status related listeners */
  protected __statusEventListeners() {
    this._events.on(
      "message",
      (e) => {
        for (const key in e.data) {
          //@ts-expect-error
          if (this.__moduleList[key])
            //@ts-expect-error
            this.__moduleList[key].status.set = e.data[key];
        }
      },
      ["S", "s"]
    );
  }

  //#######################################################################################################################################################################################
  //#    _____       _ _   _       _   _____        _           ###########################################################################################################################
  //#   |_   _|     (_) | (_)     | | |  __ \      | |          ###########################################################################################################################
  //#     | |  _ __  _| |_ _  __ _| | | |  | | __ _| |_ __ _    ###########################################################################################################################
  //#     | | | '_ \| | __| |/ _` | | | |  | |/ _` | __/ _` |   ###########################################################################################################################
  //#    _| |_| | | | | |_| | (_| | | | |__| | (_| | || (_| |   ###########################################################################################################################
  //#   |_____|_| |_|_|\__|_|\__,_|_| |_____/ \__,_|\__\__,_|   ###########################################################################################################################
  //#######################################################################################################################################################################################
  /**Returns the stored initial data for the manager
   * @param designator
   * @param key if passed it only returns that key from the storage*/
  getInitialData(
    designator: ModuleDesignator,
    key?: string
  ):
    | undefined
    | {
        [key: string]: {};
      } {
    if (designator in this.__initialDataStorage) {
      if (key) {
        // @ts-expect-error
        return this.__initialDataStorage[designator][key];
      } else return this.__initialDataStorage[designator];
    }
  }

  /** Function to construct status functionality of manager */
  protected __initialDataConstructor() {
    this.__initialDataStorage = {};
    this.__initialDataListeners();
  }

  /** Function to attach initial data related listeners */
  protected __initialDataListeners() {
    this._events.on(
      "message",
      (e) => {
        let designator = e.data.data["des"];
        delete e.data.data["des"];
        if (designator in initialDataDecoders) {
          if (!(designator in this.__initialDataStorage)) {
            this.__initialDataStorage[designator] = {};
          }
          initialDataDecoders[designator](
            this,
            this.__initialDataStorage[designator],
            e.data.data
          );
        }
      },
      ["S", "I"]
    );
  }

  //#######################################################################################################################################################################################
  //#    _____  _             _              ##############################################################################################################################################
  //#   |  __ \| |           (_)             ##############################################################################################################################################
  //#   | |__) | |_   _  __ _ _ _ __  ___    ##############################################################################################################################################
  //#   |  ___/| | | | |/ _` | | '_ \/ __|   ##############################################################################################################################################
  //#   | |    | | |_| | (_| | | | | \__ \   ##############################################################################################################################################
  //#   |_|    |_|\__,_|\__, |_|_| |_|___/   ##############################################################################################################################################
  //#                    __/ |               ##############################################################################################################################################
  //#                   |___/                ##############################################################################################################################################
  //#######################################################################################################################################################################################
  /**Plugins allows for data storage with the manager
   * it returns the storage object for the plugin
   * @param name name of plugin, must be unique*/
  getPluginStorage(name: string): { [key: string]: any } {
    if (!(name in this.__pluginStorage)) this.__pluginStorage[name] = {};
    return this.__pluginStorage[name];
  }
}
