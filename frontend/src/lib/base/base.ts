import { EventHandler } from "@libEvent";
import { Some, type Option } from "@libResult";
import state, {
  type STATE,
  type STATE_INFER_SUB,
  type STATE_REA,
  type STATE_ROA,
  type STATE_SUB,
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

// Helpers for opts
type DataProps<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};
type WithStateROA<T> = {
  [K in keyof T]?: T[K] | STATE_ROA<T[K]>;
};

/**Shared class for elements to extend
 * All none abstract elements must use the defineElement function to declare itself
 *
 * All none abstracts classes must override the static method elementName to return the name of the element
 * Abstract classes should return @abstract@
 *
 * If another library defines an abstract base class, it is recommended to change the static elementNameSpace method to the name of the library
 * example for this library '@chocolatelibui/core' becomes 'chocolatelibui-core'
 * static element_name_space() { return 'chocolatelibui-core' }
 * This resets the nametree to the library name and prevents too long element names
 *
 * Elements have an access propery, which builds on the html inert property
 * Access has the following three states
 * write = normal interaction and look
 * read = inert attribute is added making the element uninteractable, and add opacity 0.5 to make the element look inaccessible
 * none = adds display:none to element to make it */
export abstract class Base extends HTMLElement {
  /**Returns the name used to define the element */
  static element_name() {
    return "@abstract@";
  }
  /**Returns the namespace override for the element*/
  static element_name_space() {
    return "lib";
  }
  /**Events for element*/
  #baseEvents = new EventHandler<BaseEvents, Base>(this);
  /**Events for element*/
  readonly baseEvents = this.#baseEvents.consumer;

  #states: Map<STATE_SUB<any>, [STATE<any>, boolean]> = new Map();

  #isConnected: boolean = false;

  /**Observer for children of this element */
  #observer?: BaseObserver;

  /**Works when element is connected to observer, otherwise it is an alias for isConnected*/
  readonly isVisible: boolean = false;
  #attachedObserver?: BaseObserver;

  #access?: AccessTypes;

  #props: Map<any, STATE_SUB<any>> = new Map();
  #attr: Map<string, STATE_SUB<any>> = new Map();

