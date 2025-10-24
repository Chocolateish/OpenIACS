import { registerModule } from "@module/module";
import { VABAS } from "../../VABAS";

export * from "./NMEAS";
export * from "./NMSEG";
export * from "./NMTAK";

export class NMEAG extends VABAS {}
registerModule("NMEAG", NMEAG);
export class NMGGA extends VABAS {}
registerModule("NMGGA", NMGGA);
export class NMGLL extends VABAS {}
registerModule("NMGLL", NMGLL);
export class NMGMC extends VABAS {}
registerModule("NMGMC", NMGMC);
export class NMHDG extends VABAS {}
registerModule("NMHDG", NMHDG);
export class NMPPE extends VABAS {}
registerModule("NMPPE", NMPPE);
export class NMWWR extends VABAS {}
registerModule("NMWWR", NMWWR);
