import { EventHandler } from "@libEvent";
import { Ok, type Result } from "@libResult";
import state, {
  type STATE,
  type STATE_INFER_TYPE,
  type STATE_ROX,
  type STATE_SUB,
  type STATE_SUB_OK,
} from "@libState";
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
  access?: AccessTypes | STATE<AccessTypes>;
  /**Options to use for element observer */
  observerOptions?: BaseObserverOptions;
}

// Helpers for opts
type DataProps<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};
type WithStateROX<T> = {
  [K in keyof T]?: T[K] | STATE_ROX<T[K]>;
};

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
  Options extends BaseOptions = BaseOptions
> extends HTMLElement {
  /**Returns the name used to define the element */
  static elementName() {
    return "@abstract@";
  }
  /**Returns the namespace override for the element*/
  static elementNameSpace() {
    return "lib";
  }
  /**Events for element*/
  #baseEvents = new EventHandler<BaseEvents, Base>(this);
  /**Events for element*/
  readonly baseEvents = this.#baseEvents.consumer;

  #isConnected: boolean = false;
  #connects: Map<STATE_SUB<any> & STATE_SUB_OK<any>, STATE<any>> = new Map();

  /**Observer for children of this element */
  #observer?: BaseObserver;
  #observerOptions?: BaseObserverOptions;

  /**Works when element is connected to observer, otherwise it is an alias for isConnected*/
  readonly isVisible: boolean = false;
  #attachedObserver?: BaseObserver;
  #visibles: Map<STATE_SUB<any> & STATE_SUB_OK<any>, STATE<any>> = new Map();

  #access?: AccessTypes;

  #props: Map<keyof this, [STATE_SUB_OK<any>, boolean]> = new Map();
  #attributes: Map<string, [STATE_SUB_OK<any>, boolean]> = new Map();

  /**Runs when element is attached to document*/
  protected connectedCallback() {
    this.#baseEvents.emit("connect", ConnectEventVal.Connect);
    for (const [f, s] of this.#connects) s.subscribe(f, true);
    if (this.#attachedObserver) this.#attachedObserver.observe(this);
    else this._setVisible(true);
    this.#isConnected = true;
  }

  /**Runs when element is dettached from document*/
  protected disconnectedCallback() {
    this.#baseEvents.emit("connect", ConnectEventVal.Disconnect);
    for (const [f, s] of this.#connects) s.unsubscribe(f);
    if (this.#attachedObserver) {
      this.#attachedObserver.unobserve(this);
      this._setVisible(false);
    }
    this.#isConnected = false;
  }

  /**Runs when element is attached to different document*/
  protected adoptedCallback() {
    this.#baseEvents.emit("connect", ConnectEventVal.Adopted);
  }

  private _setVisible(is: boolean) {
    if (this.isVisible !== is) {
      //@ts-expect-error
      this.isVisible = is;
      this.#baseEvents.emit("visible", is);
      if (is) for (const [f, s] of this.#visibles) s.subscribe(f, true);
      else for (const [f, s] of this.#visibles) s.unsubscribe(f);
    }
  }

  /**Sets options for the element*/
  options(options: Options): this {
    if (typeof options.access === "object") this.accessByState(options.access);
    else this.access = options.access ?? AccessTypes.WRITE;
    if (options.observerOptions)
      this.#observerOptions = options.observerOptions;
    return this;
  }

  /**Sets any attribute on the base element, to either a fixed value or a state value */
  opts(opts: WithStateROX<DataProps<this>>): this {
    for (let key in opts) {
      let opt = opts[key];
      if (state.h.is.rox(opt)) this.attachSTATEROXToProp(key, opt);
      else this[key] = opt as any;
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
  attachToObserver(observer?: BaseObserver): this {
    if (observer) {
      if (this.#isConnected) {
        if (this.#attachedObserver) this.#attachedObserver.unobserve(this);
        observer.observe(this);
      }
      this.#attachedObserver = observer;
    } else if (this.#attachedObserver) {
      if (this.#isConnected) this.#attachedObserver.unobserve(this);
      if (!this.isVisible) this._setVisible(true);
      this.#attachedObserver = undefined;
    }
    return this;
  }

  /**Attaches the component to an observer, which is needed for the isVisible state and event to work and for the state system to work on visible*/
  attachToBaseObserver(baseElement?: Base): this {
    if (baseElement) {
      if (this.#isConnected) {
        if (this.#attachedObserver) this.#attachedObserver.unobserve(this);
        baseElement.observer.observe(this);
      }
      this.#attachedObserver = baseElement.observer;
    } else if (this.#attachedObserver) {
      if (this.#isConnected) this.#attachedObserver.unobserve(this);
      if (!this.isVisible) this._setVisible(true);
      this.#attachedObserver = undefined;
    }
    return this;
  }

  /**Attaches a state to a function, so that the function is subscribed to the state when the component is connected
   * @param visible when set true the function is only subscribed when the element is visible, this requires an observer to be attached to the element*/
  attachSTATEROX<S extends STATE_ROX<any>>(
    state: S,
    func: STATE_SUB_OK<STATE_INFER_TYPE<S>>,
    visible?: boolean
  ): typeof func {
    return this.attachSTATE(
      state,
      func as STATE_SUB<any>,
      visible
    ) as typeof func;
  }

  /**Attaches a state to a function, so that the function is subscribed to the state when the component is connected
   * @param visible when set true the function is only subscribed when the element is visible, this requires an observer to be attached to the element*/
  attachSTATE<S extends STATE<any>>(
    state: S,
    func: STATE_SUB<STATE_INFER_TYPE<S>>,
    visible?: boolean
  ): typeof func {
    if (visible) {
      this.#visibles.set(func, state);
      if (this.isVisible) state.subscribe(func, true);
      return func;
    }
    this.#connects.set(func, state);
    if (this.#isConnected) state.subscribe(func, true);
    return func;
  }

  /**Dettaches the function from the state/component */
  dettachState(func: STATE_SUB<any>, visible?: boolean) {
    if (visible) {
      if (this.#visibles.has(func)) {
        console.warn("Function not registered with element", func, this);
      } else {
        if (this.isVisible) this.#visibles.get(func)!.unsubscribe(func);
        this.#visibles.delete(func);
      }
      return;
    }
    if (this.#connects.has(func)) {
      console.warn("Function not registered with element", func, this);
    } else {
      if (this.isVisible) this.#connects.get(func)!.unsubscribe(func);
      this.#connects.delete(func);
    }
  }

  /**Attaches a state to a property, so that the property is updated when the state changes
   * @param prop the property to attach the state to
   * @param state the state to attach to the property
   * @param visible when set true the property is only updated when the element is visible, this requires an observer to be attached to the element*/
  attachSTATEROXToProp<T extends keyof this>(
    prop: T,
    state: STATE_ROX<this[T]>,
    visible?: boolean
  ): this {
    this.dettachStateFromProp(prop);
    this.#props.set(prop, [
      this.attachSTATEROX(state, (val) => (this[prop] = val.value), visible),
      Boolean(visible),
    ]);
    return this;
  }
  /**Attaches a state to a property, so that the property is updated when the state changes
   * @param prop the property to attach the state to
   * @param state the state to attach to the property
   * @param visible when set true the property is only updated when the element is visible, this requires an observer to be attached to the element*/
  attachSTATEROXToPropTransform<T extends keyof this, S extends STATE_ROX<any>>(
    prop: T,
    state: S,
    transform: (val: STATE_INFER_TYPE<S>) => this[T],
    visible?: boolean
  ): this {
    this.dettachStateFromProp(prop);
    this.#props.set(prop, [
      this.attachSTATEROX(
        state,
        (val) => (this[prop] = transform(val.value)),
        visible
      ),
      Boolean(visible),
    ]);
    return this;
  }

  /**Attaches a state to a property, so that the property is updated when the state changes
   * @param prop the property to attach the state to
   * @param state the state to attach to the property
   * @param visible when set true the property is only updated when the element is visible, this requires an observer to be attached to the element
   * @param fallback the fallback value for the property when the state is not ok, if undefined the property is not updated when the state is not ok*/
  attachSTATEToProp<T extends keyof this>(
    prop: T,
    state: STATE<this[T]>,
    fallback: (error: string) => this[T],
    visible?: boolean
  ): this {
    this.dettachStateFromProp(prop);
    this.#props.set(prop, [
      this.attachSTATE(
        state,
        (val) => (this[prop] = val.orElse((e) => Ok(fallback(e))).value),
        visible
      ),
      Boolean(visible),
    ]);
    return this;
  }

  /**Attaches a state to a property, so that the property is updated when the state changes
   * @param prop the property to attach the state to
   * @param state the state to attach to the property
   * @param visible when set true the property is only updated when the element is visible, this requires an observer to be attached to the element
   * @param fallback the fallback value for the property when the state is not ok, if undefined the property is not updated when the state is not ok*/
  attachStateToPropTransform<T extends keyof this, S extends STATE<any>>(
    prop: T,
    state: S,
    transform: (
      val: Result<STATE_INFER_TYPE<S>, string>
    ) => Result<(typeof this)[T], string>,
    fallback: (error: string) => (typeof this)[T],
    visible?: boolean
  ): this {
    this.dettachStateFromProp(prop);
    this.#props.set(prop, [
      this.attachSTATE(
        state,
        (val) =>
          (this[prop] = transform(val).orElse((e) => Ok(fallback(e))).value),
        visible
      ),
      Boolean(visible),
    ]);
    return this;
  }

  /**Dettaches the state from the property */
  dettachStateFromProp<T extends keyof this>(prop: T): this {
    let pro = this.#props.get(prop);
    if (pro) this.dettachState(pro[0], pro[1]);
    return this;
  }

  /**Attaches a state to an html attribute, so that the atrribute is updated when the state changes
   * @param state the state to attach to the property
   * @param fallback the fallback value for the property when the state is not ok, if undefined the property is not updated when the state is not ok
   * @param visible when set true the property is only updated when the element is visible, this requires an observer to be attached to the element*/
  attachSTATEROXToAttribute(
    qualifiedName: string,
    state: STATE_ROX<string>,
    visible?: boolean
  ): this {
    this.dettachStateFromAttribute(qualifiedName);
    this.#attributes[qualifiedName] = [
      this.attachState(
        state,
        (val) => this.setAttribute(qualifiedName, val.value),
        visible
      ),
      Boolean(visible),
    ];
    return this;
  }

  attachStateToAttribute(
    qualifiedName: string,
    state: StateRead<string>,
    visible?: boolean,
    fallback?: string,
    fallbackFunc?: (error: string) => string
  ): this {
    if (!this.#attributes)
      this.#attributes = {} as {
        [k: string]: [StateSubscriber<any>, boolean];
      };
    this.dettachStateFromAttribute(qualifiedName);
    this.#attributes[qualifiedName] = [
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
    return this;
  }

  /**Attaches a state to a property, so that the property is updated when the state changes
   * @param state the state to attach to the property
   * @param fallback the fallback value for the property when the state is not ok, if undefined the property is not updated when the state is not ok
   * @param visible when set true the property is only updated when the element is visible, this requires an observer to be attached to the element*/
  attachStateToAttributeTransform<U extends Result<any, string>>(
    qualifiedName: string,
    state: STATE<U, any, any>,
    transform: (val: U) => Result<string, string>,
    visible?: boolean,
    fallback?: string,
    fallbackFunc?: (error: string) => string
  ): this {
    if (!this.#attributes)
      this.#attributes = {} as {
        [k: string]: [STATE_SUB<any>, boolean];
      };
    this.dettachStateFromAttribute(qualifiedName);
    this.#attributes[qualifiedName] = [
      this.attachState(
        state,
        (val) => {
          let transformed = transform(val);
          if (transformed.ok) {
            this.setAttribute(qualifiedName, transformed.value);
          } else if (fallbackFunc) {
            this.setAttribute(qualifiedName, fallbackFunc(transformed.error));
          } else if (fallback !== undefined) {
            this.setAttribute(qualifiedName, fallback);
          }
        },
        visible
      ),
      Boolean(visible),
    ];
    return this;
  }

  /**Dettaches the state from the property */
  dettachStateFromAttribute(qualifiedName: string): this {
    if (this.#attributes && qualifiedName in this.#attributes)
      this.dettachState(
        ...(this.#attributes[qualifiedName] as [
          STATE_SUB<any>,
          boolean | undefined
        ])
      );
    return this;
  }

  /**Sets the access of the element, passing undefined is the same as passing write access*/
  set access(access: AccessTypes) {
    this.#access = access;
    switch (access) {
      case AccessTypes.WRITE:
        this.inert = false;
        break;
      case AccessTypes.READ:
        this.inert = true;
        break;
      case AccessTypes.NONE:
        this.setAttribute("inert", "none");
        break;
    }
  }

  /**Overrideable function for additional access */
  protected __onAccess(_access: AccessTypes) {}

  /**Returns the current access of the element */
  get access(): AccessTypes {
    return this.#access ?? AccessTypes.WRITE;
  }
  /**Sets the access of the element, passing undefined is the same as passing write access*/
  accessByState(
    access: STATE<AccessTypes> | AccessTypes | undefined,
    visible?: boolean,
    fallback?: AccessTypes,
    fallbackFunc?: (error: string) => AccessTypes
  ): this {
    if (typeof access === "object")
      this.attachStateToProp("access", access, visible, fallback, fallbackFunc);
    else if (typeof access === "object") this.access = access;
    else this.dettachStateFromProp("access");
    return this;
  }
}

let test: Base = {} as any; //
test.attachSTATEREX(state.s.ros.ok(5), (val) => {});

test.attachStateToProp("innerHTML", state.s.res.ok("5"));
