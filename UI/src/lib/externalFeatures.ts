import { throttle } from "@libCommon";
import { Value } from "@libValues";

let localAddress = "http://localhost:43876";

/**Stores whether external brightness is supported*/
export let externalBrightnessSupported = new Value(false);

/**Controls external brightness*/
export let externalBrightness = new Value(50, (val) => {
  if (typeof val === "number") {
    return Math.min(Math.max(val, 0), 100);
  } else {
    return;
  }
});

/**Stores whether external buzzer is supported*/
export let externalBuzzerSupported = new Value(false);

/**Controls the external buzzer
 * pass true or false to turn on and off buzzer
 * pass a number to run the buzzer at that frequency, and 0 for off */
export let externalBuzzer = new Value(false, (val) => {
  switch (typeof val) {
    case "boolean":
      return val;
    case "number":
      return Math.min(Math.max(val, 0), 15000);
    default:
      return;
  }
});

/**Sends command to  */
export let externalFeatureExportSupported = new Value(false);
export let externalFeatureRunExport = () => {
  if (externalFeatureExportSupported.get) {
    fetch(localAddress, { method: "POST", body: `{"export":true}` });
  }
};

let buzzFunc;
let briFunc;

(async () => {
  try {
    let supports = await (
      await fetch(localAddress, { method: "POST", body: '{ "features":1 }' })
    ).json();
    if ("features" in supports) {
      let features = supports["features"];
      if (features.includes("buzzer")) {
        externalBuzzerSupported.set = true;
        buzzFunc = externalBuzzer.addListener((val) => {
          fetch(localAddress, { method: "POST", body: `{"buzzer":${val}}` });
        }, true);
      } else {
        externalBuzzerSupported.set = false;
        if (buzzFunc) {
          externalBuzzer.removeListener(buzzFunc);
        }
      }
      if (features.includes("brightness")) {
        briFunc = externalBrightness.addListener(
          throttle(
            (val) => {
              fetch(localAddress, {
                method: "POST",
                body: `{"brightness":${val}}`,
              });
            },
            700,
            { trailing: true }
          ),
          false
        );
        (async () => {
          let brightness = await (
            await fetch(localAddress, {
              method: "POST",
              body: `{"brightness":false}`,
            })
          ).json();
          externalBrightness.set = brightness["brightness"];
          externalBrightnessSupported.set = true;
        })();
      } else {
        externalBrightnessSupported.set = false;
        if (briFunc) {
          externalBrightness.removeListener(briFunc);
        }
      }
      if (features.includes("export")) {
        externalFeatureExportSupported.set = true;
      }
    }
  } catch (error) {}
})();
