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
) => void;

export interface EventConsumer<Events extends object, Target> {
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
  /**Registers a proxy event handler that recieves all events from this event handler */
  proxy_on(
    subscriber: ESubscriber<keyof Events, Target, Events[keyof Events]>
  ): typeof subscriber;
  /**Deregisters a proxy event handler that recieves all events from this event handler */
  proxy_off(
    subscriber: ESubscriber<keyof Events, Target, Events[keyof Events]>
  ): typeof subscriber;
}

export interface EventProducer<Events extends object, Target>
  extends EventConsumer<Events, Target> {
  /**Override for target */
  target: Target | undefined;
  /**This dispatches the event, event data is frozen*/
  emit<K extends keyof Events>(eventName: K, data: Events[K]): void;
  /**This removes all listeners of a type from the event handler*/
  clear<K extends keyof Events>(eventName: K): void;
  /**Returns wether the type has listeners, true means it has at least a listener*/
  in_use<K extends keyof Events>(eventName: K): boolean;
  /**Returns wether the type has a specific listeners, true means it has that listener*/
  has<K extends keyof Events>(
    eventName: K,
    subscriber: ESubscriber<K, Target, Events[K]>
  ): boolean;
  /**Returns the amount of listeners on that event*/
  amount<K extends keyof Events>(eventName: K): number;
  /**Generates a proxy function which can be registered with another handlers */
  proxy_func(): ESubscriber<keyof Events, Target, Events[keyof Events]>;
}

export class EventHandler<Events extends { [key: string]: any }, Target>
  implements EventProducer<Events, Target>
{
  target: Target;
  #subscribers: {
    [K in keyof Events]?: Set<ESubscriber<K, Target, Events[K]>>;
  } = {};
  #proxies?: Set<ESubscriber<keyof Events, Target, Events[keyof Events]>>;

  constructor(target: Target) {
    this.target = target;
  }

  //# Consumer
  on<K extends keyof Events>(
    eventName: K,
    subscriber: ESubscriber<K, Target, Events[K]>
  ): typeof subscriber {
    const typeListeners = this.#subscribers[eventName];
    if (typeListeners) {
      if (typeListeners.has(subscriber))
        console.error("Subscriber already in handler");
      else typeListeners.add(subscriber);
    } else this.#subscribers[eventName] = new Set([subscriber]);
    return subscriber;
  }

  off<K extends keyof Events>(
    eventName: K,
    subscriber: ESubscriber<K, Target, Events[K]>
  ) {
    if (this.#subscribers[eventName]?.delete(subscriber) === false)
      console.error("Subscriber not in handler");
    return subscriber;
  }

  proxy_on(
    subscriber: ESubscriber<keyof Events, Target, Events[keyof Events]>
  ): typeof subscriber {
    if (!this.#proxies) this.#proxies = new Set([subscriber]);
    else if (!this.#proxies.has(subscriber)) this.#proxies.add(subscriber);
    else console.error("Proxy subscriber already registered");
    return subscriber;
  }

  proxy_off(
    subscriber: ESubscriber<keyof Events, Target, Events[keyof Events]>
  ): typeof subscriber {
    if (this.#proxies?.delete(subscriber) === false)
      console.error("Proxy subscriber not registered");
    return subscriber;
  }

  //# Producer
  get consumer(): EventConsumer<Events, Target> {
    return this;
  }

  emit<K extends keyof Events>(eventName: K, data: Events[K]) {
    const funcs = this.#subscribers[eventName];
    if (funcs?.size || this.#proxies?.size)
      this.#emitE(
        Object.freeze(
          new E<K, Target, Events[K]>(eventName, this.target, data)
        ),
        funcs as Set<ESubscriber<keyof Events, Target, Events[keyof Events]>>
      );
  }

  #emitE(
    e: E<keyof Events, Target, Events[keyof Events]>,
    funcs?: Set<ESubscriber<keyof Events, Target, Events[keyof Events]>>
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

  clear<K extends keyof Events>(eventName: K): void {
    this.#subscribers[eventName]?.clear();
  }

  in_use<K extends keyof Events>(eventName: K): boolean {
    return Boolean(this.#subscribers[eventName]?.size);
  }

  has<K extends keyof Events>(
    eventName: K,
    subscriber: ESubscriber<K, Target, Events[K]>
  ): boolean {
    return this.#subscribers[eventName]?.has(subscriber) || false;
  }

  amount<K extends keyof Events>(eventName: K): number {
    return this.#subscribers[eventName]?.size || 0;
  }

  proxy_func(): ESubscriber<keyof Events, Target, Events[keyof Events]> {
    return (e: E<keyof Events, Target, Events[keyof Events]>) => {
      const subs = this.#subscribers[e.type];
      if (subs) this.#emitE(e, subs);
    };
  }

  get producer(): EventProducer<Events, Target> {
    return this;
  }
}
