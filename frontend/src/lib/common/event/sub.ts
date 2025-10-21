/**Path to subevent */
type SubPath = string[];

/**Event class
 * contains the needed data to dispatch an event*/
export class ESub<Type, Target, Data> {
  /**Any data to pass to the event listeners must be given in the constructor*/
  constructor(type: Type, target: Target, data: Data, sub?: SubPath) {
    this.type = type;
    this.target = target;
    this.data = data;
    this.sub = sub;
  }
  /**Type of event */
  public readonly type: Type;
  /**Reference to */
  public readonly target: Target;
  /**Path to sub event */
  public readonly sub?: SubPath;
  /**Data of event */
  public readonly data: Data;
}

/**Function used to subscribe to event*/
export type ESubSubscriber<Type, Target, Data> = (
  event: ESub<Type, Target, Data>
) => boolean | void;

export interface EventSubConsumer<Events extends {}, Target> {
  /**This add the subscriber to the event handler
   * Returning true in subscriber will remove the subscriber from the event handler after call*/
  on<K extends keyof Events>(
    eventName: K,
    subscriber: ESubSubscriber<K, Target, Events[K]>,
    sub?: SubPath
  ): typeof subscriber;
  /**This removes the subscriber from the event handler*/
  off<K extends keyof Events>(
    eventName: K,
    subscriber: ESubSubscriber<K, Target, Events[K]>,
    sub?: SubPath
  ): typeof subscriber;
}

export interface EventSubProducer<Events extends {}, Target>
  extends EventSubConsumer<Events, Target> {
  /**Override for target */
  target: Target | undefined;
  /**This dispatches the event, event data is frozen*/
  emit<K extends keyof Events>(
    eventName: K,
    data: Events[K],
    sub?: SubPath
  ): void;
  /**This removes all listeners of a type from the event handler*/
  clear<K extends keyof Events>(
    eventName: K,
    sub?: SubPath,
    anyLevel?: boolean
  ): void;
  /**Returns wether the type has listeners, true means it has at least a listener*/
  inUse<K extends keyof Events>(eventName: K, sub?: SubPath): boolean;
  /**Returns wether the type has a specific listeners, true means it has that listener*/
  has<K extends keyof Events>(
    eventName: K,
    subscriber: ESubSubscriber<K, Target, Events[K]>,
    sub?: SubPath
  ): boolean;
  /**Returns the amount of listeners on that event*/
  amount<K extends keyof Events>(eventName: K, sub?: SubPath): number;
}

/**Type for storage of listeners in event handler */
interface ListenerStorage<K, Handler, Type> {
  subs: { [key: string]: ListenerStorage<K, Handler, Type> };
  funcs: ESubSubscriber<K, Handler, Type>[];
}

