// import { AccessTypes, defineElement } from "@libBase";
// import { grey } from "@libColors";
// import { ValueComponent, type ValueComponentOptions } from "./common";
// import { componentThemeRoot } from "./shared";
// import "./toggleSwitch.scss";

// componentThemeRoot.makeVariable(
//   "componentToggleSwitchColor",
//   "componentToggleSwitchColor",
//   "componentToggleSwitchColor",
//   grey["50"],
//   grey["900"],
//   "Color",
//   undefined
// );
// componentThemeRoot.makeVariable(
//   "componentToggleSwitchBorderColor",
//   "componentToggleSwitchBorderColor",
//   "componentToggleSwitchBorderColor",
//   grey["700"],
//   grey["300"],
//   "Color",
//   undefined
// );

// /**Defines options for toggle button component*/
// type ToggleSwitchOptions = {
//   /**the symbol to display in the button */
//   symbol?: SVGSVGElement;
// } & ValueComponentOptions;

// /**Toggle Switch, switches between on and off*/
// export class ToggleSwitch extends ValueComponent<ToggleSwitchOptions> {
//   /**Returns the name used to define the element */
//   static elementName() {
//     return "toggle-switch";
//   }

//   /** Stores container for toggler*/
//   private __switch = this.appendChild(document.createElement("div"));
//   private __preventClick?: boolean;
//   private __sym?: SVGSVGElement;
//   private __text?: HTMLSpanElement;

//   constructor() {
//     super();
//     this.__switch.onkeydown = (e) => {
//       e.stopPropagation();
//       switch (e.key) {
//         case "Enter":
//         case " ": {
//           this.onkeyup = (e) => {
//             e.stopPropagation();
//             switch (e.key) {
//               case "Enter":
//               case " ": {
//                 this.setValue(!this.__valueBuffer);
//                 break;
//               }
//             }
//             this.onkeyup = null;
//           };
//           break;
//         }
//       }
//     };
//     this.__switch.onpointerdown = (e: PointerEvent) => {
//       e.preventDefault();
//       e.stopPropagation();
//       this.__switch.focus();
//       this.__switch.setPointerCapture(e.pointerId);
//       let hasMoved = false;
//       this.__switch.onpointermove = (ev: PointerEvent) => {
//         ev.preventDefault();
//         ev.stopPropagation();
//         if (hasMoved) {
//           let box = this.__switch.getBoundingClientRect();
//           let midCord = box.x + box.width / 2;
//           if (ev.clientX > midCord) {
//             if (!this.__valueBuffer) {
//               this.setValue(true);
//             }
//           } else {
//             if (this.__valueBuffer) {
//               this.setValue(false);
//             }
//           }
//         } else if (
//           Math.abs(e.clientX - ev.clientX) > 10 ||
//           Math.abs(e.clientY - ev.clientY) > 10
//         ) {
//           hasMoved = true;
//         }
//       };

//       this.__switch.onpointerup = (ev: PointerEvent) => {
//         ev.preventDefault();
//         ev.stopPropagation();
//         if (!hasMoved) {
//           this.setValue(!this.__valueBuffer);
//         }
//         this.__switch.releasePointerCapture(ev.pointerId);
//         this.__switch.onpointerup = null;
//         this.__switch.onpointermove = null;
//       };
//     };
//     /**Handler for clicking the switch*/
//     this.__switch.onclick = (e: MouseEvent) => {
//       e.preventDefault();
//       e.stopPropagation();
//     };

//     /**Handler for clicking the switch*/
//     this.onclick = (e: MouseEvent) => {
//       e.preventDefault();
//       e.stopPropagation();
//       if (this.__preventClick) {
//         this.__preventClick = false;
//         return;
//       }
//       this.setValue(!this.__valueBuffer);
//     };
//   }

//   /**Options toggeler*/
//   options(options: ToggleSwitchOptions): this {
//     super.options(options);
//     this.symbol = options.symbol;
//     return this;
//   }

//   /**Changes the icon of the switch*/
//   set symbol(sym: SVGSVGElement | undefined) {
//     if (sym instanceof SVGSVGElement) {
//       this.__sym = this.insertBefore(sym, this.firstChild);
//     } else if (this.__sym) {
//       this.removeChild(this.__sym);
//       delete this.__sym;
//     }
//   }

//   /**Set text of switch*/
//   set text(text: string) {
//     if (typeof text == "string") {
//       if (!this.__text) {
//         this.__text = this.insertBefore(
//           document.createElement("span"),
//           this.__switch
//         );
//       }
//       this.__text.innerHTML = text;
//     } else if (this.__text) {
//       this.removeChild(this.__text);
//       delete this.__text;
//     }
//   }

//   /**Internal access call*/
//   protected onAccess(a: AccessTypes) {
//     switch (a) {
//       case AccessTypes.READ: {
//         this.__switch.removeAttribute("tabindex");
//         break;
//       }
//       case AccessTypes.WRITE: {
//         this.__switch.setAttribute("tabindex", "0");
//         break;
//       }
//     }
//   }

//   /**Internal value setter*/
//   protected __newValue(val: boolean) {
//     if (val) this.__switch.classList.add("on");
//     else this.__switch.classList.remove("on");
//   }
// }
// defineElement(ToggleSwitch);
