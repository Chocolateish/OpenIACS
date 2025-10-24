import type { AccessTypes } from "@libBase";
import type { EventConsumer } from "@libEvent";
import type { StateRead, StateReadOk } from "@libState";
import type { ContentBase } from "@libUI";
import { Value } from "@libValues";
import type { ModuleManagerBase } from "./moduleManagerTypes";

export type ModuleRef = {
  ip: string;
  uid: number;
};

export interface ModuleBase<
  PreConfigs extends {} = {},
  Configs extends {} = {}
> {
  readonly events: EventConsumer<ModuleEvents, ModuleBase<PreConfigs, Configs>>;
  readonly configs: StateRead<Configs>;

  readonly manager: ModuleManagerBase;

  readonly name: string;
  readonly designator: ModuleDesignator;
  readonly parent?: ModuleBase;
  readonly sid: number;

  readonly uid: number;
  readonly user: number;
  readonly user2: number;
  readonly accessConfig: StateReadOk<AccessTypes>;

  readonly hasValue: boolean;
  readonly valueAccess: ModuleValueAccessEnum;
  readonly value: Value;
  readonly valueFormatted: Value;
  readonly unit: Value;

  readonly children: ModuleBase[];
  readonly amountChildren: number;

  subModuleAdder(_options: {}): ContentBase;
  readonly canAddSubModules: boolean;

  readonly status: Value;
  readonly statusText: Value;

  readonly browserActions: { text: string; action: () => void }[];
  ___rename(name: string): void;
  ___nameDecode(layer: number): string;
  command(data: { [key: string]: any }): void;
}

export type ModuleDesignator = string;

/**Value types values*/
export const ModuleValueAccessEnum = {
  NONE: 0,
  INPUT: 1,
  OUTPUT: 2,
} as const;
export type ModuleValueAccessEnum =
  (typeof ModuleValueAccessEnum)[keyof typeof ModuleValueAccessEnum];

export const ModuleValueTypeEnum = {
  Null: 0,
  DIG: 1,
  SIG32: 2,
  UNS32: 3,
  SIG64: 4,
  UNS64: 5,
  ENUM: 6,
  FLT32: 7,
} as const;
export type ModuleValueTypeEnum =
  (typeof ModuleValueTypeEnum)[keyof typeof ModuleValueTypeEnum];

/**Module configurations that are preloaded and kept updated */
export type ModuleBaseFixedConfigs = {
  /**Unique id of module*/
  readonly uid: number;
  /**designator of module*/
  readonly des: ModuleDesignator;
  /**Id of modules parent*/
  readonly pid: number;
};

/**Module configurations that are preloaded and kept updated */
export type ModuleBasePreConfigs = {
  /**sub id of module*/
  readonly sid: number;
  /**name of module*/
  readonly name: string;
  /**access of module*/
  readonly access: number;
  /**unit of module*/
  readonly unit: number;
  /**type of value of module*/
  readonly vt: number;
  /**access of value of module*/
  readonly va: ModuleValueAccessEnum;
  /**format of module value*/
  readonly vf: number;

  /**Primary user for access */
  readonly user: number;
  /**Secondary user for access */
  readonly user2: number;
};

/**The different event types available for the modules*/
export type ModuleEvents = {
  updated: {}; //New base values recieved
  removed: {}; //Module is removed
  childAdded: { module: ModuleBase }; //Child was added to module
  childRemoved: { module: ModuleBase }; //Child was removed from module
};
