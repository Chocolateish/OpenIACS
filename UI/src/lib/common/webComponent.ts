import { Base, type BaseOptions } from "@libBase";
import { Value } from "@libValues";

/** Available snaps for windows*/
export const WebComponentSide = {
  LEFT: 0,
  TOP: 1,
  RIGHT: 2,
  BOTTOM: 3,
} as const;
export type WebComponentSide =
  (typeof WebComponentSide)[keyof typeof WebComponentSide];

/** Available snaps for windows*/
export const WebComponentAlign = {
  START: 0,
  CENTER: 1,
  END: 2,
} as const;
export type WebComponentAlign =
  (typeof WebComponentAlign)[keyof typeof WebComponentAlign];

/**Function for listening for connection */
export type ConnectListener = (connect: boolean, self: WebComponent) => void;

/**Shared class for elements to extend*/
export abstract class WebComponent<
  Options extends BaseOptions = BaseOptions
> extends Base<Options> {
  $connects?: ((connected: boolean, self: WebComponent) => void)[];
  $connectObserver?: IntersectionObserver;
  $observerConnects?: ConnectListener[];
  isIntersecting?: boolean;

  /**Returns the name used to define the element */
  static elementName() {
    return "@abstract@";
  }

  /**Runs when instrument is attached to document*/
  protected connectedCallback() {
    if (this.$connects) {
      for (let i = 0; i < this.$connects.length; i++) {
        this.$connects[i](true, this);
      }
    }
  }

  /**Runs when instrument is dettached to document*/
  protected disconnectedCallback() {
    if (this.$connects) {
      for (let i = 0; i < this.$connects.length; i++) {
        this.$connects[i](false, this);
      }
    }
  }

  /**This changes the web component to only call its connect functions when an observer observs it*/
  attachConnectToObserver(observer: IntersectionObserver) {
    if (observer instanceof IntersectionObserver) {
      this.$connectObserver = observer;
      this.$observerConnects = this.$connects || [];
      this.isIntersecting = false;
      if (this.isConnected) {
        observer.observe(this);
        for (let i = 0; i < this.$connects!.length; i++) {
          this.$connects![i](false, this);
        }
      }
      this.$connects = [
        (val) => {
          if (val) {
            observer.observe(this);
          } else {
            observer.unobserve(this);
            if (this.isIntersecting) {
              for (let i = 0; i < this.$observerConnects!.length; i++) {
                this.$observerConnects![i](false, this);
              }
            }
          }
        },
      ];
    } else {
      if (this.$connectObserver) {
        if (this.isConnected) {
          this.$connectObserver.unobserve(this);
          if (!this.isIntersecting) {
            for (let i = 0; i < this.$observerConnects!.length; i++) {
              this.$observerConnects![i](true, this);
            }
          }
        } else {
          for (let i = 0; i < this.$observerConnects!.length; i++) {
            this.$observerConnects![i](false, this);
          }
        }
        this.$connects = this.$observerConnects;
        delete this.$observerConnects;
        delete this.$connectObserver;
      }
    }
  }

  /**Attaches an additional managed value to an exisiting component, which also is connnected and disconnected with the component
   * @param func function to handle value
   * @returns returns the hanle to the attached value, this handle function must be used to dettach values*/
  attachConnectListener<T extends ConnectListener>(func: T): T {
    if (this.$connectObserver) {
      this.$observerConnects!.push(func);
      if (this.isIntersecting) {
        func(true, this);
      }
    } else {
      if (!this.$connects) {
        this.$connects = [];
      }
      this.$connects.push(func);
      if (this.isConnected) {
        func(true, this);
      }
    }
    return func;
  }

  /**Dettaches additional value*/
  dettachConnectListener<T extends ConnectListener>(func: T): T {
    if (this.$connects) {
      if (this.$connectObserver) {
        let index = this.$observerConnects!.indexOf(func);
        if (index != -1) {
          this.$observerConnects!.splice(index, 1);
          if (this.isIntersecting) {
            func(false, this);
          }
        }
      } else {
        let index = this.$connects.indexOf(func);
        if (index != -1) {
          this.$connects.splice(index, 1);
          if (this.isConnected) {
            func(false, this);
          }
        }
      }
    }
    return func;
  }

  /**Attaches an additional managed value to an exisiting component, which also is connnected and disconnected with the component
   * @param value value to attach
   * @param func function to handle value
   * @returns returns the hanle to the attached value, this handle function must be used to dettach values*/
  attachDynamicValue(
    value: Value,
    func: (value: any) => void
  ): (connect: boolean, self: WebComponent) => void {
    return this.attachConnectListener((attDet) => {
      if (attDet) {
        value.addListener(func, true);
      } else {
        value.removeListener(func);
      }
    });
  }

  /**Dettaches additional value*/
  dettachDynamicValue(
    handle: (connect: boolean, self: WebComponent<any>) => void
  ) {
    this.dettachConnectListener(handle);
  }
}

