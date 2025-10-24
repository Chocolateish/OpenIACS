import type { ModuleDesignator, ModuleManagerBase } from "@modCommon";

/**Defines the decoder for initial data
 * the module manager is passed as manager
 * the object where data is stored is passed as  a reference, so anything saved to it must be saved as a key
 * the data from the server is passed as data*/
type InitialDataDecoder = (
  manager: ModuleManagerBase,
  storage: { [key: string]: any },
  data: { [key: string]: any }
) => void;

export let initialDataDecoders: { [key: string]: InitialDataDecoder } = {};

/**Registers a decoder for initial data, which is sent by the server module manager
 * @param  designator the designator for the data
 * @param  decoder function used to decode*/
export let registerInitialDataDecoder = (
  designator: ModuleDesignator,
  decoder: InitialDataDecoder
) => {
  if (typeof designator !== "string") {
    console.warn("Designator must be string");
    return;
  }
  if (typeof decoder !== "function") {
    console.warn("Decoder must be function");
    return;
  }
  if (designator in initialDataDecoders)
    throw new Error("Designator already registered");
  initialDataDecoders[designator] = decoder;
};
