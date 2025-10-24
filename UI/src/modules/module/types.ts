/**Value format values*/
// export let ModuleValueType = {
//   Null: 0,
//   DIG: 1,
//   SIG32: 2,
//   UNS32: 3,
//   SIG64: 4,
//   UNS64: 5,
//   ENUM: 6,
//   FLT32: 7,
// };

/**Value format values*/
export const ModuleValueTypeShort = {
  NONE: "Null",
  DIGITAL: "DIG",
  SIGNED32: "SIG32",
  UNSIGNED32: "UNS32",
  SIGNED64: "SIG64",
  UNSIGNED64: "UNS64",
  ENUM: "ENUM",
  FLOAT32: "FLT32",
};
export type ModuleValueTypeShort =
  (typeof ModuleValueTypeShort)[keyof typeof ModuleValueTypeShort];

/**Value format values*/
export const ModuleValueTypeShortIndex = [
  "Null",
  "DIG",
  "SIG32",
  "UNS32",
  "SIG64",
  "UNS64",
  "ENUM",
  "FLT32",
];

/**Object containing different access types*/
export type ServerAccessType = {
  /*value access to set value*/
  value: boolean;
  /*config access to change config of module*/
  config: boolean;
  /*command access to send commands to module*/
  command: boolean;
  /*viewing access to view info about module*/
  viewing: boolean;
  a5: boolean;
};

/**The different access types*/
export const ServerAccessTypes = {
  VALUE: 0,
  CONFIG: 1,
  COMMAND: 2,
  VIEWING: 3,
  a5: 4,
};
export type ServerAccessTypes =
  (typeof ServerAccessTypes)[keyof typeof ServerAccessTypes];
