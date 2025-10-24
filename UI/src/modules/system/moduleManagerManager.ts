import { anyEquals, ResultWrapper } from "@libCommon";
import {
  EventHandler,
  type ESubSubscriber,
  type EventSubConsumer,
} from "@libEvent";
import { Ok } from "@libResult";
import {
  stateDerivedOk,
  stateOk,
  type StateOk,
  type StateReadOk,
} from "@libState";
import type { ModuleManagerBase, ModuleManagerEvents } from "@modCommon";
import { ModuleManager } from "./moduleManager";
import { type ModuleManagerOptions, type ModuleManagerSaveData } from "./types";

export let managerListEvents = new EventHandler<
  {
    created: { manager: ModuleManager };
    removed: { manager: ModuleManager };
    masterChanged: { master: ModuleManager; oldMaster: ModuleManager | null };
  },
  {}
>({});

/** this stores the master connection */
let __master: ModuleManager | null = null;

/** Returns the master connection */
export function master(): ModuleManager | null {
  return __master;
}

/**This changes which manager is the master of the system*/
export let changeMaster = (man: ModuleManager) => {
  if (__master instanceof ModuleManager) {
    __master.master = false;
  }
  let oldMaster = __master;
  (__master = man).master = true;
  for (let i = 0; i < masterEventListenerStorage.length; i++) {
    if (oldMaster) {
      oldMaster.events.off(
        masterEventListenerStorage[i].eventName,
        masterEventListenerStorage[i].subscriber,
        masterEventListenerStorage[i].sub
      );
    }
    __master.events.on(
      masterEventListenerStorage[i].eventName,
      masterEventListenerStorage[i].subscriber,
      masterEventListenerStorage[i].sub
    );
  }
  managerListEvents.emit("masterChanged", {
    master: man,
    oldMaster: oldMaster,
  });
  saveManagers();
};

export let masterEventHandler = new (class MasterEventHandler
  implements EventSubConsumer<ModuleManagerEvents, ModuleManagerBase>
{
  on<K extends keyof ModuleManagerEvents>(
    eventName: K,
    subscriber: ESubSubscriber<K, ModuleManagerBase, ModuleManagerEvents[K]>,
    sub?: string[]
  ): typeof subscriber {
    masterEventListenerStorage.push({ eventName, subscriber, sub });
    if (__master) __master.events.on(eventName, subscriber, sub);

    return subscriber;
  }

  off<K extends keyof ModuleManagerEvents>(
    eventName: K,
    subscriber: ESubSubscriber<K, ModuleManagerBase, ModuleManagerEvents[K]>,
    sub?: string[]
  ): typeof subscriber {
    let index = masterEventListenerStorage.findIndex((e) => {
      return anyEquals(e, { eventName, subscriber, sub });
    });
    if (index != -1) {
      masterEventListenerStorage.splice(index, 1);
      if (__master) __master.events.off(eventName, subscriber, sub);
    }
    return subscriber;
  }
})();

/**Stores event handlers for adding to new managers*/
let masterEventListenerStorage: {
  eventName: keyof ModuleManagerEvents;
  subscriber: ESubSubscriber<any, any, any>;
  sub?: string[];
}[] = [];

/**this stores all module managers*/
let __managers: ModuleManager[] = [];

/**this stores all module managers by their ip address*/
let __managersIP: { [s: string]: ModuleManager } = {};

/** Returns a list of all module managers in the system
 * @param includeLocal wether the local manager should be included*/
export function managers(): ModuleManager[] {
  return [...__managers];
}

/**Returns the manager of the given ip address*/
export function getManagerByIP(ip: string): ModuleManager | undefined {
  return __managersIP[ip];
}

/**Runs a function for every manager
 * @param func function to run for every manager*/
export function managersRunFunction(func: (man: ModuleManager) => void) {
  for (let i = 0; i < __managers.length; i++) func(__managers[i]);
}

/**Checks if an ip address has been used before*/
function checkIp(ip: string) {
  return Boolean(
    managers().reduce((_a, e) => {
      return Number(e.ipAddress == ip);
    }, 0)
  );
}

/**This sends a message over the websocket connection
 * @param typeCodes Event typecodes
 * @param object message data*/
export let sendGlobalMessage = (typeCodes: string, object: {}) => {
  for (let i = 0; i < __managers.length; i++)
    __managers[i].sendMessage(typeCodes, object);
};

/**Value set true when finished loading from local storage*/
let __finishedLoading = false;

