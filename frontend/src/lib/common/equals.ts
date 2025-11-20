/**This compares two values of any type, returns true if they are equal
 * For any object type it will deep compare, with the exception of objects which have an objectEquals method, which can provide a custom comparisson
 * Will return true for NaN equal to NaN*/
export function anyEqualsDeep(any1: any, any2: any): boolean {
  let type1 = typeof any1;
  let type2 = typeof any2;
  if (type1 !== type2) return false;
  switch (type1) {
    case "object":
      return objectEqualsDeep(any1, any2);
    case "number": {
      if (any1 !== any1) {
        if (any2 !== any2) return true;
        else return false;
      } else return any1 === any2;
    }
    default:
      return any1 === any2;
  }
}

/**This deep compares two objects, returns true if they are equal
 * It compares all keys in the object, with the exception of objects which have an objectEquals method, which can provide a custom comparisson*/
export function objectEqualsDeep(object1: {}, object2: {}): boolean {
  let props = Object.keys(object1);
  let props2 = Object.keys(object2);
  if (props.length != props2.length) return false;
  for (let i = 0, m = props.length; i < m; i++) {
    if (!(props[i] in object2)) return false;
    //@ts-expect-error
    let e1 = object1[props[i]];
    //@ts-expect-error
    let e2 = object2[props[i]];
    let type = typeof e1;
    if (type !== typeof e2) return false;
    switch (type) {
      case "object": {
        if (e1.__proto__ != e2.__proto__) return false;
        if (Array.isArray(e1)) {
          if (!arrayEqualsDeep(e1, e2)) return false;
        } else if ("objectEquals" in e1) {
          if (!e1.objectEquals(e2)) return false;
        } else if (!objectEqualsDeep(e1, e2)) return false;
        break;
      }
      default: {
        if (e1 !== e2) return false;
        break;
      }
    }
  }
  return true;
}

/**This deep compares two arrays, returns true if they are equal
 * It compares all indexes in the array, with the exception of arrays which have an objectEquals method, which can provide a custom comparisson*/
export function arrayEqualsDeep(array1: any[], array2: any[]): boolean {
  if (!array1 || !array2) return false;
  if (array1.length != array2.length) return false;
  for (var i = 0, l = array1.length; i < l; i++) {
    let e1 = array1[i];
    let e2 = array2[i];
    let type = typeof e1;
    if (type !== typeof e2) return false;
    switch (type) {
      case "object": {
        if (e1.__proto__ != e2.__proto__) return false;
        if (Array.isArray(e1)) {
          if (!arrayEqualsDeep(e1, e2)) return false;
        } else if ("objectEquals" in e1) {
          if (!e1.objectEquals(e2)) return false;
        } else if (!objectEqualsDeep(e1, e2)) return false;
        break;
      }
      default: {
        if (e1 !== e2) return false;
        break;
      }
    }
  }
  return true;
}
