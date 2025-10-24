// import { border_solid_color, instrument_dynamic_color } from "@libColors";
// import {
//   circle,
//   pointOnCircle,
//   svgGroup,
//   line as svgLine,
//   svgText,
//   triangle,
// } from "@libCommon";
// import {
//   initInstrument,
//   InstrumentBase,
//   type InstrumentBaseOptions,
//   instrumentElementNameStart,
// } from "@libInstr";
// import { addThemeVariable } from "@libTheme";
// import "./dpBackground.scss";

// let boatXCon = 209;
// let boatYCon = 155;

// let boat = document.createElementNS("http://www.w3.org/2000/svg", "path");
// boat.classList.add("boat");

// boat.setAttribute(
//   "d",
//   "M 2.35216,243.35389 1.9489517,58.382781 C 1.8791442,26.212335 26.316667,2.0269731 58.966763,1.9489914 91.616859,1.8710227 116.15991,25.939341 116.23,58.1098 l 0.40321,184.97113 z"
// );
// let distBoat = boat.cloneNode(true) as SVGPathElement;

// boat.setAttribute(
//   "transform",
//   "translate(" + boatXCon + "," + boatYCon + ")  scale(0.8,0.8)  "
// );

// distBoat.classList.remove("boat");
// distBoat.classList.add("distBoat");

// let arrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
// arrow.classList.add("arrow");
// arrow.setAttribute(
//   "points",
//   "215,98.875 215,132.375 0,132.375 0,165.375 215,165.375 215,197.875 296.75,149.188 "
// );

// addThemeVariable(
//   "dialBorder",
//   ["Instruments", "Button"],
//   border_solid_color.day,
//   border_solid_color.dusk
// );
// addThemeVariable(
//   "arrow",
//   ["Instruments", "Button"],
//   instrument_dynamic_color.day,
//   instrument_dynamic_color.dusk
// );
// let radius = 252;
// let centerX = 256;
// let centerY = 256;

// /**Defines options for button instrument*/
// type InstrDPBackgroundOptions = {
//   /**Click function to run when clicked*/
//   click?: () => void;
//   /**Choose the function of the button*/
//   toggle?: boolean;
//   /**Text on the button*/
//   text?: string;
//   /**Value*/
//   value?: boolean | Value;
//   /**The size of the text*/
//   textSize?: number;
// } & InstrumentBaseOptions;

// export class InstrdpBackground extends InstrumentBase {
//   private __backgroundWheel: SVGGElement;
//   private __bgInside: SVGGElement;
//   private __boat: SVGGElement;
//   private __boatframe: SVGPathElement;
//   private __rudder: SVGGElement;
//   private __lines: SVGGElement;
//   private __labels: SVGGElement;

//   private __major: number = 12;
//   private __minor: number = 4;
//   private __lineNumber: number = 10;
//   private __maxDist: number = 100;
//   private __moveFactor: number = 1;

//   constructor() {
//     super();
//     this.__svg.appendChild((this.__backgroundWheel = svgGroup()));
//     this.__lines = this.__svg.appendChild(
//       document.createElementNS("http://www.w3.org/2000/svg", "g")
//     );
//     this.__labels = this.__svg.appendChild(
//       document.createElementNS("http://www.w3.org/2000/svg", "g")
//     );
//     this.__backgroundWheel.appendChild(
//       circle(centerX, centerY, radius, "border", 2)
//     );
//     this.__backgroundWheel.appendChild(this.__lines);
//     this.__backgroundWheel.appendChild(this.__labels);
//     this.__svg.appendChild((this.__bgInside = svgGroup()));
//     this.__svg.appendChild((this.__boat = svgGroup()));
//     this.__boat.appendChild((this.__boatframe = boat.cloneNode(true)));
//     this.__svg.appendChild((this.__rudder = svgGroup()));
//   }

