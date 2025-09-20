import {
  createEventHandler,
  type EventConsumer,
  type EventProducer,
} from "@event";
import type { StateError, StateRead, StateSubscriber } from "@state";
import { AccessTypes } from "./access";
import "./base.scss";
import { BaseObserver, type BaseObserverOptions } from "./observer";

/**Event types for base*/
export const ConnectEventVal = {
  /**When element is connected from document*/
  Connect: 0,
  /**When element is disconnected from document*/
  Disconnect: 1,
  /**When element is adopted by another document*/
  Adopted: 2,
} as const;
export type ConnectEventVal =
  (typeof ConnectEventVal)[keyof typeof ConnectEventVal];

/**Events for Base element */
export interface BaseEvents {
  connect: ConnectEventVal;
  visible: Boolean;
}

/**Base options for base class */
export interface BaseOptions {
  /**Access for element, default is write access */
  access?: AccessTypes | StateRead<AccessTypes>;
  /**Options to use for element observer */
  observerOptions?: BaseObserverOptions;
}

/**Shared class for elements to extend
 * All none abstract elements must use the defineElement function to declare itself
 *
 * All none abstracts classes must override the static method elementName to return the name of the element
 * Abstract classes should return @abstract@
 *
 * If another library defines an abstract base class, it is recommended to change the static elementNameSpace method to the name of the library
 * example for this library '@chocolatelibui/core' becomes 'chocolatelibui-core'
 * static elementNameSpace() { return 'chocolatelibui-core' }
 * This resets the nametree to the library name and prevents too long element names
 *
 * Elements have an access propery, which builds on the html inert property
 * Access has the following three states
 * write = normal interaction and look
 * read = inert attribute is added making the element uninteractable, and add opacity 0.5 to make the element look inaccessible
 * none = adds display:none to element to make it */
export abstract class Base<
  MoreEvents extends BaseEvents = BaseEvents
