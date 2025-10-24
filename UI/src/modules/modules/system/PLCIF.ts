import { bytesToFormatted } from "@libCommon";
import { Err, Ok, type Result } from "@libResult";
import { Module, registerModule } from "@module/module";

type PLCIFPreConfig = {
  x1Address: string;
  x2Address: string;
};

export class PLCIF extends Module {
  readonly x1Address: string = "";
  readonly x2Address: string = "";

  preConfigTransform(
    configs: Partial<PLCIFPreConfig>
  ): Result<PLCIFPreConfig, string> {
    if (typeof configs["x1Address"] !== "number")
      return Err("Invalid or missing x1Address");
    if (typeof configs["x2Address"] !== "number")
      return Err("Invalid or missing x2Address");
    //@ts-expect-error
    this.x1Address = configs["x1Address"];
    //@ts-expect-error
    this.x2Address = configs["x2Address"];
    return Ok({
      x1Address: configs["x1Address"],
      x2Address: configs["x2Address"],
    });
  }

  get name() {
    return "System PLC";
  }

  /**Returns whether the module has settings*/
  get hasStatusValues() {
    return true;
  }

  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return (values: any[]) => {
      let date = new Date(values[2] * 1000);
      return (
        "CPU Load:" +
        values[0] +
        "% Sd Card:" +
        (values[1] ? "Attached " : "Detached ") +
        "PLC Clock UTC:" +
        date.toLocaleString(undefined, {
          timeZone: "UTC",
          hour12: false,
        }) +
        ("x2Address" in this ? " x1Load" : " Network") +
        " Up:" +
        bytesToFormatted(values[3], 1) +
        "/s Down:" +
        bytesToFormatted(values[4], 1) +
        "/s " +
        ("x2Address" in this
          ? "x2Load Up:" +
            bytesToFormatted(values[5], 1) +
            "/s Down:" +
            bytesToFormatted(values[6], 1) +
            "/s"
          : "")
      );
    };
  }
}
registerModule("PLCIF", PLCIF);