//   /**Options toggeler*/
//   options(options: InstrDPBackgroundOptions) {
//     super.options(options);
//     if (options.major) this.__major = options.major;
//     if (options.minor) this.__minor = options.minor;
//     if (options.lineNumber) this.__lineNumber = options.lineNumber;
//     if (typeof options.maxDist === "number") this.__maxDist = options.maxDist;
//     if (typeof options.moveFactor === "number")
//       this.__moveFactor = options.moveFactor;
//     if (typeof options.rotatewheel !== "undefined")
//       this.rotatewheel = options.rotatewheel;
//     if (typeof options.moveX !== "undefined") this.moveX = options.moveX;
//     if (typeof options.moveY !== "undefined") this.moveY = options.moveY;
//     if (typeof options.rotate !== "undefined") this.rotate = options.rotate;
//     if (typeof options.distMag !== "undefined") this.distMag = options.distMag;
//     if (typeof options.distAng !== "undefined") this.distAng = options.distAng;
//     if (typeof options.distHeading !== "undefined")
//       this.distHeading = options.distHeading;
//     if (typeof options.windMag !== "undefined") this.windMag = options.windMag;
//     if (typeof options.windAng !== "undefined") this.windAng = options.windAng;
//     if (typeof options.rudderPS !== "undefined")
//       this.rudderPS = options.rudderPS;
//     if (typeof options.rudderSB !== "undefined")
//       this.rudderSB = options.rudderSB;

//     this.__drawCircle();
//     this.__drawLine();
//     this.__drawDistBoat();
//     this.__drawboat();
//     //this.__drawRudder();
//     //this.__updateLines(232, 0, 0)
//   }

//   __drawboat() {
//     let textpro = svgText(centerX, centerY + 7, "Propulsion", 15, "textpro", 7);
//     //this.__boat.appendChild(textpro.cloneNode(true));
//     //textpro = svg.text(centerX, centerY + 57, "Rudder", 15, "textpro", 7)
//     //this.__boat.appendChild(textpro.cloneNode(true));
//     let line = svgLine(
//       centerX - 45,
//       centerY - 10,
//       centerX + 45,
//       centerY - 10,
//       "dotline",
//       1
//     );
//     //this.__boat.appendChild(line.cloneNode(true));
//     line = svgLine(
//       centerX - 45,
//       centerY + 15,
//       centerX + 45,
//       centerY + 15,
//       "dotline",
//       1
//     );
//     //this.__boat.appendChild(line.cloneNode(true));
//     line = svgLine(
//       centerX - 45,
//       centerY + 40,
//       centerX + 45,
//       centerY + 40,
//       "dotline",
//       1
//     );
//     //this.__boat.appendChild(line.cloneNode(true));
//     line = svgLine(
//       centerX - 45,
//       centerY + 65,
//       centerX + 45,
//       centerY + 65,
//       "dotline",
//       1
//     );
//     //this.__boat.appendChild(line.cloneNode(true));
//   }

