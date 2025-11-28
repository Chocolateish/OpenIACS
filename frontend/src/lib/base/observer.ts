import type { Base } from "./base";

export type BaseObserverOptions = {
  /**Deffers updating visible state for so many milliseconds
   * this will also batch updates if they are constantly coming*/
  defferedVisible?: number;
  /**Deffers updating visible state for so many milliseconds
   * this will also batch updates if they are constantly coming*/
  defferedHidden?: number;
} & IntersectionObserverInit;

let V2 = "delay" in new IntersectionObserver(() => {});
export class BaseObserver extends IntersectionObserver {
  #_defferedVisibleTime: number;
  #_defferedHiddenTime: number;
  #_defferedVisibleTimeout: number | null = null;
  #_defferedHiddenTimeout: number | null = null;
  #_defferedVisibleQueue: Base[] = [];
  #_defferedHiddenQueue: Base[] = [];

  constructor(options: BaseObserverOptions) {
    super(
      (e) => {
        if (
          this.#_defferedHiddenTime === 0 &&
          this.#_defferedVisibleTime === 0
        ) {
          for (let i = 0; i < e.length; i++) {
            //@ts-expect-error
            (<Base>e[i].target)._set_visible(e[i].isIntersecting);
          }
          return;
        }
        for (let i = 0; i < e.length; i++) {
          if (e[i].isIntersecting) {
            this.#_defferedVisibleQueue.push(e[i].target as Base);
            let index = this.#_defferedHiddenQueue.indexOf(e[i].target as Base);
            if (index !== -1) this.#_defferedHiddenQueue.splice(index, 1);
          } else {
            this.#_defferedHiddenQueue.push(e[i].target as Base);
            let index = this.#_defferedVisibleQueue.indexOf(
              e[i].target as Base
            );
            if (index !== -1) this.#_defferedVisibleQueue.splice(index, 1);
          }
        }
        if (!this.#_defferedVisibleTimeout) {
          this.#_defferedVisibleTimeout = window.setTimeout(() => {
            for (let i = 0; i < this.#_defferedVisibleQueue.length; i++) {
              //@ts-expect-error
              this.#_defferedVisibleQueue[i]._set_visible(true);
            }
            this.#_defferedVisibleQueue = [];
            this.#_defferedVisibleTimeout = null;
          }, this.#_defferedVisibleTime);
        }
        if (!this.#_defferedHiddenTimeout) {
          this.#_defferedHiddenTimeout = window.setTimeout(() => {
            for (let i = 0; i < this.#_defferedHiddenQueue.length; i++) {
              //@ts-expect-error
              this.#_defferedHiddenQueue[i]._set_visible(false);
            }
            this.#_defferedHiddenQueue = [];
            this.#_defferedHiddenTimeout = null;
          }, this.#_defferedHiddenTime);
        }
      },
      V2 && options.defferedVisible === options.defferedHidden
        ? ({ delay: options.defferedVisible, ...options } as any)
        : options
    );
    if (V2 && options.defferedVisible === options.defferedHidden) {
      this.#_defferedVisibleTime = 0;
      this.#_defferedHiddenTime = 0;
    } else {
      this.#_defferedVisibleTime = options.defferedVisible ?? 250;
      this.#_defferedHiddenTime = options.defferedHidden ?? 250;
    }
  }
}
