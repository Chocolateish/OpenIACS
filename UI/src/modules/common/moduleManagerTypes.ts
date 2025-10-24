import type { AccessTypes } from "@libBase";
import type { EventSubConsumer } from "@libEvent";
import type { StateOk, StateReadOk } from "@libState";
import type { Content } from "@libUI";
import type { ModuleBase, ModuleDesignator } from "./moduleTypes";
import type { USERUBase } from "./useruTypes";

//Class for dispatching message events for connection
export type Message = {
  /**Type codes to identify message*/
  readonly typeCodes: string[];
  /**Data contained in message*/
  readonly data: any;
};

export interface ModuleManagerBase {
  readonly events: EventSubConsumer<ModuleManagerEvents, ModuleManagerBase>;

  readonly name: StateOk<string>;
  readonly version: StateOk<string>;

  readonly ipAddress: string;
  readonly offlineID: string;
  readonly user: number;
  readonly messageID: number;
  readonly connectionTimeOutOffset: number;
  readonly root: ModuleBase;
  readonly adminAccess: StateReadOk<AccessTypes>;

  sendMessage(typeCodes: string, object?: {}): void;
  registerMessagePromise(
    messageID: number,
    resolver: (value: any) => void
  ): void;

  getModuleByUID(uid: number): ModuleBase | undefined;
  getInitialData(
    designator: ModuleDesignator,
    key?: string
  ):
    | undefined
    | {
        [key: string]: {};
      };
  getUserById(id: number): USERUBase | undefined;
  registerUser(user: USERUBase, id: number): void;
  deregisterUser(user: USERUBase): void;

  loginPrompt(parent?: Content): Promise<number>;
  login(password: string, username: string): Promise<boolean | number>;
  logout(): void;

  getPluginStorage(name: string): { [key: string]: any };
}

/**The different event types available for the module manager*/
export type ModuleManagerEvents = {
  created: {};
  message: Message;
  opened: {};
  connected: {};
  syncProgress: {
    amount: number;
    total: number;
  };
  synced: {};
  resynced: {};
  closed: {};
  save: {};
  removed: {};
  accessChanged: { user: number; oldUser: number };
  moduleAdded: { module: ModuleBase };
  moduleRemoved: { module: ModuleBase };
  moduleUpdate: {};
};
