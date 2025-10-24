import {
  Content,
  getWindowManagerFromElement,
  mainWindowManager,
  UIWindow,
  type ContentBaseOptions,
  type WindowBaseOptions,
} from "@libUI";

export let promptsWindowLayer = 99999;

/**To keep a prompt from closing the manualClosing option needs to be set true
 *
 * For prompts which return values the prompt can be kept open until the correct value is returned using the below example in an async function
 * let prompt = prompt({});
 * while (true) {
 *   let result = await prompt.promise;
 *   if (result) {
 *      prompt.close();
 *      return;
 *   }
 * }
 */

/**A prompt returns an object with the following values {prompt:a reference to the prompt itself, window:a reference to the prompts window, promise:a promise for the prompts completion}
 * The promise value is an object with the close code and any other data made by the prompt {code:''}
 * Standard closing codes for prompts */
export const PromptCodes = {
  CLOSED: "closed", //Code used when prompt is closed
  ENTER: "enter", //Code used when data is entered
} as const;
export type PromptCodes = (typeof PromptCodes)[keyof typeof PromptCodes];

/**Defines the return object for a prompt*/
export type PromptReturnBase = {
  code: PromptCodes;
};

export type PromptBaseOptions = {
  /**the title of the prompt */
  title?: string;
  /**whether the prompt will be closed manually */
  manualClose?: boolean;
  /**Window Override */
  window?: WindowBaseOptions;
} & ContentBaseOptions;

export abstract class Prompt<
  T extends {},
  Options extends PromptBaseOptions = PromptBaseOptions
> extends Content<Options> {
  /**Returns the name used to define the element */
  static elementName() {
    return "prompt";
  }

  protected ___promise:
    | ((
        value: (PromptReturnBase & T) | PromiseLike<PromptReturnBase & T>
      ) => void)
    | null = null;
  protected ___manualClose: boolean = false;

  readonly window?: UIWindow;

  /**Options toggeler*/
  options(options: Options): this {
    super.options(options);
    if (options.title) this.title = options.title;
    if (options.manualClose) this.manualClose = options.manualClose;
    return this;
  }

  /**This changes the title of the prompt*/
  set title(title: string) {
    this.name = title;
  }

  /**This makes it so the prompt*/
  set manualClose(mc: boolean) {
    this.___manualClose = Boolean(mc);
  }

  /**Returns a promise for the return from the prompt*/
  get promise(): Promise<PromptReturnBase & T> {
    return new Promise((a) => (this.___promise = a));
  }

  /**Called when the prompt is finished*/
  protected ___finish(code: PromptCodes, data?: T) {
    this.___runCallbacks(code, data);
    if (!this.___manualClose || code === PromptCodes.CLOSED) {
      this.close({ code, ...data });
    }
  }

  /**Called when the prompt is finished*/
  protected ___runCallbacks(code: PromptCodes, data?: T) {
    if (this.___promise) {
      //@ts-expect-error
      this.___promise({ code, ...data });
    }
  }

  /**Overwrite for closing function*/
  async onClose() {
    this.___runCallbacks(PromptCodes.CLOSED);
  }

  /** Keyboard event processed for content*/
  protected __keyboard(e: KeyboardEvent) {
    if (e.key == "Escape") {
      this.___finish(PromptCodes.CLOSED);
    }
  }
}

/**This function creates a window for the prompt*/
export function createPromptWindow<
  T extends {},
  C extends Prompt<T, any>,
  P extends new () => C
>(
  options: PromptBaseOptions,
  promptClass: P,
  windowParams: WindowBaseOptions
): C {
  //Parent is determined must lead to a window manager
  let prompt = new promptClass();

  //@ts-expect-error
  prompt.window = new UIWindow().options({
    ...windowParams,
    ...options.window,
    content: prompt,
  });

  prompt.options(options);
  (options.parent instanceof HTMLElement
    ? getWindowManagerFromElement(options.parent)
    : mainWindowManager
  ).appendWindow(prompt.window);
  prompt.window.select();
  return prompt;
}
