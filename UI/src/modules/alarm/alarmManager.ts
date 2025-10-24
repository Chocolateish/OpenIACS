import { EventHandler } from "@libEvent";
import { externalBuzzer } from "@libExtFeat";
import { Value } from "@libValues";
import { ASALA, ASALL } from "@modules/alarm";
import { ModuleManager } from "@system/moduleManager";
import {
  globalEventHandler,
  managersRunFunction,
} from "@system/moduleManagerManager";
import {
  AlarmStates,
  AlarmStatesServer,
  alarmStatesServerToClient,
} from "./types";
import { allowAlarmBuzzer } from "./watchSystem";

export let globalAlarmEventHandler = new EventHandler<
  {
    FirstTriggered: { alarm: ASALA };
    FirstAcknowledge: { alarm: ASALA };
    FirstRetriggered: { alarm: ASALA };
    frt: {};
    allClear: {};
  },
  {}
>({});

globalEventHandler.on("synced", (ev) => {
  ev.target.sendMessage("As");
  return false;
});

globalEventHandler.on(
  "message",
  (ev) => {
    for (let key in ev.data.data) {
      let alarm = ev.target.getModuleByUID(Number(key));
      if (alarm instanceof ASALA) {
        let state =
          alarmStatesServerToClient[
            ev.data.data[key][0] as keyof typeof alarmStatesServerToClient
          ];
        switch (ev.data.data[key][0]) {
          //@ts-expect-error
          case AlarmStatesServer.TRIGGERED:
            let test = allowAlarmBuzzer();
            alarmBuzzer.set = test;
          case AlarmStatesServer.ACKNOWLEDGED:
            alarm.trigTime = new Date(ev.data.data[key][1] * 1000);
            break;
        }
        alarm.state = state;
        if (state === AlarmStates.TRIGGERED) {
          globalAlarmEventHandler.emit("FirstTriggered", { alarm });
          __triggeredAlarms.unshift(alarm);
        }
        if (state === AlarmStates.ACKNOWLEDGED) {
          globalAlarmEventHandler.emit("FirstAcknowledge", { alarm });
          __acknowledgedAlarms.unshift(alarm);
        }
      } else {
        console.warn(
          `Module with UID ${key} not found or is not an ASALA instance`
        );
      }
    }
    return false;
  },
  ["A", "s"]
);

globalEventHandler.on(
  "message",
  (ev) => {
    for (let i = 0; i < ev.data.data["ids"].length; i++) {
      let alarm = ev.target.getModuleByUID(ev.data.data["ids"][i]);
      if (alarm instanceof ASALA)
        __triggerAlarm(alarm, new Date(ev.data.data["time"] * 1000));
    }
    return false;
  },
  ["A", AlarmStatesServer.TRIGGERED]
);

globalEventHandler.on(
  "message",
  (ev) => {
    for (let i = 0; i < ev.data.data["ids"].length; i++) {
      let alarm = ev.target.getModuleByUID(ev.data.data["ids"][i]);
      if (alarm instanceof ASALA) __acknowledgeAlarm(alarm);
    }
    return false;
  },
  ["A", AlarmStatesServer.ACKNOWLEDGED]
);

globalEventHandler.on(
  "message",
  (ev) => {
    for (let i = 0; i < ev.data.data["ids"].length; i++) {
      let alarm = ev.target.getModuleByUID(ev.data.data["ids"][i]);
      if (alarm instanceof ASALA) __clearAlarm(alarm);
    }
    return false;
  },
  ["A", AlarmStatesServer.CLEARED]
);

globalEventHandler.on(
  "message",
  () => {
    alarmBuzzer.set = true;
    return false;
  },
  ["A", "B"]
);

globalEventHandler.on(
  "message",
  () => {
    alarmBuzzer.set = true;
    return false;
  },
  ["A", "B", "G"]
);

globalEventHandler.on(
  "message",
  () => {
    alarmBuzzer.set = false;
    return false;
  },
  ["A", "S"]
);

globalEventHandler.on("closed", (ev) => {
  let stor = (ev.target as ModuleManager).getPluginStorage("ALARM");
  if ("asreg" in stor) {
    let lists = stor.asreg.children;
    for (let i = 0; i < lists.length; i++)
      if (lists[i] instanceof ASALL) {
        let alarms = lists[i].children;
        for (let y = 0; y < alarms.length; y++)
          if (alarms[y] instanceof ASALA) __clearAlarm(alarms[y]);
      }
  }
  return false;
});