//   __drawRudder() {
//     if (isNaN(this.rudderPS) || isNaN(this.rudderSB)) {
//       return;
//     }
//     let Xoffset = 35;
//     let lineRudder = line(
//       centerX - Xoffset,
//       centerY + 98,
//       centerX - Xoffset,
//       centerY + 140,
//       "rudder",
//       1
//     );
//     //this.__rudder.appendChild(this.rudderPSLine = lineRudder.cloneNode(true));
//     lineRudder = line(
//       centerX,
//       centerY + 90,
//       centerX,
//       centerY + 140,
//       "rudder",
//       1
//     );
//     this.__rudder.appendChild((this.rudderSBLine = lineRudder.cloneNode(true)));
//     //let degRudderPS = 45 * (this.rudderPS / 100);
//     let degRudderSB = 45 * (this.rudderSB / 100);
//     //this.rudderPSLine.setAttribute("transform", "rotate(" + degRudderPS + "," + (centerX - Xoffset) + "," + (centerY + 98) + ")");
//     this.rudderSBLine.setAttribute(
//       "transform",
//       "rotate(" +
//         degRudderSB +
//         "," +
//         (centerX + Xoffset) +
//         "," +
//         (centerY + 98) +
//         ")"
//     );
//   }
//   /*
//     __updateRudderPS(val) {
//         let valdeg = -45 * (val / 100);
//         this.rudderPSLine.setAttribute("transform", "rotate(" + valdeg + "," + (centerX - 35) + "," + (centerY + 98) + ")");
//     }
//     */
//   __updateRudderSB(val) {
//     let valdeg = -45 * (val / 100);
//     this.rudderSBLine.setAttribute(
//       "transform",
//       "rotate(" + valdeg + "," + (centerX + 35) + "," + (centerY + 98) + ")"
//     );
//   }
//   __drawDistBoat() {
//     if (
//       isNaN(this.distAng) ||
//       isNaN(this.__moveFactor) ||
//       isNaN(this.distHeading) ||
//       isNaN(this.distMag)
//     ) {
//       return;
//     }
//     if (this.distMag > this.__maxDist) {
//       let distRec = triangle(centerX, 12, 30, 15, "distRec", 1);
//       distRec.setAttribute(
//         "transform",
//         "rotate(" + this.distAng + ", " + centerX + ", " + centerY + ")"
//       );
//       this.__bgLines.appendChild(distRec);
//     }
//     this.__bgLines.appendChild(distBoat);
//     let azi = this.distAng;
//     let deg = 450 - azi;
//     if (deg > 360) {
//       deg = deg - 360;
//     }
//     let angRad = (deg * Math.PI) / 180;
//     let distx = this.distMag * Math.cos(angRad);
//     let disty = this.distMag * Math.sin(angRad);
//     let boatDistXCon = boatXCon + distx * this.__moveFactor;
//     let boatDistYCon = boatYCon - disty * this.__moveFactor;
//     let distnewX = centerX + distx * this.__moveFactor;
//     let distnewY = centerY - disty * this.__moveFactor;
//     this.distLine = line(centerX, centerY, distnewX, distnewY, "bglines", 2);
//     this.__bgLines.appendChild(this.distLine);
//     if (this.distHeading === false) {
//       distBoat.setAttribute(
//         "transform",
//         "translate(" +
//           boatDistXCon +
//           "," +
//           boatDistYCon +
//           "), rotate( 0, " +
//           (distnewX - boatDistXCon) +
//           ", " +
//           (distnewY - boatDistYCon) +
//           "),scale(0.8,0.8)"
//       );
//     } else {
//       distBoat.setAttribute(
//         "transform",
//         "translate(" +
//           boatDistXCon +
//           "," +
//           boatDistYCon +
//           "), rotate(" +
//           (this.distHeading + this.rotatewheel) +
//           ", " +
//           (distnewX - boatDistXCon) +
//           ", " +
//           (distnewY - boatDistYCon) +
//           "),scale(0.8,0.8)"
//       );
//     }
//   }

//   __drawCircle() {
//     this.__lines.innerHTML = "";
//     this.__labels.innerHTML = "";
//     for (let i = 1; i < this.__major + 1; i++) {
//       let delta = (2 * Math.PI) / this.__major;
//       let rad = delta * i;
//       let start = pointOnCircle(centerX, centerY, radius, rad);
//       let end = pointOnCircle(centerX, centerY, radius - 20, rad);
//       if (
//         rad == Math.PI * 2 ||
//         rad == Math.PI / 2 ||
//         rad == Math.PI ||
//         rad == (Math.PI / 2) * 3
//       ) {
//         let rec = triangle(start[0], start[1] + 7, 30, 15, "rec", 1);
//         let rot = ((rad + Math.PI / 2) * 180) / Math.PI;
//         rec.setAttribute(
//           "transform",
//           "rotate(" + rot + ", " + start[0] + ", " + start[1] + ")"
//         );
//         this.__lines.appendChild(rec);
//       } else {
//         this.__lines.appendChild(
//           line(start[0], start[1], end[0], end[1], "maTick", 2)
//         );
//       }
//       let label = pointOnCircle(centerX, centerY, radius - 25, -Math.PI / 2);
//       let degLab = ((rad * 180) / Math.PI).toFixed(0);
//       if (degLab == 360) {
//         degLab = 0;
//       }
//       let lableinstance = text(label[0], label[1], degLab, 14, "lab", 3);
//       lableinstance.setAttribute(
//         "transform",
//         "rotate(" +
//           (rad * 180) / Math.PI +
//           ", " +
//           centerX +
//           ", " +
//           centerY +
//           ")"
//       );

