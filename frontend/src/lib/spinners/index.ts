import { Base, defineElement } from "@libBase";
import { grey } from "@libColors";
import { svg_primitives } from "@libSvg";
import { initVariableRoot } from "@libTheme";
import { name } from "@package";
import "./index.scss";

let variables = initVariableRoot(
  name,
  "Spinner",
  "Spinner used as a placeholder for data with and unknown arrival time"
);
variables.makeVariable(
  "color",
  "Dot color",
  "Color of dots in spinner",
  grey["700"],
  grey["300"],
  "Color",
  undefined
);

let spinnerSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
spinnerSVG.setAttribute("viewBox", "0 0 64 64");
spinnerSVG.appendChild(svg_primitives.circle(32, 6, 0));
spinnerSVG.appendChild(svg_primitives.circle(45, 9.483, 0));
spinnerSVG.appendChild(svg_primitives.circle(54.516, 19, 0));
spinnerSVG.appendChild(svg_primitives.circle(58, 32, 0));
spinnerSVG.appendChild(svg_primitives.circle(54.516, 45, 0));
spinnerSVG.appendChild(svg_primitives.circle(45, 54.516, 0));
spinnerSVG.appendChild(svg_primitives.circle(32, 58, 0));
spinnerSVG.appendChild(svg_primitives.circle(19, 54.516, 0));
spinnerSVG.appendChild(svg_primitives.circle(9.483, 45, 0));
spinnerSVG.appendChild(svg_primitives.circle(6, 32, 0));
spinnerSVG.appendChild(svg_primitives.circle(9.483, 19, 0));
spinnerSVG.appendChild(svg_primitives.circle(19, 9.483, 0));

export class Dots extends Base {
  /**Returns the name used to define the element */
  static elementName() {
    return "dots";
  }
  /**Returns the namespace override for the element*/
  static elementNameSpace() {
    return "chocolatelibui-spinner";
  }

  constructor() {
    super();
    this.appendChild(spinnerSVG.cloneNode(true));
  }
}

defineElement(Dots);
