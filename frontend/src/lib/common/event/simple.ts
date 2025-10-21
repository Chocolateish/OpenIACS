/**Event class
 * contains the needed data to dispatch an event*/
export class E<Type, Target, Data> {
  /**Any data to pass to the event listeners must be given in the constructor*/
  constructor(type: Type, target: Target, data: Data) {
    this.type = type;
    this.target = target;
    this.data = data;
  }
  /**Type of event */
  public readonly type: Type;
  /**Reference to */
  public readonly target: Target;
  /**Data of event */
  public readonly data: Data;
}

/**Function used to subscribe to event*/
export type ESubscriber<Type, Target, Data> = (
  event: E<Type, Target, Data>
) => boolean | void;

export interface EventConsumer<Events extends {}, Target> {
  /**This add the subscriber to the event handler
   * Returning true in subscriber will remove the subscriber from the event handler after call*/
  on<K extends keyof Events>(
    eventName: K,
    subscriber: ESubscriber<K, Target, Events[K]>
  ): typeof subscriber;

  /**This removes the subscriber from the event handler*/
  off<K extends keyof Events>(
    eventName: K,
    subscriber: ESubscriber<K, Target, Events[K]>
  ): typeof subscriber;
}

export interface EventProducer<Events extends {}, Target>
  extends EventConsumer<Events, Target> {
  /**Override for target */
  target: Target | undefined;
  /**This dispatches the event, event data is frozen*/
  emit<K extends keyof Events>(eventName: K, data: Events[K]): void;
  /**This removes all listeners of a type from the event handler*/
  clear<K extends keyof Events>(eventName: K): void;
  /**Returns wether the type has listeners, true means it has at least a listener*/
  inUse<K extends keyof Events>(eventName: K): boolean;
  /**Returns wether the type has a specific listeners, true means it has that listener*/
  has<K extends keyof Events>(
    eventName: K,
    subscriber: ESubscriber<K, Target, Events[K]>
  ): boolean;
  /**Returns the amount of listeners on that event*/
  amount<K extends keyof Events>(eventName: K): number;
}

export class EventHandler<Events extends { [key: string]: any }, Target>
  implements EventProducer<Events, Target>
{
  private _running: string | number | symbol = "";
  target: Target;
  private eventHandler_ListenerStorage: {
    [K in keyof Events]?: ESubscriber<K, Target, Events[K]>[];
  } = {};
  constructor(target: Target) {
    this.target = target;
  }
  on<K extends keyof Events>(
    eventName: K,
    subscriber: ESubscriber<K, Target, Events[K]>
  ): typeof subscriber {
    let typeListeners = this.eventHandler_ListenerStorage[eventName];
    if (typeListeners) {
      let index = typeListeners.indexOf(subscriber);
      if (index == -1) {
        typeListeners.push(subscriber);
      } else {
        console.warn("Subscriber already in handler");
      }
    } else {
      this.eventHandler_ListenerStorage[eventName] = [subscriber];
    }
    return subscriber;
  }

  off<K extends keyof Events>(
    eventName: K,
    subscriber: ESubscriber<K, Target, Events[K]>
  ) {
    if (eventName === this._running) {
      console.warn(
        "Cannot remove subscriber for event while it is being dispatched"
      );
      return subscriber;
    }
    let typeListeners = this.eventHandler_ListenerStorage[eventName];
    if (typeListeners) {
      let index = typeListeners.indexOf(subscriber);
      if (index != -1) {
        typeListeners.splice(index, 1);
      } else {
        console.warn("Subscriber not in handler");
      }
    }
    return subscriber;
  }

  emit<K extends keyof Events>(eventName: K, data: Events[K]) {
    let funcs = this.eventHandler_ListenerStorage[eventName];
    if (funcs && funcs.length > 0) {
      this._running = eventName;
      let event = Object.freeze(
        new E<K, Target, Events[K]>(eventName, this.target, data)
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
      this._running = "";
    }
  }

  clear<K extends keyof Events>(eventName: K): void {
    this.eventHandler_ListenerStorage[eventName] = [];
  }

  inUse<K extends keyof Events>(eventName: K): boolean {
    return Boolean(this.eventHandler_ListenerStorage[eventName]?.length);
  }

  has<K extends keyof Events>(
    eventName: K,
    subscriber: ESubscriber<K, Target, Events[K]>
  ): boolean {
    return Boolean(
      this.eventHandler_ListenerStorage[eventName]?.indexOf(subscriber) !== -1
    );
  }

  amount<K extends keyof Events>(eventName: K): number {
    return this.eventHandler_ListenerStorage[eventName]?.length || 0;
  }

  get consumer(): EventConsumer<Events, Target> {
    return this;
  }
  get producer(): EventProducer<Events, Target> {
    return this;
  }
}
