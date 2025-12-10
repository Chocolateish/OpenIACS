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
) => void;

export interface EventSubConsumer<Events extends object, Target> {
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
  /**Registers a proxy event handler that recieves all events from this event handler */
  proxy_on(
    subscriber: ESubSubscriber<keyof Events, Target, Events[keyof Events]>
  ): typeof subscriber;
  /**Deregisters a proxy event handler that recieves all events from this event handler */
  proxy_off(
    subscriber: ESubSubscriber<keyof Events, Target, Events[keyof Events]>
  ): typeof subscriber;
}

export interface EventSubProducer<Events extends object, Target>
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
  in_use<K extends keyof Events>(eventName: K, sub?: SubPath): boolean;
  /**Returns wether the type has a specific listeners, true means it has that listener*/
  has<K extends keyof Events>(
    eventName: K,
    subscriber: ESubSubscriber<K, Target, Events[K]>,
    sub?: SubPath
  ): boolean;
  /**Returns the amount of listeners on that event*/
  amount<K extends keyof Events>(eventName: K, sub?: SubPath): number;
  /**Generates a proxy function which can be registered with another handlers */
  proxy_func(): ESubSubscriber<keyof Events, Target, Events[keyof Events]>;
}

/**Type for storage of listeners in event handler */
interface ListenerStorage<K, Handler, Type> {
  subs: { [key: string]: ListenerStorage<K, Handler, Type> };
  funcs: Set<ESubSubscriber<K, Handler, Type>>;
}

