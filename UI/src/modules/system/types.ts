export type ModuleManagerOptions = {
  ipAddress: string;
  type?: ConnectionType;
  accessToken?: string;
  simulatedIp?: string;
  permanent?: boolean;
};

/**The possible types of connections*/
export const ConnectionType = {
  SETTINGS: "S",
  FIXED: "F",
  FIXEDSIMULATED: "f",
} as const;
export type ConnectionType =
  (typeof ConnectionType)[keyof typeof ConnectionType];
export let connectionTypeCheck: string[] = Object.values(ConnectionType);

export let connectionTypeList: { text: string; value: string }[] = [
  { text: "Settings", value: "S" },
  { text: "Fixed", value: "F" },
];
export let connectionTypeListAdmin: { text: string; value: string }[] = [
  { text: "Settings", value: "S" },
  { text: "Fixed", value: "F" },
  { text: "Fixed Simulated", value: "f" },
];

export type ModuleManagerSaveData = {
  permanent: boolean;
  ipAddress: string;
  master: boolean;
  type: ConnectionType;
  accessToken: string;
  simulatedIp?: string;
};
