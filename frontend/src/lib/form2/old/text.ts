// import { defineElement } from "@libBase";
// import {
//   Component,
//   ValueComponent,
// } from "./common";
// import "./text.scss";

// /**Defines options for text component*/
// export type TextBoxComponentOptions = {
//   /**size of text in rem */
//   size?: number;
//   /**style of text (italic or normal) */
//   style?: string;
//   /**weight of text number or name */
//   weight?: string;
// } & ComponentBaseOptions;

// /**Component for displaying simple text */
// export class TextBox extends Component<TextBoxComponentOptions> {
//   /**Returns the name used to define the element */
//   static element_name() {
//     return "textbox";
//   }

//   /**Options toggeler*/
//   options(options: TextBoxComponentOptions): this {
//     super.options(options);
//     if (options.size) this.size = options.size;
//     if (options.style) this.fStyle = options.style;
//     if (options.weight) this.weight = options.weight;
//     return this;
//   }

//   /**Set the text of the component*/
//   set text(text: string) {
//     this.innerHTML = text;
//   }

//   /**Set the text of the component*/
//   get text(): string {
//     return this.innerHTML;
//   }

//   /**Set the size of the text*/
//   set size(size: number) {
//     this.style.fontSize = size + "rem";
//   }

//   /**Set the style of the text*/
//   set fStyle(st: string) {
//     this.style.fontStyle = st;
//   }

//   /**Set the weight of the text*/
//   set weight(wg: string) {
//     this.style.fontWeight = wg;
//   }
// }
// defineElement(TextBox);

// /**Defines options for text component*/
// export type TextBoxValueComponentOptions = {
//   /**unit to use for component */
//   unit?: string;
//   /**size of text in rem */
//   size?: number;
//   /**style of text (italic or normal) */
//   style?: string;
//   /**weight of text number or name */
//   weight?: string;
//   /**amount of decimals shown */
//   decimals?: number | boolean;
// } & ValueComponentOptions;

// /**Component for displaying value text */
// export class TextBoxValue extends ValueComponent<TextBoxValueComponentOptions> {
//   /**Returns the name used to define the element */
//   static element_name() {
//     return "textboxvalue";
//   }

//   private __text: HTMLSpanElement = this.appendChild(
//     document.createElement("span")
//   );
//   private __valueBox = this.appendChild(document.createElement("div"));
//   private __unitNode: Text;
//   private __valueNode: Text;
//   private __dec?: number;
//   private __hasDec?: boolean;

//   /**Build method which constructs the element and apply initial parameters*/
//   constructor() {
//     super();
//     let unit = document.createElement("span");
//     unit.appendChild((this.__unitNode = document.createTextNode("")));
//     this.__valueBox.append(
//       (this.__valueNode = document.createTextNode("")),
//       document.createTextNode(" "),
//       unit
//     );
//   }

//   /**Options toggeler*/
//   options(options: TextBoxValueComponentOptions): this {
//     this.decimals = options.decimals;
//     super.options(options);
//     if (typeof options.unit !== "undefined") this.unit = options.unit;
//     if (options.size) this.size = options.size;
//     if (options.style) this.fStyle = options.style;
//     if (options.weight) this.weight = options.weight;
//     return this;
//   }

//   /**Set the text of the component*/
//   set text(text: string) {
//     this.__text.innerHTML = text;
//   }

//   /**Set the text of the component*/
//   get text(): string {
//     return this.__text.innerHTML;
//   }

//   /**Sets the amount of decimals the slider can have, 0 is none*/
//   set decimals(dec: number | boolean | undefined) {
//     if (typeof dec === "number") {
//       this.__dec = Math.max(parseInt(String(dec)), 0);
//       this.__hasDec = true;
//     } else if (typeof dec === "boolean") this.__hasDec = false;
//     else this.decimals = 3;
//   }

//   /**Gets the amount of decimals the slider can have*/
//   get decimals(): number {
//     return this.__dec || 0;
//   }

//   /**Set the size of the text*/
//   set size(size: number) {
//     this.__valueBox.style.fontSize = size + "rem";
//   }

//   /**Set the style of the text*/
//   set fStyle(st: string) {
//     this.__valueBox.style.fontStyle = st;
//   }

//   /**Set the weight of the text*/
//   set weight(wg: string) {
//     this.__valueBox.style.fontWeight = wg;
//   }

//   /**This is called when the program sets the value*/
//   __newValue(val: ComponentValue = 0) {
//     if (this.__hasDec) {
//       this.__valueNode.nodeValue = val.toLocaleString(undefined, {
//         maximumFractionDigits: this.__dec,
//       });
//     } else {
//       this.__valueNode.nodeValue = String(val);
//     }
//   }

//   /**Sets the unit of the inputbox*/
//   set unit(_unit: string) {}

//   /**Returns the current unit*/
//   get unit(): string {
//     return "";
//   }

//   /**Internal unit setter*/
//   //@ts-expect-error
//   private $vfunit(val: string) {
//     this.__unitNode.nodeValue = val;
//   }
// }
// defineElement(TextBoxValue);
