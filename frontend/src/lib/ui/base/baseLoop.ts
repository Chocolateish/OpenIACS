import type { StateError, StateSubscriber } from "@state";
import {
  StateArray,
  stateArrayApplyReadToArray,
  stateArrayApplyReadToArrayTransform,
  type StateArrayRead,
} from "../../common/state/stateArray";
import { Base } from "./base";

interface A<T, E extends Node> {
  generator(val: T): E;
  error(err: StateError): Node;
  destructor?(val: T, element: E): void;
  array?: T[];
  state?: StateArray<T>;
}

interface B<T, E extends Node> extends A<T, E> {
  array: T[];
  state?: undefined;
}

interface C<T, E extends Node> extends A<T, E> {
  array?: undefined;
  state: StateArray<T>;
}
export type LoopOptions<T, E extends Node> = B<T, E> | C<T, E>;

export class Loop<T, E extends Node> extends Base {
  #generator: (val: T) => E;
  #error: (err: StateError) => Node;
  #destructor?: (val: T, element: E) => void;
  #stateArray?: StateArray<T>;
  #subSubscriber?: StateSubscriber<StateArrayRead<T>>;
  #values: T[] = [];
  #children: E[] = [];

  constructor(options: LoopOptions<T, E>) {
    super();
    this.#generator = options.generator;
    this.#error = options.error;
    this.#destructor = options.destructor;
  }

  set array(array: T[]) {
    if (this.#subSubscriber) this.#stateArray?.unsubscribe(this.#subSubscriber);
    this.replaceChildren(...array.map(this.#generator));
  }

  set state(state: StateArray<T>) {
    if (state === this.#stateArray) return;
    if (this.#subSubscriber) this.#stateArray?.unsubscribe(this.#subSubscriber);
    this.#stateArray = state;
    this.#subSubscriber = this.#stateArray.subscribe((val) => {
      if (val.ok) {
        let value = val.value;
        this.#values = stateArrayApplyReadToArray(this.#values, value);
        this.#children = stateArrayApplyReadToArrayTransform(
          this.#children,
          value,
          this.#generator
        );
        switch (value.type) {
          case "none":
            return this.replaceChildren(...this.#children);
          case "added":
            let childNodes = this.childNodes;
            if (value.index === childNodes.length) {
              this.append(...this.#children);
            } else {
              for (let i = value.items.length; i > 0; i--) {
                this.insertBefore(
                  this.childNodes[value.index],
                  this.#generator(value.items[i - 1])
                );
              }
            }
            break;
          case "removed":
            for (let i = 0; i < value.items.length; i++) {
              if (this.#destructor)
                this.#destructor(
                  this.#values[value.index],
                  this.#children[value.index]
                );
              this.childNodes[value.index].remove();
            }
            break;
          case "changed":
            for (let i = 0; i < value.items.length; i++)
              this.childNodes[i].replaceWith(this.#generator(value.items[i]));
            break;
        }
      }
    }, true);
  }
}
