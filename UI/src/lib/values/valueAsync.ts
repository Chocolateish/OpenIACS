import {
  Value,
  type ValueLimiter,
  type ValueListener,
  type ValueType,
} from "./value";

//##################################################################################
//#              _______     ___   _  _____    #####################################
//#       /\    / ____\ \   / / \ | |/ ____|   #####################################
//#      /  \  | (___  \ \_/ /|  \| | |        #####################################
//#     / /\ \  \___ \  \   / | . ` | |        #####################################
//#    / ____ \ ____) |  | |  | |\  | |____    #####################################
//#   /_/    \_\_____/   |_|  |_| \_|\_____|   #####################################
//##################################################################################
//Base class for making async values for communicating with remote values
//__getSingleValue must be overwritten to retrive
export class ValueAsync extends Value {
  /**The initial value can be passed at creation
   * @param limiter function to limit setting the value
   * @param throttle throttle to prevent too many orders for values value describes how many milliseconds are between updates*/
  constructor(limiter?: ValueLimiter, throttle?: number) {
    super(undefined, limiter);
    if (limiter) {
      if (typeof limiter === "function") {
        this.__limiter = limiter;
        this.limiter = limiter;
      } else {
        console.warn("Limiter must be function");
      }
    }
    if (throttle) {
      this.throttle = throttle;
    }
  }

  /**Changes the setter to be throtteled*/
  set throttle(thr: number | undefined) {
    if (typeof thr === "number" && thr > 0) {
      Object.defineProperty(this, "set", {
        set(val) {
          this.___valueBuff = val;
          if (!this.___throttle) {
            this.__setValueAsync(val);
            this.___throttle = setTimeout(() => {
              this.___throttle = 0;
              if (this.___valueBuff != val) {
                this.set = this.___valueBuff;
              }
            }, thr);
          }
        },
        get() {
          return this.get;
        },
      });
    } else {
      Object.defineProperty(this, "set", {
        set(val) {
          this.__setValueAsync(val);
        },
        get() {
          return this.get;
        },
      });
    }
  }

  /** This get the curent value*/
  get get(): ValueType | Promise<ValueType> {
    //@ts-expect-error
    if (this.___hasValue) {
      return this.___value;
    } else {
      return new Promise((a) => {
        //@ts-expect-error
        if (!this.___asyncListeners) {
          /**This stores all async listeners
           * @type {[ValueListener]}
           * @private*/
          //@ts-expect-error
          this.___asyncListeners = [];
          if (!this.___valueListeners) {
            this.__getValueAsync();
          }
        }
        //@ts-expect-error
        this.___asyncListeners.push(a);
      });
    }
  }

  /** Used when local resources sets the value
   * @param val */
  set set(val: ValueType) {
    this.__setValueAsync(val);
  }

  /** Used when async value is retrieved from server
   * @param val*/
  set setAsync(val: ValueType) {
    this.___value = val;
    //@ts-expect-error
    if (this.___asyncListeners) {
      //@ts-expect-error

      for (let i = 0; i < this.___asyncListeners.length; i++) {
        //@ts-expect-error
        this.___asyncListeners[i](val);
      }
      //@ts-expect-error
      delete this.___asyncListeners;
    }
    if (this.hasListener) {
      //@ts-expect-error
      this.___hasValue = true;
      this.update();
    }
  }

  /**This is called when the getter is used
   * @param val */
  __setValueAsync(_val: ValueType) {}

  /**This is called when the getter is used*/
  __getValueAsync() {}

  /**This removes a function as an event listener from the value*/
  removeListener(func: ValueListener): ValueListener {
    if (typeof func == "function") {
      if (this.___valueListeners) {
        let index = this.___valueListeners.indexOf(func);
        if (index != -1) {
          this.___valueListeners.splice(index, 1);
        }
        if (this.___valueListeners.length == 0) {
          //@ts-expect-error
          this.___hasValue = false;
          this.__onListenerCaller(false);
          delete this.___valueListeners;
        }
      }
    } else {
      console.warn("Listener must be function");
    }
    return func;
  }
}
