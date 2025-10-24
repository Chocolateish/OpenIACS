import { Value, type ValueType } from "./value";

/**Performs an operation on multiple values */
export class MultiValue extends Value {
  __values: Value[];
  __valuesBuffer: any[];
  __valuesListeners: (() => void)[] = [];
  /**
   * @param  values list of values to perform multi operation on
   * @param  readFunc overwrite for reading from multiple values
   * @param  writeFunc overwrite for writing to multiple values*/
  constructor(
    values?: Value[],
    readFunc?: (values: any[]) => any,
    writeFunc?: (value: any, values: any[], valuesBuffer: any[]) => void
  ) {
    super(undefined, undefined, undefined);
    this.__values = [];
    this.__valuesBuffer = [];
    if (typeof values !== "undefined") this.values = values;
    if (typeof readFunc !== "undefined") this.multiReadFunction = readFunc;
    if (typeof writeFunc !== "undefined") this.multiWriteFunction = writeFunc;
  }

  /**Sets the values to sum up*/
  set values(val: Value[]) {
    for (let i = 0; i < val.length; i++)
      if (!(val[i] instanceof Value)) {
        console.warn("None value passed");
        return;
      }
    this.__disconnect();
    this.__values = val;
    if (this.hasListener) this.__connect();
  }

  /**Sets the values to sum up*/
  set multiReadFunction(func: (values: any[]) => any) {
    this.__multiFuncRead = func;
    if (this.hasListener) super.set = this.__multiFuncRead(this.__valuesBuffer);
  }

  /**Sets the values to sum up*/
  set multiWriteFunction(
    func: (value: any, values: any[], valuesBuffer: any[]) => void
  ) {
    if (typeof func === "function") this.__multiFuncWrite = func;
  }

  onListener(type: boolean) {
    if (type) this.__connect();
    else this.__disconnect();
  }

  /** This sets the value and dispatches an event*/
  set set(val: ValueType) {
    let values: any[] = [];
    this.__multiFuncWrite(val, values, this.__valuesBuffer);
    for (let i = 0; i < this.__values.length; i++)
      this.__values[i].set = values[i];
  }

  /** This get the curent value*/
  get get(): ValueType | Promise<ValueType> {
    if (this.hasListener) {
      return super.get;
    } else {
      let promise = false;
      let buffer: any[] = [];
      for (let i = 0; i < this.__values.length; i++) {
        buffer[i] = this.__values[i].get;
        if (buffer[i] instanceof Promise) {
          buffer[i].then((val: any) => {
            buffer[i] = val;
          });
          promise = true;
        }
      }
      if (promise) {
        return new Promise((a) => {
          Promise.all(buffer).then((vals) => {
            a(this.__multiFuncRead(vals));
          });
        });
      } else {
        return this.__multiFuncRead(buffer);
      }
    }
  }

  /**Connects listeners to all values
   * this must be overwritten to*/
  private __connect() {
    for (let i = 0; i < this.__values.length; i++) {
      //@ts-expect-error
      this.__valuesListeners[i] = this.__values[i].addListener((val) => {
        this.__valuesBuffer[i] = val;
        super.set = this.__multiFuncRead(this.__valuesBuffer);
      }, true);
    }
  }

  /**Disconnects listeners from all values*/
  private __disconnect() {
    if (this.hasListener) {
      for (let i = 0; i < this.__values.length; i++) {
        this.__values[i].removeListener(this.__valuesListeners[i]);
      }
    }
    this.__valuesListeners = [];
  }

  /**Overwriteable method for reading from multiple values*/
  protected __multiFuncRead(_values: any[]): any {}

  /**Overwriteable method for writing to multiple values
   * it gets the written value and an array of Values to write to*/
  protected __multiFuncWrite(
    _value: any,
    _values: any[],
    _valuesBuffer: any[]
  ) {}
}