/** Creates a module manager and adds it to the system*/
export function addManager(options: ModuleManagerOptions) {
  if (typeof options !== "object" || options === null)
    return new ResultWrapper(false, "Options must be passed");
  if (!("ipAddress" in options))
    return new ResultWrapper(false, "Ip address must be passed");
  if (checkIp(options.ipAddress))
    return new ResultWrapper(false, "Manager with ip already registered");
  let modMan = ModuleManager.create(options);
  if (!__master && __finishedLoading) changeMaster(modMan);
  __managers.push(modMan);
  amountOfManagers.set(Ok(__managers.length));
  if (__managers.length !== 0)
    amountOfManagersSynced.setStates(
      ...(__managers.map((e) => e.synced) as [
        StateOk<boolean>,
        ...StateOk<boolean>[]
      ])
    );
  __managersIP[modMan.ipAddress] = modMan;
  managerListEvents.emit("created", { manager: modMan });
  saveManagers();
  modMan.events.on("save", saveManagers);
  //Adds all global event listeners to the new manager
  globalEventListenerStorage.forEach((e) => {
    modMan.events.on(e.eventName, e.subscriber, e.sub);
  });
  return modMan;
}

/** This removes the module manager from the system*/
export function removeManager(modMan: ModuleManager) {
  if (__managers.length <= 1) {
    return new ResultWrapper(false, "At least one manager must be present");
  }
  //Manager is told to clean up
  modMan.remove();
  // Manager is deleted from the list
  let index = __managers.indexOf(modMan);
  if (index != -1) {
    __managers.splice(index, 1);
  }
  amountOfManagers.set(Ok(__managers.length));
  if (__managers.length !== 0)
    amountOfManagersSynced.setStates(
      ...(__managers.map((e) => e.synced) as [
        StateOk<boolean>,
        ...StateOk<boolean>[]
      ])
    );
  delete __managersIP[modMan.ipAddress];
  if (modMan.master) {
    changeMaster(managers()[0]);
  }
  //This call the remove system event, this hopefully cleans all references to the manager
  managerListEvents.emit("removed", { manager: modMan });
  saveManagers();
  return undefined;
}

export let globalEventHandler = new (class GlobalEventHandler
  implements EventSubConsumer<ModuleManagerEvents, ModuleManagerBase>
{
  on<K extends keyof ModuleManagerEvents>(
    eventName: K,
    subscriber: ESubSubscriber<K, ModuleManagerBase, ModuleManagerEvents[K]>,
    sub?: string[]
  ): typeof subscriber {
    let mans = managers();
    globalEventListenerStorage.push({
      eventName,
      subscriber,
      sub,
    });
    for (let i = 0, n = mans.length; i < n; i++)
      mans[i].events.on(eventName, subscriber, sub);
    return subscriber;
  }

  off<K extends keyof ModuleManagerEvents>(
    eventName: K,
    subscriber: ESubSubscriber<K, ModuleManagerBase, ModuleManagerEvents[K]>,
    sub?: string[]
  ): typeof subscriber {
    let index = globalEventListenerStorage.findIndex((e) => {
      return anyEquals(e, { eventName, subscriber, sub });
    });
    if (index != -1) {
      globalEventListenerStorage.splice(index, 1);
      let mans = managers();
      for (let i = 0, n = mans.length; i < n; i++)
        mans[i].events.off(eventName, subscriber, sub);
    }
    return subscriber;
  }
})();
/**Stores global event listeners for adding to new managers*/
let globalEventListenerStorage: {
  eventName: keyof ModuleManagerEvents;
  subscriber: ESubSubscriber<any, any, any>;
  sub?: string[];
}[] = [];

/**This saves all managers to local storage */
let saveManagers = () => {
  let mans = managers();
  let stor = mans
    .map((e) => {
      return e.saveData;
    })
    .filter((e) => {
      return e;
    });
  localStorage.setItem("managers", JSON.stringify(stor));
  return false;
};

//Loads managers from local storage and adds them to the system
(async () => {
  await {};
  let mansStorage = localStorage.getItem("managers");
  if (mansStorage) {
    let mans = JSON.parse(mansStorage) as ModuleManagerSaveData[] | null;
    if (mans instanceof Array) {
      mans.forEach((e) => {
        e.permanent = true;
        let modMan = addManager(e);
        if (e.master && modMan instanceof ModuleManager) {
          changeMaster(modMan);
        }
      });
    } else if (mans) {
      console.warn("Invalid storage of managers found");
    }
  }
  __finishedLoading = true;
  let manses = managers();
  if (
    manses.length === 0 &&
    !document.location.hostname.includes("localhost")
  ) {
    addManager({ ipAddress: document.location.hostname });
  }
})();

export let amountOfManagers = stateOk(Ok(0));
export let amountOfManagersSynced = stateDerivedOk<
  [StateReadOk<boolean>, ...StateReadOk<boolean>[]],
  number
>((connected) => {
  return Ok(
    connected.reduce((a, e) => {
      return a + Number(e.unwrap);
    }, 0)
  );
}, stateOk(Ok(false)));
export let percentageOfManagersSynced = stateDerivedOk(
  (amounts) => {
    return Ok(
      (amounts[1].unwrap / (amounts[0].unwrap === 0 ? 1 : amounts[0].unwrap)) *
        100
    );
  },
  amountOfManagers,
  amountOfManagersSynced
);