/**Extension to event handler with support for sub events*/
export class EventHandlerSub<Events extends {}, Target>
  implements EventSubProducer<Events, Target>
{
  private _running: string | number | symbol = "";
  target: Target;
  private eventHandler_ListenerStorage: {
    [K in keyof Events]?: ListenerStorage<K, Target, Events[K]>;
  } = {};
  constructor(target: Target) {
    this.target = target;
  }
  on<K extends keyof Events>(
    eventName: K,
    subscriber: ESubSubscriber<K, Target, Events[K]>,
    sub?: SubPath
  ): typeof subscriber {
    let subLevel = this.eventHandler_ListenerStorage[eventName];
    if (!subLevel) {
      subLevel = this.eventHandler_ListenerStorage[eventName] = {
        subs: {},
        funcs: [],
      };
    }
    if (sub) {
      for (let i = 0; i < sub.length; i++) {
        let subLevelBuffer = subLevel!.subs[sub[i]];
        if (subLevelBuffer) {
          subLevel = subLevelBuffer;
        } else {
          subLevel = subLevel!.subs[sub[i]] = { subs: {}, funcs: [] };
        }
      }
    }
    var typeListeners = subLevel!.funcs;
    let index = typeListeners.indexOf(subscriber);
    if (index == -1) {
      typeListeners.push(subscriber);
    } else {
      console.warn("Subscriber already in handler");
    }
    return subscriber;
  }
  off<K extends keyof Events>(
    eventName: K,
    subscriber: ESubSubscriber<K, Target, Events[K]>,
    sub?: SubPath
  ): typeof subscriber {
    if (eventName === this._running) {
      console.warn(
        "Cannot remove subscriber for event while it is being dispatched"
      );
      return subscriber;
    }
    var subLevel = this.eventHandler_ListenerStorage[eventName];
    if (subLevel) {
      if (sub) {
        for (let i = 0; i < sub.length; i++) {
          let subLevelBuffer = subLevel!.subs[sub[i]];
          if (subLevelBuffer) {
            subLevel = subLevelBuffer;
          } else {
            console.warn("Subscriber not in handler");
            return subscriber;
          }
        }
      }
      var typeListeners = subLevel!.funcs;
      let index = typeListeners.indexOf(subscriber);
      if (index != -1) {
        typeListeners.splice(index, 1);
      } else {
        console.warn("Subscriber not in handler");
      }
    }
    return subscriber;
  }

  emit<K extends keyof Events>(
    eventName: K,
    data: Events[K],
    sub?: SubPath
  ): void {
    this._running = eventName;
    if (sub) {
      var subLevel = this.eventHandler_ListenerStorage[eventName];
      if (subLevel) {
        for (let i = 0; i < sub.length; i++) {
          let subLevelBuffer = subLevel!.subs[sub[i]];
          if (subLevelBuffer) {
            subLevel = subLevelBuffer;
          } else {
            return;
          }
        }
      }
      var funcs = subLevel?.funcs;
    } else {
      var funcs = this.eventHandler_ListenerStorage[eventName]?.funcs;
    }
    if (funcs && funcs.length > 0) {
      let event = Object.freeze(
        new ESub<K, Target, Events[K]>(eventName, this.target, data, sub)
      );
      for (let i = 0, n = funcs.length; i < n; i++) {
        try {
          if (funcs[i](event) === true) {
            funcs.splice(i, 1);
            n--;
            i--;
          }
        } catch (e) {
          console.warn("Failed while dispatching event", e);
        }
      }
    }
    this._running = "";
  }
  clear<K extends keyof Events>(
    eventName: K,
    sub?: SubPath,
    anyLevel?: boolean
  ): void {
    let typeBuff = this.eventHandler_ListenerStorage[eventName];
    if (typeBuff) {
      if (anyLevel) {
        if (sub) {
          let subLevel = typeBuff;
          for (var i = 0; i < sub.length - 1; i++) {
            let subLevelBuffer = subLevel!.subs[sub[i]];
            if (subLevelBuffer) {
              subLevel = subLevelBuffer;
            } else {
              return;
            }
          }
          subLevel!.subs[sub[i]] = { subs: {}, funcs: [] };
        } else {
          this.eventHandler_ListenerStorage[eventName] = {
            subs: {},
            funcs: [],
          };
        }
      } else {
        if (sub) {
          for (let i = 0; i < sub.length; i++) {
            let subLevelBuffer = typeBuff!.subs[sub[i]];
            if (subLevelBuffer) {
              typeBuff = subLevelBuffer;
            } else {
              return;
            }
          }
        }
        typeBuff.funcs = [];
      }
    }
  }
  inUse<K extends keyof Events>(eventName: K, sub?: SubPath): boolean {
    let typeBuff = this.eventHandler_ListenerStorage[eventName];
    if (typeBuff) {
      if (sub) {
        for (let i = 0; i < sub.length; i++) {
          let subLevelBuffer = typeBuff!.subs[sub[i]];
          if (subLevelBuffer) {
            typeBuff = subLevelBuffer;
          } else {
            return false;
          }
        }
      }
      return Boolean(typeBuff.funcs.length);
    } else {
      return false;
    }
  }
  has<K extends keyof Events>(
    eventName: K,
    subscriber: ESubSubscriber<K, Target, Events[K]>,
    sub?: SubPath
  ): boolean {
    let typeBuff = this.eventHandler_ListenerStorage[eventName];
    if (typeBuff) {
      if (sub) {
        for (let i = 0; i < sub.length; i++) {
          let subLevelBuffer = typeBuff!.subs[sub[i]];
          if (subLevelBuffer) {
            typeBuff = subLevelBuffer;
          } else {
            return false;
          }
        }
      }
      return Boolean(typeBuff.funcs.indexOf(subscriber) !== -1);
    } else {
      return false;
    }
  }
  amount<K extends keyof Events>(eventName: K, sub?: SubPath): number {
    let typeBuff = this.eventHandler_ListenerStorage[eventName];
    if (typeBuff) {
      if (sub) {
        for (let i = 0; i < sub.length; i++) {
          let subLevelBuffer = typeBuff!.subs[sub[i]];
          if (subLevelBuffer) {
            typeBuff = subLevelBuffer;
          } else {
            return 0;
          }
        }
      }
      return typeBuff.funcs.length;
    } else {
      return 0;
    }
  }

  get consumer(): EventSubConsumer<Events, Target> {
    return this;
  }
  get producer(): EventSubProducer<Events, Target> {
    return this;
  }
}