//       this.__lines.appendChild(lableinstance);
//       for (let j = 1; j < this.__minor + 1; j++) {
//         let deltaJ = delta / (this.__minor + 1);
//         let rad2 = rad + deltaJ * j;
//         let startm = pointOnCircle(centerX, centerY, radius, rad2);
//         let endm = pointOnCircle(centerX, centerY, radius - 10, rad2);
//         this.__lines.appendChild(
//           line(startm[0], startm[1], endm[0], endm[1], "miTick", 2)
//         );
//       }

//       //rec.setAttribute("transform", "rotate(" + 90 + ", " + centerX + ", " + centerY + ")")
//     }
//   }
//   __drawLine() {
//     this.__defs = document.createElementNS(
//       "http://www.w3.org/2000/svg",
//       "defs"
//     );
//     this.__defs.appendChild(
//       (this.__clipPath = document.createElementNS(
//         "http://www.w3.org/2000/svg",
//         "clipPath"
//       ))
//     );
//     this.__clipPath.appendChild(circle(centerX, centerY, radius - 2));
//     this.__clipPath.setAttribute("id", "123");
//     this.__bgInside.appendChild(this.__defs);
//     this.__bgInside.appendChild((this.__bgLines = svgGroup()));
//     if (isNaN(this.windAng)) {
//       this.windAng = 0;
//     }
//     arrow.setAttribute(
//       "transform",
//       "rotate(" +
//         (this.windAng + 90) +
//         "," +
//         centerX +
//         "," +
//         centerY +
//         ") translate(" +
//         4 +
//         "," +
//         (centerY - 148.5 * 0.3) +
//         ")  scale(0.3,0.3)  "
//     );

//     this.__bgInside.appendChild(arrow);
//     this.__bgLines.classList.add("bglines");
//     let lablePlace = pointOnCircle(
//       centerX,
//       centerY,
//       radius - 90,
//       (-90 * Math.PI) / 180
//     );
//     if (isNaN(this.windMag)) {
//       this.windMag = 0;
//     }
//     let windLable = text(
//       lablePlace[0],
//       lablePlace[1],
//       this.windMag + " m/s",
//       14,
//       "lab",
//       3
//     );
//     this.__bgInside.appendChild((this.windlable = windLable.cloneNode(true)));

//     let deltaLine = (radius * 2) / this.__lineNumber;
//     for (let i = -1; i < this.__lineNumber + 1; i++) {
//       this.line = line(
//         0 + deltaLine * i,
//         0,
//         0 + deltaLine * i,
//         centerY + radius,
//         "bglines",
//         2
//       );
//       this.__bgLines.appendChild(this.line);
//       this.line = line(
//         0,
//         0 + deltaLine * i,
//         centerX + radius,
//         0 + deltaLine * i,
//         "bglines",
//         2
//       );
//       this.__bgLines.appendChild(this.line);
//     }

//     this.__bgLines.setAttribute("clip-path", "url(#123)");
//   }