> extends HTMLElement {
  /**Returns the name used to define the element */
  static elementName() {
    return "@abstract@";
  }
  /**Returns the namespace override for the element*/
  static elementNameSpace() {
    return "chocolatelibui-core";
  }
  /**Events for element*/
  protected _events: EventProducer<MoreEvents, Base<MoreEvents>>;
  /**Events for element*/
  readonly events: EventConsumer<MoreEvents, Base<MoreEvents>>;

  #connectStates?: StateRead<any>[];
  #connectSubscribers?: StateSubscriber<any>[];

  /**Observer for children of this element */
  #observer?: BaseObserver;
  #observerOptions?: BaseObserverOptions;

  /**Works when element is connected to observer, otherwise it is an alias for isConnected*/
  readonly isVisible: boolean = false;
  #attachedObserver?: BaseObserver;
  #visibleStates?: StateRead<any>[];
  #visibleSubscribers?: StateSubscriber<any>[];

  #access?: AccessTypes;

  #propStates?: { [k in keyof this]: [StateSubscriber<any>, boolean] };
  #attributeStates?: { [k: string]: [StateSubscriber<any>, boolean] };

  constructor(...any: any[]) {
    any;
    super();
    let events = createEventHandler<MoreEvents, Base<MoreEvents>>(this);
    this._events = events.producer;
    this.events = events.consumer;
  }

  /**Runs when element is attached to document*/
  connectedCallback() {
    this._events.emit("connect", ConnectEventVal.Connect);
    if (this.#connectStates && this.#connectSubscribers)
      for (let i = 0; i < this.#connectStates.length; i++)
        this.#connectStates[i].subscribe(this.#connectSubscribers[i], true);
    if (this.#attachedObserver) {
      this.#attachedObserver.observe(this);
    } else {
      this._setVisible(true);
    }
  }

  /**Runs when element is dettached from document*/
  disconnectedCallback() {
    this._events.emit("connect", ConnectEventVal.Disconnect);
    if (this.#connectStates && this.#connectSubscribers)
      for (let i = 0; i < this.#connectStates.length; i++)
        this.#connectStates[i].unsubscribe(this.#connectSubscribers[i]);
    if (this.#attachedObserver) {
      this.#attachedObserver.unobserve(this);
      this._setVisible(false);
    }
  }

  /**Runs when element is attached to different document*/
  adoptedCallback() {
    this._events.emit("connect", ConnectEventVal.Adopted);
  }

  private _setVisible(is: boolean) {
    if (this.isVisible !== is) {
      //@ts-expect-error
      this.isVisible = is;
      this._events.emit("visible", is);
      if (is) {
        if (this.#visibleStates && this.#visibleSubscribers)
          for (let i = 0; i < this.#visibleStates.length; i++)
            this.#visibleStates[i].subscribe(this.#visibleSubscribers[i], true);
      } else {
        if (this.#visibleStates && this.#visibleSubscribers)
          for (let i = 0; i < this.#visibleStates.length; i++)
            this.#visibleStates[i].unsubscribe(this.#visibleSubscribers[i]);
      }
    }
  }

  /**Sets options for the element*/
  options(options: BaseOptions): this {
    if (typeof options.access === "object") {
      this.accessByState(options.access);
    } else {
      this.access = options.access ?? AccessTypes.write;
    }
    if (options.observerOptions) {
      this.#observerOptions = options.observerOptions;
    }
    return this;
  }

  /**Returns an observer for the element */
  get observer(): BaseObserver {
    return this.#observer
      ? this.#observer
      : (this.#observer = new BaseObserver(
          this.#observerOptions ?? {
            root: this,
            threshold: 0,
            defferedHidden: 1000,
          }
        ));
  }

  /**Attaches the component to an observer, which is needed for the isVisible state and event to work and for the state system to work on visible*/
  attachToObserver(observer?: BaseObserver) {
    if (observer) {
      if (this.isConnected) {
        if (this.#attachedObserver) this.#attachedObserver.unobserve(this);
        observer.observe(this);
      }
      this.#attachedObserver = observer;
    } else if (this.#attachedObserver) {
      if (this.isConnected) this.#attachedObserver.unobserve(this);
      if (!this.isVisible) this._setVisible(true);
      this.#attachedObserver = undefined;
    }
  }

  /**Attaches the component to an observer, which is needed for the isVisible state and event to work and for the state system to work on visible*/
  attachToBaseObserver(baseElement?: Base) {
    if (baseElement) {
      if (this.isConnected) {
        if (this.#attachedObserver) this.#attachedObserver.unobserve(this);
        baseElement.observer.observe(this);
      }
      this.#attachedObserver = baseElement.observer;
    } else if (this.#attachedObserver) {
      if (this.isConnected) this.#attachedObserver.unobserve(this);
      if (!this.isVisible) this._setVisible(true);
      this.#attachedObserver = undefined;
    }
  }

  /**Attaches a state to a function, so that the function is subscribed to the state when the component is connected
   * @param visible when set true the function is only subscribed when the element is visible, this requires an observer to be attached to the element*/
  attachState<T>(
    state: StateRead<T>,
    func: StateSubscriber<T>,
    visible?: boolean
  ) {
    if (visible) {
      if (!this.#visibleStates) {
        this.#visibleStates = [];
        this.#visibleSubscribers = [];
      }
      this.#visibleStates.push(state);
      this.#visibleSubscribers!.push(func);
      if (this.isVisible) state.subscribe(func, true);
      return func;
    }
    if (!this.#connectStates) {
      this.#connectStates = [];
      this.#connectSubscribers = [];
    }
    this.#connectStates.push(state);
    this.#connectSubscribers!.push(func);
    if (this.isConnected) state.subscribe(func, true);
    return func;
  }

  /**Dettaches the function from the state/component */
  dettachState(func: StateSubscriber<any>, visible?: boolean) {
    if (visible) {
      if (this.#visibleSubscribers) {
        let index = this.#visibleSubscribers.indexOf(func);
        if (index === -1) {
          console.warn("Function not registered with element", func, this);
        } else {
          if (this.isVisible) this.#visibleStates![index].unsubscribe(func);
          this.#visibleStates!.splice(index, 1);
          this.#visibleSubscribers.splice(index, 1);
        }
      }
      return;
    }
    if (this.#connectSubscribers) {
      let index = this.#connectSubscribers.indexOf(func);
      if (index === -1) {
        console.warn("Function not registered with element", func, this);
      } else {
        if (this.isVisible) this.#connectStates![index].unsubscribe(func);
        this.#connectStates!.splice(index, 1);
        this.#connectSubscribers.splice(index, 1);
      }
    }
  }

  /**Attaches a state to a property, so that the property is updated when the state changes
   * @param prop the property to attach the state to
   * @param state the state to attach to the property
   * @param visible when set true the property is only updated when the element is visible, this requires an observer to be attached to the element
   * @param fallback the fallback value for the property when the state is not ok, if undefined the property is not updated when the state is not ok
   * */
  attachStateToProp<T extends keyof this>(
    prop: T,
    state: StateRead<(typeof this)[T]>,
    visible?: boolean,
    fallback?: (typeof this)[T],
    fallbackFunc?: (error: StateError) => (typeof this)[T]
  ) {
    if (!this.#propStates)
      this.#propStates = {} as {
        [k in keyof this]: [StateSubscriber<any>, boolean];
      };
    this.dettachStateFromProp(prop);
    this.#propStates[prop] = [
      this.attachState(
        state,
        (val) => {
          if (val.ok) {
            this[prop] = val.value;
          } else if (fallbackFunc !== undefined) {
            this[prop] = fallbackFunc(val.error);
          } else if (fallback !== undefined) {
            this[prop] = fallback;
          }
        },
        visible
      ),
      Boolean(visible),
    ];
  }

  /**Dettaches the state from the property */
  dettachStateFromProp<T extends keyof this>(prop: T) {
    if (this.#propStates && prop in this.#propStates)
      this.dettachState(
        ...(this.#propStates[prop] as [
          StateSubscriber<any>,
          boolean | undefined
        ])
      );
  }

  /**Attaches a state to a property, so that the property is updated when the state changes
   * @param state the state to attach to the property
   * @param fallback the fallback value for the property when the state is not ok, if undefined the property is not updated when the state is not ok
   * @param visible when set true the property is only updated when the element is visible, this requires an observer to be attached to the element*/
  attachStateToAttribute(
    qualifiedName: string,
    state: StateRead<string>,
    visible?: boolean,
    fallback?: string,
    fallbackFunc?: (error: StateError) => string
  ) {
    if (!this.#attributeStates)
      this.#attributeStates = {} as {
        [k: string]: [StateSubscriber<any>, boolean];
      };
    this.dettachStateFromAttribute(qualifiedName);
    this.#attributeStates[qualifiedName] = [
      this.attachState(
        state,
        (val) => {
          if (val.ok) {
            this.setAttribute(qualifiedName, val.value);
          } else if (fallbackFunc) {
            this.setAttribute(qualifiedName, fallbackFunc(val.error));
          } else if (fallback !== undefined) {
            this.setAttribute(qualifiedName, fallback);
          }
        },
        visible
      ),
      Boolean(visible),
    ];
  }

  /**Dettaches the state from the property */
  dettachStateFromAttribute(qualifiedName: string) {
    if (this.#attributeStates && qualifiedName in this.#attributeStates)
      this.dettachState(
        ...(this.#attributeStates[qualifiedName] as [
          StateSubscriber<any>,
          boolean | undefined
        ])
      );
  }

  /**Sets the access of the element, passing undefined is the same as passing write access*/
  set access(access: AccessTypes) {
    this.#access = access;
    switch (access) {
      case AccessTypes.write:
        this.inert = false;
        break;
      case AccessTypes.read:
        this.inert = true;
        break;
      case AccessTypes.none:
        this.setAttribute("inert", "none");
        break;
    }
  }
  /**Returns the current access of the element */
  get access(): AccessTypes {
    return this.#access ?? AccessTypes.write;
  }
  /**Sets the access of the element, passing undefined is the same as passing write access*/
  accessByState(
    access: StateRead<AccessTypes> | undefined,
    visible?: boolean,
    fallback?: AccessTypes,
    fallbackFunc?: (error: StateError) => AccessTypes
  ) {
    if (access) {
      this.attachStateToProp("access", access, visible, fallback, fallbackFunc);
    } else {
      this.dettachStateFromProp("access");
    }
  }
}
