/**Possible states for an alarm*/
export const AlarmStates = {
  CLEARED: "Cleared",
  TRIGGERED: "Triggered",
  ACKNOWLEDGED: "Acknowledged",
} as const;
export type AlarmStates = (typeof AlarmStates)[keyof typeof AlarmStates];

/**Possible states for an alarm*/
export const AlarmStatesServer = {
  CLEARED: "C",
  TRIGGERED: "T",
  ACKNOWLEDGED: "A",
} as const;
export type AlarmStatesServer =
  (typeof AlarmStatesServer)[keyof typeof AlarmStatesServer];

export let alarmStatesServerToClient = {
  [AlarmStatesServer.CLEARED]: AlarmStates.CLEARED,
  [AlarmStatesServer.TRIGGERED]: AlarmStates.TRIGGERED,
  [AlarmStatesServer.ACKNOWLEDGED]: AlarmStates.ACKNOWLEDGED,
};

export let alarmStatesValues = Object.values(AlarmStates);
export let alarmStatesKeys = Object.keys(AlarmStates);