//   __updateLines(moveX, moveY, rotate) {
//     this.__bgLines.innerHTML = "";
//     let deltaLine = (radius * 2) / this.__lineNumber;
//     while (moveX > deltaLine) {
//       moveX = moveX - deltaLine;
//     }
//     while (moveY > deltaLine) {
//       moveY = moveY - deltaLine;
//     }
//     for (let i = -1; i < this.__lineNumber + 1; i++) {
//       this.line = line(
//         deltaLine * i + moveX,
//         0,
//         0 + deltaLine * i + moveX,
//         centerY + radius,
//         "bglines",
//         2
//       );
//       this.__bgLines.appendChild(this.line);
//       this.line = line(
//         0,
//         moveY + deltaLine * i,
//         centerX + radius,
//         moveY + deltaLine * i,
//         "bglines",
//         2
//       );
//       this.__bgLines.appendChild(this.line);
//     }
//     this.__bgLines.setAttribute(
//       "transform",
//       "rotate(" + -rotate + "," + centerX + "," + centerY + ")"
//     );
//     this.windlable.innerHTML = this.windMag + " m/s";
//     //this.windlable.innerHTML = 3 + " m/s";
//     let windArrowAng = this.windAng + 90 - rotate;
//     arrow.setAttribute(
//       "transform",
//       "rotate(" +
//         windArrowAng +
//         "," +
//         centerX +
//         "," +
//         centerY +
//         ") translate(" +
//         4 +
//         "," +
//         (centerY - 148.5 * 0.3) +
//         ")  scale(0.3,0.3)  "
//     );
//     this.windlable.setAttribute(
//       "transform",
//       "rotate(" + (windArrowAng - 90) + "," + centerX + "," + centerY + ")"
//     );
//   }

//   /**Name for component creation */
//   static get elementName() {
//     return instrumentElementNameStart + "dpbackground";
//   }

//   /**Creates an instance of the button*/
//   static create(_options: InstrDPBackgroundOptions): InstrdpBackground {
//     return undefined as any;
//   }

//   /**Original width of rendered graphics */
//   get renderWidth() {
//     return 512;
//   }

//   /**Original height of rendered graphics */
//   get renderHeight() {
//     return 512;
//   }

//   private __wheelrotate(rotate: number) {
//     this.__backgroundWheel.setAttribute(
//       "transform",
//       "rotate(" + -rotate + ", " + centerX + ", " + centerY + ")"
//     );
//   }

//   protected $vfrotatewheel(val) {
//     this.__wheelrotate(val);
//     this.__updateLines(this.moveX, this.moveY, val);
//     this.__drawDistBoat();
//   }
//   protected $vsrotatewheel(val) {}
//   protected $vfmoveX(val) {
//     this.__updateLines(val, this.moveY, this.rotatewheel);
//     this.__drawDistBoat();
//   }
//   protected $vsmoveX(val) {}
//   protected $vfmoveY(val) {
//     this.__updateLines(this.moveX, val, this.rotatewheel);
//     this.__drawDistBoat();
//   }
//   protected $vsmoveY(val) {}
//   protected $vfdistMag(val) {}
//   protected $vsdistMag(val) {}
//   protected $vfdistAng(val) {}
//   protected $vsdistAng(val) {}
//   protected $vfdistHeading() {}
//   protected $vsdistHeading() {}
//   protected $vswindMag() {}
//   protected $vfwindMag() {}
//   protected $vswindAng() {}
//   protected $vfwindAng() {}
//   protected $vsrudderPS() {}
//   protected $vfrudderPS(val) {
//     // this.__updateRudderPS(val)
//   }
//   $vsrudderSB() {}
//   protected $vfrudderSB(val) {
//     // this.__updateRudderSB(val);
//   }
// }
// //attachValue(InstrButton, "value");
// initInstrument(InstrdpBackground, false, [
//   "rotatewheel",
//   "moveX",
//   "moveY",
//   "distMag",
//   "distAng",
//   "distHeading",
//   "windMag",
//   "windAng",
//   "rudderPS",
//   "rudderSB",
// ]);
// export let instrdpBackground = InstrdpBackground.create;
