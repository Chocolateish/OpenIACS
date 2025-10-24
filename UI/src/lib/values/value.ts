export type ValueType = any;
/**The function type for value limiting*/
export type ValueLimiter = (value: ValueType, self: Value) => ValueType;
/**The function type for value listeners*/
export type ValueListener = (value: ValueType, self: Value) => void;

/**The value class is a container for a value which can have events listeners registered*/
export class Value {
  protected ___value: ValueType;
  protected ___valueListeners?: ValueListener[];
  protected __limiter?: ValueLimiter;

  /**The initial value can be passed at creation
   * @param  init
   * @param  limiter function to limit setting the value
   * @param  throttle throttle to prevent too many orders for values value describes how many milliseconds are between updates*/
  constructor(init: ValueType, limiter?: ValueLimiter, throttle?: number) {
    if (limiter) {
      if (typeof limiter === "function") {
        this.__limiter = limiter;
        this.limiter = limiter;
      } else console.warn("Limiter must be function");
    }
    if (typeof init !== "undefined") this.___value = init;
    if (throttle) this.throttle = throttle;
  }

  /** Limits the given value by the Value objects limiter*/
  limiter(value: ValueType, _self: Value): ValueType {
    return value;
  }

  /**This adds a function as an event listener to the value*/
  addListener(func: ValueListener, run?: boolean) {
    if (!this.___valueListeners) {
      this.___valueListeners = [];
      this.__onListenerCaller(true);
    }
    if (run) {
      let val = this.get;
      if (val instanceof Promise) val.then((value) => func(value, this));
      else func(val, this);
    }
    this.___valueListeners.push(func);
    return func;
  }

  /**This removes a function as an event listener from the value*/
  removeListener(func: ValueListener): ValueListener {
    if (this.___valueListeners) {
      let index = this.___valueListeners.indexOf(func);
      if (index != -1) this.___valueListeners.splice(index, 1);
      if (this.___valueListeners.length == 0) {
        this.__onListenerCaller(false);
        delete this.___valueListeners;
      }
    }
    return func;
  }

  /** This get the curent value */
  get get(): ValueType | Promise<ValueType> {
    return this.___value;
  }

  /** This sets the value and dispatches an event*/
  set set(val: ValueType) {
    if (this.___value !== val) {
      if (this.__limiter) {
        val = this.__limiter(val, this);
        if (this.___value === val || val === undefined) return;
      }
      this.___value = val;
      this.update();
    }
  }

  /** Allows for plus equal and minum equals and those types of tricks*/
  get set(): ValueType {
    return this.get;
  }

