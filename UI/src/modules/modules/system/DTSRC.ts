import { u32ToIpAddress } from "@libCommon";
import { Err, Ok, type Result } from "@libResult";
import { Module, registerModule } from "@module/module";

export type DTSRCPreConfig = {
  self: boolean;
};

export class DTSRC extends Module {
  readonly self: boolean = false;

  preConfigTransform(
    configs: Partial<DTSRCPreConfig>
  ): Result<DTSRCPreConfig, string> {
    if (typeof configs["self"] !== "boolean")
      return Err("Invalid or missing self");
    //@ts-expect-error
    this.self = configs["self"];
    this.manager.getPluginStorage("client").self = this;
    return Ok({
      self: configs["self"],
    });
  }

  /**Returns if the module has status value to be read*/
  get hasStatusValues(): boolean {
    return true;
  }

  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return (values: any[]) => {
      return (
        "Settings Client" +
        (values[0] ? " IP: " + u32ToIpAddress(values[1]) + " Connected" : "")
      );
    };
  }
}
registerModule("DTSRC", DTSRC);