/**Changes the state of the given alarm to triggered*/
let __triggerAlarm = (alarm: ASALA, time: Date) => {
  let test = allowAlarmBuzzer();
  alarmBuzzer.set = test;
  alarm.trigTime = time;
  let oldState = alarm.state;
  alarm.state = AlarmStates.TRIGGERED;
  switch (oldState) {
    case AlarmStates.CLEARED: {
      __triggeredAlarms.unshift(alarm);
      alarm.emitTOBEREMOVED("STATE", {
        state: AlarmStates.TRIGGERED,
        oldState,
      });
      globalAlarmEventHandler.emit("FirstTriggered", { alarm });
      break;
    }
    case AlarmStates.ACKNOWLEDGED: {
      let index = __acknowledgedAlarms.indexOf(alarm);
      if (index != -1) __acknowledgedAlarms.splice(index, 1);
      __triggeredAlarms.unshift(alarm);
      alarm.emitTOBEREMOVED("STATE", {
        state: AlarmStates.TRIGGERED,
        oldState,
      });
      globalAlarmEventHandler.emit("FirstTriggered", { alarm });
      break;
    }
  }
};

/**Changes the state of the given alarm to acknowledged*/
let __acknowledgeAlarm = (alarm: ASALA) => {
  alarmBuzzer.set = false;
  let oldState = alarm.state;
  alarm.state = AlarmStates.ACKNOWLEDGED;
  switch (oldState) {
    case AlarmStates.TRIGGERED: {
      let index = __triggeredAlarms.indexOf(alarm);
      if (index != -1) __triggeredAlarms.splice(index, 1);

      __acknowledgedAlarms.unshift(alarm);
      alarm.emitTOBEREMOVED("STATE", {
        state: AlarmStates.ACKNOWLEDGED,
        oldState,
      });
      break;
    }
    case AlarmStates.CLEARED: {
      __acknowledgedAlarms.unshift(alarm);
      alarm.emitTOBEREMOVED("STATE", {
        state: AlarmStates.ACKNOWLEDGED,
        oldState,
      });
      globalAlarmEventHandler.emit("FirstTriggered", { alarm });
      break;
    }
  }
};

/**Changes the state of the given alarm to cleared*/
let __clearAlarm = (alarm: ASALA) => {
  alarmBuzzer.set = false;
  let oldState = alarm.state;
  alarm.state = AlarmStates.CLEARED;
  switch (oldState) {
    case AlarmStates.TRIGGERED: {
      let index = __triggeredAlarms.indexOf(alarm);
      if (index != -1) {
        __triggeredAlarms.splice(index, 1);
        alarm.emitTOBEREMOVED("STATE", {
          state: AlarmStates.CLEARED,
          oldState,
        });
        if (__triggeredAlarms.length == 0 && __acknowledgedAlarms.length == 0) {
          globalAlarmEventHandler.emit("allClear", {});
        }
      }
      break;
    }
    case AlarmStates.ACKNOWLEDGED: {
      let index = __acknowledgedAlarms.indexOf(alarm);
      if (index != -1) {
        __acknowledgedAlarms.splice(index, 1);
        alarm.emitTOBEREMOVED("STATE", {
          state: AlarmStates.CLEARED,
          oldState,
        });
        if (__acknowledgedAlarms.length == 0 && __triggeredAlarms.length == 0) {
          globalAlarmEventHandler.emit("allClear", {});
        }
      }
      break;
    }
  }
};

/** Storage of triggered alarms*/
let __triggeredAlarms: ASALA[] = [];
/** Returns all triggered alarms */
export let triggeredAlarms = (): ASALA[] => {
  return __triggeredAlarms;
};
/** Returns nth triggered alarms from the top*/
export let nthTriggeredAlarm = (nth: number): ASALA => {
  return __triggeredAlarms[nth];
};

/** Storage of triggered alarms */
let __acknowledgedAlarms: ASALA[] = [];
/** Returns all acknowledged alarms */
export let acknowledgedAlarms = (): ASALA[] => {
  return __acknowledgedAlarms;
};
/** Returns nth triggered alarms from the top*/
export let nthAcknowledgedAlarms = (nth: number): ASALA => {
  return __acknowledgedAlarms[nth];
};

/**Handler for alarm buzzer*/
export let alarmBuzzer = new Value(false, (val) => {
  switch (typeof val) {
    case "boolean":
      return val;
    default:
      return;
  }
});
//Listener for changes to alarm buzzer
alarmBuzzer.addListener((val) => {
  externalBuzzer.set = val;
  if (!val) {
    managersRunFunction((man) => {
      let alarmPlugin = man.getPluginStorage("ALARM");
      let group = alarmPlugin.watchGroup.get;
      if (group) {
        man.sendMessage("AS", { group: group.uid });
      } else {
        man.sendMessage("AS");
      }
    });
  }
});
