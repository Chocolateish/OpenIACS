import { MultiValue } from "./multiValue";
import { Value } from "./value";

/**Sums up values from other Values only numbers*/
export class ValueSummer extends MultiValue {
  /**Overwriteable method for reading from multiple values*/
  protected __multiFuncRead(vals: any[]): any {
    let sum = 0;
    for (let i = 0; i < vals.length; i++) {
      sum += vals[i];
    }
    return sum;
  }

  /**Overwriteable method for writing to multiple values
   * it gets the written value and an array of Values to write to*/
  protected __multiFuncWrite(value: any, values: Value[], valuesBuffer: any[]) {
    let diff = (value - this.___value) / this.__values.length;
    for (let i = 0; i < this.__values.length; i++) {
      values[i] = valuesBuffer[i] + diff;
    }
  }
}

/**Finds average of other values*/
export class ValueAverage extends MultiValue {
  /**Overwriteable method for reading from multiple values*/
  protected __multiFuncRead(vals: any[]): any {
    let sum = 0;
    for (let i = 0; i < vals.length; i++) {
      sum += vals[i];
    }
    return sum / vals.length;
  }

  /**Overwriteable method for writing to multiple values
   * it gets the written value and an array of Values to write to*/
  protected __multiFuncWrite(value: any, values: Value[], valuesBuffer: any[]) {
    let diff = value - this.___value;
    for (let i = 0; i < this.__values.length; i++) {
      values[i] = valuesBuffer[i] + diff;
    }
  }
}
