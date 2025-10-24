import { Module, registerModule } from "@module/module";

export class LOGGN extends Module {
  get name() {
    return "System Logging";
  }
}
registerModule("LOGGN", LOGGN);