/**Creates background framework for given linkable values on element */
export let defineElementValues = <T extends BaseOptions>(
  compClass: (abstract new (...options: any) => Base<T>) & {
    elementName(): string;
    elementNameSpace(): string;
  },
  values: string[]
) => {
  for (const it of values) attachValue(compClass, it);
};

/**Creates a intersection observer to be used for web components*/
export let createWebComponentObserver = (
  options: IntersectionObserverInit
): IntersectionObserver => {
  return new IntersectionObserver(
    ((e: { target: WebComponent; isIntersecting: boolean }[]) => {
      for (let i = 0; i < e.length; i++) {
        if (e[i].isIntersecting) {
          for (let y = 0; y < e[i].target.$observerConnects!.length; y++) {
            e[i].target.$observerConnects![y](true, e[i].target);
          }
        } else if (e[i].target.isIntersecting) {
          for (let y = 0; y < e[i].target.$observerConnects!.length; y++) {
            e[i].target.$observerConnects![y](false, e[i].target);
          }
        }
        e[i].target.isIntersecting = e[i].isIntersecting;
      }
    }) as any as IntersectionObserverCallback,
    options
  );
};

/**This function attaches a setter function to the object for changing the value of
 * Use by running the function on the instrument for each settable value, the setter will then get the given name
 * see below for example
 * @param  compClass object to attach to
 * @param  valueName name of getter and setter functions*/
export let attachValue = <T extends BaseOptions>(
  compClass: (abstract new (...options: any) => Base<T>) & {
    elementName(): string;
    elementNameSpace(): string;
  },
  valueSetterName: string
) => {
  let valuecheckName = "$VC$" + valueSetterName;
  let ValueBufferName = "$Vb" + valueSetterName;
  let valueBufferName = "$vb" + valueSetterName;
  let connectListenerName = "$cl" + valueSetterName;
  let valueListenerName = "$vl" + valueSetterName;

  let setterFuncName = "$vf" + valueSetterName;
  let valueSetName = "$vs" + valueSetterName;

  if (compClass.prototype[valuecheckName]) {
    throw new Error(
      `Value ${valueSetterName} already defined on ${compClass.elementName()}`
    );
  }
  compClass.prototype[valuecheckName] = true;

  //@ts-expect-error
  compClass.prototype[valueSetName] = function (value) {
    if (this[ValueBufferName]) {
      this[ValueBufferName].set = value;
    } else {
      this[valueBufferName] = value;
      this[setterFuncName](value);
    }
  };

  Object.defineProperty(compClass.prototype, valueSetterName, {
    set: function (value) {
      if (this[ValueBufferName]) {
        this.dettachConnectListener(this[connectListenerName]);
        delete this[connectListenerName];
      }
      if (value instanceof Value) {
        this[ValueBufferName] = value;
        this[connectListenerName] = this.attachConnectListener(
          (attDet: boolean) => {
            if (attDet) {
              this[valueListenerName] = value.addListener((val) => {
                this[valueBufferName] = val;
                this[setterFuncName](val);
              }, true);
            } else {
              value.removeListener(this[valueListenerName]);
            }
          }
        );
      } else {
        this[valueBufferName] = value;
        this[setterFuncName](value);
      }
    },
    get: function () {
      if (this[ValueBufferName]) {
        return this[ValueBufferName].get;
      } else {
        return this[valueBufferName];
      }
    },
  });
};
