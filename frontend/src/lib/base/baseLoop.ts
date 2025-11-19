import type { Result } from "@libResult";
import { STATE_ARRAY_RES, type STATE_SUB } from "@libState";
import type { STATE_ARRAY_READ } from "../state/array";
import { Base } from "./base";

interface A<T, E extends Node> {
  generator(val: T): E;
  error(err: string): Node;
  destructor?(val: T, element: E): void;
  array?: T[];
  state?: STATE_ARRAY_RES<T>;
}

interface B<T, E extends Node> extends A<T, E> {
  array: T[];
  state?: undefined;
}

interface C<T, E extends Node> extends A<T, E> {
  array?: undefined;
  state: STATE_ARRAY_RES<T>;
}
export type LoopOptions<T, E extends Node> = B<T, E> | C<T, E>;

export class Loop<T, E extends Node> extends Base {
  #generator: (val: T) => E;
  //#error: (err: string) => Node = () => document.createTextNode("");
  #destructor?: (val: T, element: E) => void;
  #stateArray?: STATE_ARRAY_RES<T>;
  #subSubscriber?: STATE_SUB<Result<STATE_ARRAY_READ<T>, string>>;
  #values: T[] = [];
  #children: E[] = [];

  constructor(options: LoopOptions<T, E>) {
    super();
    this.#generator = options.generator;
    //this.#error = options.error;
    this.#destructor = options.destructor;
  }

  set array(array: T[]) {
    if (this.#subSubscriber) this.#stateArray?.unsub(this.#subSubscriber);
    this.replaceChildren(...array.map(this.#generator));
  }

  set state(state: STATE_ARRAY_RES<T>) {
    if (state === this.#stateArray) return;
    if (this.#subSubscriber) this.#stateArray?.unsub(this.#subSubscriber);
    this.#stateArray = state;
    this.#subSubscriber = this.#stateArray.sub((val) => {
      if (val.ok) {
        let value = val.value;
        this.#values = state_array_apply_read_to_array(this.#values, value);
        this.#children = state_array_apply_read_to_array_transform(
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