  /**Runs when element is attached to document*/
  protected connectedCallback() {
    this.#baseEvents.emit("connect", ConnectEventVal.Connect);
    for (const [f, [s, v]] of this.#states) {
      if (!v) s.sub(f, true);
    }
    if (this.#attachedObserver) this.#attachedObserver.observe(this);
    else this._set_visible(true);
    this.#isConnected = true;
  }

  /**Runs when element is dettached from document*/
  protected disconnectedCallback() {
    this.#baseEvents.emit("connect", ConnectEventVal.Disconnect);
    for (const [f, [s, v]] of this.#states) {
      if (!v) s.unsub(f);
    }
    if (this.#attachedObserver) {
      this.#attachedObserver.unobserve(this);
      this._set_visible(false);
    }
    this.#isConnected = false;
  }

  /**Runs when element is attached to different document*/
  protected adoptedCallback() {
    this.#baseEvents.emit("connect", ConnectEventVal.Adopted);
  }

  private _set_visible(is: boolean) {
    if (this.isVisible !== is) {
      //@ts-expect-error
      this.isVisible = is;
      this.#baseEvents.emit("visible", is);
      if (is) {
        for (const [f, [s, v]] of this.#states) if (v) s.sub(f, true);
      } else {
        for (const [f, [s, v]] of this.#states) if (v) s.unsub(f);
      }
    }
  }

  /**Sets any attribute on the base element, to either a fixed value or a state value */
  opts(opts: WithStateROA<DataProps<this>>): this {
    for (let key in opts) {
      let opt = opts[key] as this[typeof key] | STATE_ROA<this[typeof key]>;
      if (state.h.is.roa(opt)) this.attach_STATE_ROA_to_prop(key, opt);
      else this[key] = opt;
    }
    return this;
  }

  /**Returns an observer for the element */
  observer(
    options: BaseObserverOptions = {
      root: this,
      threshold: 0,
      deffered_hidden: 1000,
    }
  ): BaseObserver {
    return (this.#observer ??= new BaseObserver(options));
  }

  /**Attaches the component to an observer, which is needed for the isVisible state and event to work and for the state system to work on visible*/
  attach_to_observer(observer?: BaseObserver): this {
    if (observer) {
      if (this.#isConnected) {
        if (this.#attachedObserver) this.#attachedObserver.unobserve(this);
        observer.observe(this);
      }
      this.#attachedObserver = observer;
    } else if (this.#attachedObserver) {
      if (this.#isConnected) this.#attachedObserver.unobserve(this);
      if (!this.isVisible) this._set_visible(true);
      this.#attachedObserver = undefined;
    }
    return this;
  }

  /**Attaches a state to a function, so that the function is subscribed to the state when the component is connected
   * @param visible when set true the function is only subscribed when the element is visible, this requires an observer to be attached to the element*/
  attach_STATE<S extends STATE<any>>(
    state: S,
    func: STATE_INFER_SUB<S>,
    visible?: boolean
  ): typeof func {
    if (this.#states.has(func))
      console.error("Function already registered with element", func, this);
    else {
      this.#states.set(func, [state, Boolean(visible)]);
      if (visible ? this.isVisible : this.#isConnected)
        state.sub(func as STATE_SUB<any>, true);
    }
    return func;
  }

  /**Dettaches the function from the state/component */
  dettach_STATE(func: STATE_SUB<any>): typeof func {
    let state = this.#states.get(func);
    if (state) {
      if (state[1] ? this.isVisible : this.#isConnected) state[0].unsub(func);
      this.#states.delete(func);
    } else console.error("Function not registered with element", func, this);
    return func;
  }

  /**Attaches a state to a property, so that the property is updated when the state changes
   * @param prop the property to attach the state to
   * @param state the state to attach to the property
   * @param visible when set true the property is only updated when the element is visible, this requires an observer to be attached to the element
   * @param fallback the fallback value for the property when the state is not ok, if undefined the property is not updated when the state is not ok*/
  attach_STATE_ROA_to_prop<K extends keyof this>(
    prop: K,
    state: STATE_ROA<this[K]>,
    ok?: (val: this[K]) => Option<this[K]>,
    visible?: boolean
  ): this;
  attach_STATE_ROA_to_prop<K extends keyof this, T = this[K]>(
    prop: K,
    state: STATE_ROA<T>,
    ok: (val: T) => Option<this[K]>,
    visible?: boolean
  ): this;
  attach_STATE_ROA_to_prop<K extends keyof this, T = this[K]>(
    prop: K,
    state: STATE_ROA<T>,
    ok?: (val: T) => Option<this[K]>,
    visible?: boolean
  ): this {
    this.dettach_STATE_from_prop(prop).#props.set(
      prop,
      this.attach_STATE(
        state,
        (val) => {
          let o = ok ? ok(val.value) : Some(val.value as this[K]);
          if (o.some) this[prop] = o.value;
        },
        visible
      )
    );
    return this;
  }

  /**Attaches a state to a property, so that the property is updated when the state changes
   * @param prop the property to attach the state to
   * @param state the state to attach to the property
   * @param error function called when state gives a ResultErr,
   * @param visible when set true the property is only updated when the element is visible, this requires an observer to be attached to the element*/
  attach_STATE_to_prop<K extends keyof this>(
    prop: K,
    state: STATE_REA<this[K]>,
    error: (error: string) => Option<this[K]>,
    ok?: (val: this[K]) => Option<this[K]>,
    visible?: boolean
  ): this;
  attach_STATE_to_prop<K extends keyof this, T = this[K]>(
    prop: K,
    state: STATE_REA<T>,
    error: (error: string) => Option<this[K]>,
    ok: (val: T) => Option<this[K]>,
    visible?: boolean
  ): this;
  attach_STATE_to_prop<K extends keyof this, T = this[K]>(
    prop: K,
    state: STATE_REA<T>,
    error: (error: string) => Option<this[K]>,
    ok?: (val: T) => Option<this[K]>,
    visible?: boolean
  ): this {
    this.dettach_STATE_from_prop(prop).#props.set(
      prop,
      this.attach_STATE(
        state,
        (v) => {
          let o = v.ok
            ? ok
              ? ok(v.value)
              : Some(v.value as this[K])
            : error(v.error);
          if (o.some) this[prop] = o.value;
        },
        visible
      )
    );
    return this;
  }

  /**Dettaches the state from the property */
  dettach_STATE_from_prop<T extends keyof this>(prop: T): this {
    let pro = this.#props.get(prop);
    if (pro) this.dettach_STATE(pro);
    return this;
  }

  attach_STATE_ROA_to_attribute(
    qualifiedName: string,
    state: STATE_ROA<string>,
    ok?: (val: string) => Option<string>,
    visible?: boolean
  ): this;
  attach_STATE_ROA_to_attribute<U>(
    qualifiedName: string,
    state: STATE_ROA<U>,
    ok: (val: U) => Option<string>,
    visible?: boolean
  ): this;
  attach_STATE_ROA_to_attribute<U>(
    qualifiedName: string,
    state: STATE_ROA<U>,
    ok?: (val: U) => Option<string>,
    visible?: boolean
  ): this {
    this.dettach_STATE_from_attribute(qualifiedName).#attr.set(
      qualifiedName,
      this.attach_STATE(
        state,
        (val) => {
          let o = ok ? ok(val.value) : Some(val.value as string);
          if (o.some) this.setAttribute(qualifiedName, o.value);
        },
        visible
      )
    );
    return this;
  }

  attach_STATE_to_attribute(
    qualifiedName: string,
    state: STATE_REA<string>,
    error: (error: string) => Option<string>,
    ok?: (val: string) => Option<string>,
    visible?: boolean
  ): this;
  attach_STATE_to_attribute<U>(
    qualifiedName: string,
    state: STATE_REA<U>,
    error: (error: string) => Option<string>,
    ok: (val: U) => Option<string>,
    visible?: boolean
  ): this;
  attach_STATE_to_attribute<U>(
    qualifiedName: string,
    state: STATE_REA<U>,
    error: (error: string) => Option<string>,
    ok?: (val: U) => Option<string>,
    visible?: boolean
  ): this {
    this.dettach_STATE_from_attribute(qualifiedName).#attr.set(
      qualifiedName,
      this.attach_STATE(
        state,
        (v) => {
          let o = v.ok
            ? ok
              ? ok(v.value)
              : Some(v.value as string)
            : error(v.error);
          if (o.some) this.setAttribute(qualifiedName, o.value);
        },
        visible
      )
    );
    return this;
  }

  /**Dettaches the state from the property */
  dettach_STATE_from_attribute(qualifiedName: string): this {
    let pro = this.#attr.get(qualifiedName);
    if (pro) this.dettach_STATE(pro);
    return this;
  }

  /**Sets the access of the element, passing undefined is the same as passing write access*/
  set access(access: AccessTypes) {
    this.#access = access;
    switch (access) {
      case AccessTypes.Write:
        this.inert = false;
        break;
      case AccessTypes.Read:
        this.inert = true;
        break;
      case AccessTypes.None:
        this.setAttribute("inert", "none");
        break;
    }
  }

  /**Overrideable function called when access is changed */
  protected on_access(_access: AccessTypes) {}

  /**Returns the current access of the element */
  get access(): AccessTypes {
    return this.#access ?? AccessTypes.Write;
  }
}