  /**Changes the setter to be throtteled*/
  set throttle(thr: number | undefined) {
    if (typeof thr === "number" && thr > 0) {
      Object.defineProperty(this, "set", {
        set(val) {
          if (this.___valueBuff !== val) {
            if (this.__limiter) {
              val = this.__limiter(val, this);
              if (this.___valueBuff === val || val === undefined) return;
            }
            this.___valueBuff = val;
          }
          if (!this.___throttle) {
            this.___value = this.___valueBuff;
            this.update();
            this.___throttle = setInterval(() => {
              if (this.___value != this.___valueBuff) {
                this.___value = this.___valueBuff;
                this.update();
              } else {
                this.___valueBuff = undefined;
                clearInterval(this.___throttle);
                this.___throttle = 0;
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
          if (this.___value !== val) {
            if (this.__limiter) {
              val = this.__limiter(val, this);
              if (this.___value === val || val === undefined) return;
            }
            this.___value = val;
            this.update();
          }
        },
        get() {
          return this.get;
        },
      });
    }
  }

  /** This sends an update without changing the value, can be used for more complex values*/
  update() {
    if (this.___valueListeners)
      for (let i = 0, m = this.___valueListeners.length; i < m; i++)
        try {
          this.___valueListeners[i](this.___value, this);
        } catch (e) {
          console.warn("Failed while calling value listeners ", e);
        }
  }

  /** This method can compare a value to the internal value
   * @returns  true if different, false if same*/
  compare(val: ValueType): boolean {
    return val != this.___value;
  }

  /**Provides support for object equals common function*/
  objectEquals(val: ValueType): boolean {
    return !this.compare(val);
  }

  //############################################################################
  //Management
  /**Overwrite this function to listen to managment events such as when value and unit listeners are added
   * @param  type is true on first listener and false on last listener*/
  onListener(_type: boolean, _self: Value) {}

  /**Caller for onListener function*/
  __onListenerCaller(type: boolean) {
    try {
      this.onListener(type, this);
    } catch (e) {
      console.warn("Failed while calling on listener for " + type, e);
    }
  }

  /** Returns wether the value has listeners */
  get hasListener(): boolean {
    return Boolean(this.___valueListeners?.length);
  }
}

//##################################################################################
//#    _____                        ################################################
//#   |  __ \                       ################################################
//#   | |__) | __ _____  ___   _    ################################################
//#   |  ___/ '__/ _ \ \/ / | | |   ################################################
//#   | |   | | | (_) >  <| |_| |   ################################################
//#   |_|   |_|  \___/_/\_\\__, |   ################################################
//#                         __/ |   ################################################
//#                        |___/    ################################################
//##################################################################################

/**Defines the base mapper function type*/
export type MapperFunction = (value: any) => any;

/**Defines a proxy value which can be used to quickly pointe multiple value listeners to another value*/
export class ValueProxy extends Value {
  /**
   * @param value value to proxy
   * @param readMapper mapper function to change original value for users of the proxy
   * @param writeMapper mapper function to change values set on the proxy before relaying them to the original*/
  constructor(
    value?: Value,
    readMapper?: MapperFunction,
    writeMapper?: MapperFunction
  ) {
    super(undefined, undefined);
    // @ts-expect-error
    this.___constructor(value, readMapper, writeMapper);
  }

  /**Changes the value the proxy points to*/
  set proxy(_proxy: Value) {}

  /**Returns the value this proxies*/
  get proxy(): Value {
    return undefined as any;
  }

  /**Sets the mapper function of the proxy value for reading values*/
  set mapperRead(_map: MapperFunction) {}

  /**Returns the currently set mapper function for reading values*/
  get mapperRead(): MapperFunction {
    return undefined as any;
  }

  /**Sets the mapper function of the proxy value for reading values*/
  set mapperWrite(_map: MapperFunction) {}

  /**Returns the currently set mapper function for reading values*/
  get mapperWrite(): MapperFunction {
    return undefined as any;
  }

  /**Generates the listener which is passed to the proxys point*/
  protected ___generateFunc(): ValueListener {
    return undefined as any;
  }

  /**This adds a function as an event listener to the value*/
  addListener(func: ValueListener, _run: boolean): ValueListener {
    return func;
  }

  /**This removes a function as an event listener from the value*/
  removeListener(func: ValueListener): ValueListener {
    return func;
  }

  /** This method prematurely disconnects the proxy access from the access it is connected to*/
  cleanUp() {}

  /** This gets the curent access type*/
  get get(): ValueType | Promise<ValueType> {
    return undefined as any;
  }

  /** This sets the value and dispatches an event*/
  set set(_val: ValueType) {}

  /** This method can compare a value to the internal value
   * true if different, false if same*/
  compare(_val: ValueType) {
    return false;
  }
}

/** This function adapts the given value sub class to a proxy class
 * @param Proxy the proxy class to create/populate
 * @param Extends the original Value class the proxy proxies, used for type checks*/
export let valueProxyCreator = <T extends typeof Value>(
  Proxy: T,
  Extends: typeof Value
) => {
  /**
   * @param proxy value to proxy
   * @param readMapper mapper function to change original value for users of the proxy
   * @param writeMapper mapper function to change values set on the proxy before relaying them to the original*/
  // @ts-expect-error
  Proxy.prototype.___constructor = function (
    proxy: Value,
    readMapper: MapperFunction,
    writeMapper: MapperFunction
  ) {
    if (proxy) {
      // @ts-expect-error
      this.proxy = proxy;
    }
    if (readMapper) {
      // @ts-expect-error
      this.mapperRead = readMapper;
    }
    if (writeMapper) {
      // @ts-expect-error
      this.mapperWrite = writeMapper;
    }
  };

  Object.defineProperties(Proxy.prototype, {
    proxy: {
      /**Changes the value the proxy points to
       * @param {Value} proxy */
      set(proxy) {
        if (proxy instanceof Extends) {
          if (this.___listener) {
            if (this.___proxy) {
              this.___proxy.removeListener(this.___listener);
            }
            this.___listener = proxy.addListener(this.___generateFunc(), false);
            this.___listener(proxy.get, this);
          }
          /**
           * @type {Value}
           * @protected */
          this.___proxy = proxy;
        } else {
          console.warn("None Value passed");
        }
      },
      get() {
        return this.___proxy;
      },
    },
    mapperRead: {
      set(map) {
        if (typeof map === "function") {
          this.___mapperRead = map;
        } else {
          console.warn("Mapper must be function");
        }
      },
      get() {
        return this.___mapperRead;
      },
    },
    mapperWrite: {
      set(map) {
        if (typeof map === "function") {
          this.___mapperWrite = map;
        } else {
          console.warn("Mapper must be function");
        }
      },
      get() {
        return this.___mapperWrite;
      },
    },
    get: {
      get() {
        if (this.___proxy) {
          if (this.___mapperRead) {
            let val = this.___proxy.get;
            if (val instanceof Promise) {
              return (async () => {
                return this.___mapperRead(await val);
              })();
            } else {
              return this.___mapperRead(val);
            }
          } else {
            return this.___proxy.get;
          }
        }
      },
    },
    set: {
      set(val) {
        if (this.___proxy) {
          if (this.___mapperWrite) {
            this.___proxy.set = this.___mapperWrite(val);
          } else {
            this.___proxy.set = val;
          }
        }
      },
    },
  });

  /**Generates the listener which is passed to the proxys point*/
  // @ts-expect-error
  Proxy.prototype.___generateFunc = function (): ValueListener {
    return (val: ValueType, _self: Value) => {
      // @ts-expect-error
      if (this.___mapperRead) {
        // @ts-expect-error
        val = this.___mapperRead(val);
      }
      // @ts-expect-error
      if (this.___skip) {
        // @ts-expect-error
        for (let i = 0, m = this.___valueListeners.length; i < m; i++) {
          // @ts-expect-error
          if (this.___valueListeners[i] !== this.___skip) {
            try {
              // @ts-expect-error
              this.___valueListeners[i](val, this);
            } catch (e) {
              console.warn("Failed while calling value listeners ", e);
            }
          }
        }
        // @ts-expect-error
        delete this.___skip;
      } else {
        // @ts-expect-error
        for (let i = 0, m = this.___valueListeners.length; i < m; i++) {
          try {
            // @ts-expect-error
            this.___valueListeners[i](val, this);
          } catch (e) {
            console.warn("Failed while calling value listeners ", e);
          }
        }
      }
    };
  };

  /**This adds a function as an event listener to the value*/
  Proxy.prototype.addListener = function (
    func: ValueListener,
    run: boolean
  ): ValueListener {
    if (typeof func == "function") {
      // @ts-ignore
      if (!this.___valueListeners) {
        // @ts-ignore
        this.___valueListeners = [];
        // @ts-expect-error
        this.___listener = this.___generateFunc();
        // @ts-expect-error
        if (this.___proxy) {
          // @ts-expect-error
          this.___proxy.addListener(this.___listener, false);
        }
      }
      // @ts-ignore
      this.___valueListeners.push(func);
      // @ts-expect-error
      if (this.___proxy && run) {
        try {
          func(this.get, this);
        } catch (e) {
          console.warn("Failed while calling value listeners ", e);
        }
      }
      return func;
    } else {
      console.warn("Listener must be function");
      return func;
    }
  };

  /**This removes a function as an event listener from the value*/
  Proxy.prototype.removeListener = function (
    func: ValueListener
  ): ValueListener {
    if (typeof func == "function") {
      // @ts-expect-error
      let index = this.___valueListeners.indexOf(func);
      if (index != -1) {
        // @ts-expect-error
        this.___valueListeners.splice(index, 1);
      }
      // @ts-expect-error
      if (this.___proxy && this.___valueListeners.length == 0) {
        // @ts-expect-error
        this.___proxy.removeListener(this.___listener);
        // @ts-expect-error
        delete this.___listener;
        // @ts-ignore
        delete this.___valueListeners;
      }
    }
    return func;
  };

  /** This method prematurely disconnects the proxy access from the access it is connected to*/
  // @ts-expect-error
  Proxy.prototype.cleanUp = function () {
    // @ts-expect-error
    if (this.___listener) {
      // @ts-expect-error
      if (this.___proxy) {
        // @ts-expect-error
        this.___proxy.removeListener(this.___listener);
        // @ts-expect-error
        delete this.___proxy;
      }
      // @ts-expect-error
      delete this.___listener;
      // @ts-ignore
      delete this.___valueListeners;
    }
  };

  /** This method can compare a value to the internal value
   * @param {ValueType} val
   * @returns {boolean} true if different, false if same*/
  Proxy.prototype.compare = function (val) {
    return val != this.get;
  };
};
// @ts-expect-error
valueProxyCreator(ValueProxy, Value);
