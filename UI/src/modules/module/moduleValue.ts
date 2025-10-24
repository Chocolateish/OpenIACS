import {
  Value,
  ValueProxy,
  type ValueListener,
  type ValueType,
} from "@libValues";
import { ModuleValueTypeEnum, type ModuleBase } from "@modCommon";

export class ModuleValue extends Value {
  private __module: ModuleBase;
  private __writeable?: boolean;
  private ___format?: ModuleValueTypeEnum;
  private __sendTimeout: any;
  private __sending: any;

  constructor(module: ModuleBase) {
    super({});
    this.__module = module;
  }
  set writeable(writeable: boolean) {
    this.__writeable = Boolean(writeable);
  }

  set format(format: ModuleValueTypeEnum) {
    switch (format) {
      case ModuleValueTypeEnum.DIG: {
        //@ts-expect-error
        this.serverUpdate = function (val) {
          if (typeof val === "string") {
            this.serverSet = { reason: val };
          } else {
            if (val) {
              this.serverSet = true;
            } else {
              this.serverSet = false;
            }
          }
        };
        break;
      }
      case ModuleValueTypeEnum.FLT32:
      case ModuleValueTypeEnum.SIG32:
      case ModuleValueTypeEnum.SIG64:
      case ModuleValueTypeEnum.UNS32:
      case ModuleValueTypeEnum.UNS64: {
        //@ts-expect-error
        this.serverUpdate = function (val) {
          if (typeof val === "string") {
            this.serverSet = { reason: val };
          } else {
            this.serverSet = Number(val);
          }
        };
        break;
      }
      case ModuleValueTypeEnum.Null:
      case ModuleValueTypeEnum.ENUM: {
        //@ts-expect-error
        this.serverUpdate = function (val) {
          if (typeof val === "string") {
            this.serverSet = { reason: val };
          }
        };
        break;
      }
    }
    this.___format = format;
  }

  get format() {
    return this.___format || ModuleValueTypeEnum.Null;
  }

  sendValue(val: number) {
    this.__sending = val;
    if (!this.__sendTimeout) {
      this.__sendTimeout = setTimeout(() => {
        this.__module.manager.sendMessage("SP", {
          [this.__module.uid]: this.__sending,
        });
        this.__sendTimeout = 0;
      }, 100);
    }
  }

  /**Parses values of different formats*/
  __parseVal(val: ValueType) {
    switch (this.___format) {
      case ModuleValueTypeEnum.DIG: {
        if (["1", "true", "on"].includes(String(val).toLowerCase())) {
          return true;
        } else {
          return false;
        }
      }
      case ModuleValueTypeEnum.FLT32:
      case ModuleValueTypeEnum.SIG32:
      case ModuleValueTypeEnum.SIG64:
      case ModuleValueTypeEnum.UNS32:
      case ModuleValueTypeEnum.UNS64: {
        return val;
      }
    }
  }

  /** This sets the value and dispatches an event */
  set set(val: ValueType) {
    if (this.__writeable) {
      this.sendValue(this.__parseVal(val));
    }
  }

  set serverSet(val: ValueType) {
    super.set = val;
  }

  /** This sets the value and dispatches an event, if the skip variable is set to a function, if that event listener is registered it will be skipped*/
  setSkip(val: ValueType, _skip?: ValueListener) {
    if (this.__writeable) {
      this.sendValue(this.__parseVal(val));
    }
  }

  /** This sets the value without dispatching an event
   * It should only be used by the owner of the value
   * @param {} val*/
  set setSilent(val: ValueType) {
    if (this.__writeable) {
      this.sendValue(this.__parseVal(val));
    }
  }

  onListener(type: boolean) {
    if (type) {
      //@ts-expect-error
      this.__module.___valueStartConnection();
    } else {
      //@ts-expect-error
      this.__module.___valueStopConnection();
      this.___value = NaN;
    }
  }
}

export class ModuleValueFormatted extends ValueProxy {
  //@ts-ignore
  private ___format?: ModuleValueTypeEnum;

  set format(format: ModuleValueTypeEnum) {
    switch (format) {
      case ModuleValueTypeEnum.DIG: {
        this.mapperRead = (val) => {
          if (typeof val === "object") {
            return val.reason;
          } else {
            if (val) {
              return "On";
            } else {
              return "Off";
            }
          }
        };
        break;
      }
      case ModuleValueTypeEnum.FLT32:
      case ModuleValueTypeEnum.SIG32:
      case ModuleValueTypeEnum.UNS32:
      case ModuleValueTypeEnum.SIG64:
      case ModuleValueTypeEnum.UNS64: {
        this.mapperRead = (val) => {
          if (typeof val === "object") {
            return val.reason;
          } else {
            return val;
          }
        };
        break;
      }
    }
    this.___format = format;
  }
}