/**Extension to event handler with support for sub events*/
export class EventHandlerSub<Events extends object, Target>
  implements EventSubProducer<Events, Target>
{
  target: Target;
  #subStorage: {
    [K in keyof Events]?: ListenerStorage<K, Target, Events[K]>;
  } = {};
  #proxies?: Set<ESubSubscriber<keyof Events, Target, Events[keyof Events]>>;

  constructor(target: Target) {
    this.target = target;
  }

  //# Consumer

  on<K extends keyof Events>(
    eventName: K,
    subscriber: ESubSubscriber<K, Target, Events[K]>,
    sub?: SubPath
  ): typeof subscriber {
    let subLevel = this.#subStorage[eventName];
    if (!subLevel)
      subLevel = this.#subStorage[eventName] = {
        subs: {},
        funcs: new Set(),
      };
    if (sub)
      for (let i = 0; i < sub.length; i++) {
        const subLevelBuffer = subLevel!.subs[sub[i]];
        if (subLevelBuffer) subLevel = subLevelBuffer;
        else subLevel = subLevel!.subs[sub[i]] = { subs: {}, funcs: new Set() };
      }
    const typeListeners = subLevel!.funcs;
    if (typeListeners.has(subscriber))
      console.error("Subscriber already in handler");
    else typeListeners.add(subscriber);
    return subscriber;
  }

  off<K extends keyof Events>(
    eventName: K,
    subscriber: ESubSubscriber<K, Target, Events[K]>,
    sub?: SubPath
  ): typeof subscriber {
    let subLevel = this.#subStorage[eventName];
    if (subLevel) {
      if (sub)
        for (let i = 0; i < sub.length; i++) {
          const subLevelBuffer = subLevel!.subs[sub[i]];
          if (subLevelBuffer) subLevel = subLevelBuffer;
          else {
            console.error("Subscriber not in handler");
            return subscriber;
          }
        }
      if (subLevel!.funcs.delete(subscriber) === false)
        console.error("Subscriber not in handler");
    }
    return subscriber;
  }

  proxy_on(
    subscriber: ESubSubscriber<keyof Events, Target, Events[keyof Events]>
  ): typeof subscriber {
    if (!this.#proxies) this.#proxies = new Set([subscriber]);
    else if (!this.#proxies.has(subscriber)) this.#proxies.add(subscriber);
    else console.error("Proxy subscriber already registered");
    return subscriber;
  }
  proxy_off(
    subscriber: ESubSubscriber<keyof Events, Target, Events[keyof Events]>
  ): typeof subscriber {
    if (this.#proxies?.delete(subscriber) === false)
      console.error("Proxy subscriber not registered");
    return subscriber;
  }

  get consumer(): EventSubConsumer<Events, Target> {
    return this;
  }

  //#Producer

  emit<K extends keyof Events>(
    eventName: K,
    data: Events[K],
    sub?: SubPath
  ): void {
    let funcs: Set<ESubSubscriber<K, Target, Events[K]>> | undefined;
    if (sub) {
      let subLevel = this.#subStorage[eventName];
      if (subLevel)
        for (let i = 0; i < sub.length; i++) {
          const subLevelBuffer = subLevel!.subs[sub[i]];
          if (subLevelBuffer) subLevel = subLevelBuffer;
          else if (this.#proxies?.size)
            return this.#emitE(
              Object.freeze(
                new ESub<K, Target, Events[K]>(
                  eventName,
                  this.target,
                  data,
                  sub
                )
              ),
              funcs as Set<
                ESubSubscriber<keyof Events, Target, Events[keyof Events]>
              >
            );
          else return;
        }
      funcs = subLevel?.funcs;
    } else funcs = this.#subStorage[eventName]?.funcs;
    if (funcs?.size || this.#proxies?.size)
      this.#emitE(
        Object.freeze(
          new ESub<K, Target, Events[K]>(eventName, this.target, data, sub)
        ),
        funcs as Set<ESubSubscriber<keyof Events, Target, Events[keyof Events]>>
      );
  }

  #emitE(
    e: ESub<keyof Events, Target, Events[keyof Events]>,
    funcs?: Set<ESubSubscriber<keyof Events, Target, Events[keyof Events]>>
  ) {
    this.#proxies?.forEach((proxy) => {
      proxy(e);
    });
    funcs?.forEach((func) => {
      try {
        func(e);
      } catch (e) {
        console.error("Failed while dispatching event", e);
      }
    });
  }

  clear<K extends keyof Events>(
    eventName: K,
    sub?: SubPath,
    anyLevel?: boolean
  ): void {
    let typeBuff = this.#subStorage[eventName];
    if (typeBuff) {
      if (anyLevel) {
        if (sub) {
          let i = 0;
          let subLevel = typeBuff;
          for (i; i < sub.length - 1; i++) {
            const subLevelBuffer = subLevel!.subs[sub[i]];
            if (subLevelBuffer) subLevel = subLevelBuffer;
            else return;
          }
          subLevel!.subs[sub[i]] = { subs: {}, funcs: new Set() };
        } else
          this.#subStorage[eventName] = {
            subs: {},
            funcs: new Set(),
          };
      } else {
        if (sub)
          for (let i = 0; i < sub.length; i++) {
            const subLevelBuffer = typeBuff!.subs[sub[i]];
            if (subLevelBuffer) typeBuff = subLevelBuffer;
            else return;
          }
        typeBuff.funcs.clear();
      }
    }
  }

  in_use<K extends keyof Events>(eventName: K, sub?: SubPath): boolean {
    let typeBuff = this.#subStorage[eventName];
    if (typeBuff) {
      if (sub)
        for (let i = 0; i < sub.length; i++) {
          const subLevelBuffer = typeBuff!.subs[sub[i]];
          if (subLevelBuffer) typeBuff = subLevelBuffer;
          else return false;
        }
      return Boolean(typeBuff.funcs.size);
    } else return false;
  }

  has<K extends keyof Events>(
    eventName: K,
    subscriber: ESubSubscriber<K, Target, Events[K]>,
    sub?: SubPath
  ): boolean {
    let typeBuff = this.#subStorage[eventName];
    if (typeBuff) {
      if (sub)
        for (let i = 0; i < sub.length; i++) {
          const subLevelBuffer = typeBuff!.subs[sub[i]];
          if (subLevelBuffer) typeBuff = subLevelBuffer;
          else return false;
        }
      return typeBuff.funcs.has(subscriber);
    } else return false;
  }

  amount<K extends keyof Events>(eventName: K, sub?: SubPath): number {
    let typeBuff = this.#subStorage[eventName];
    if (typeBuff) {
      if (sub)
        for (let i = 0; i < sub.length; i++) {
          const subLevelBuffer = typeBuff!.subs[sub[i]];
          if (subLevelBuffer) typeBuff = subLevelBuffer;
          else return 0;
        }
      return typeBuff.funcs.size;
    } else return 0;
  }

  proxy_func(): ESubSubscriber<keyof Events, Target, Events[keyof Events]> {
    return (e: ESub<keyof Events, Target, Events[keyof Events]>) => {
      let funcs:
        | Set<ESubSubscriber<keyof Events, Target, Events[keyof Events]>>
        | undefined;
      if (e.sub) {
        let subLevel = this.#subStorage[e.type];
        if (subLevel)
          for (let i = 0; i < e.sub.length; i++) {
            const subLevelBuffer = subLevel!.subs[e.sub[i]];
            if (subLevelBuffer) subLevel = subLevelBuffer;
            else return;
          }
        funcs = subLevel?.funcs;
      } else funcs = this.#subStorage[e.type]?.funcs;
      if (funcs && funcs.size) this.#emitE(e, funcs);
    };
  }

  get producer(): EventSubProducer<Events, Target> {
    return this;
  }
}
