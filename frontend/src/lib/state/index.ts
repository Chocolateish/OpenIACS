import { STATE_ARRAY_RES } from "./array/res";
import { STATE_ARRAY_ROS } from "./array/ros";
import { STATE_ARRAY_SHARED } from "./array/shared";
import { StateBase } from "./base";
import { STATE_COLLECTS_NUMBER } from "./collected/number";
import { STATE_COLLECTED_REA } from "./collected/rea";
import { STATE_COLLECTED_RES } from "./collected/res";
import { STATE_COLLECTED_ROA } from "./collected/roa";
import { STATE_COLLECTED_ROS } from "./collected/ros";
import { STATE_DELAYED_REA } from "./delayed/rea";
import { STATE_DELAYED_ROA } from "./delayed/roa";
import { STATE_HELPERS } from "./helpers";
import { STATE_LAZY_RES } from "./lazy/res";
import { STATE_LAZY_ROS } from "./lazy/ros";
import { STATE_PROXY_REA } from "./proxy/rea";
import { STATE_PROXY_RES } from "./proxy/res";
import { STATE_PROXY_ROA } from "./proxy/roa";
import { STATE_PROXY_ROS } from "./proxy/ros";
import { STATE_RESOURCE_REA } from "./resource/rea";
import { STATE_RESOURCE_ROA } from "./resource/roa";
import { STATE_SYNC_RES } from "./sync/res";
import { STATE_SYNC_ROS } from "./sync/ros";
import type { State } from "./types";

export default {
  a: { ...STATE_ARRAY_RES, ...STATE_ARRAY_ROS, ...STATE_ARRAY_SHARED },
  /**Collected states, collects values from multiple states and reduces it to one */
  c: {
    rea: STATE_COLLECTED_REA,
    res: STATE_COLLECTED_RES,
    roa: STATE_COLLECTED_ROA,
    ros: STATE_COLLECTED_ROS,
    num: STATE_COLLECTS_NUMBER,
  },
  d: { ...STATE_DELAYED_REA, ...STATE_DELAYED_ROA },
  h: STATE_HELPERS,
  l: { ...STATE_LAZY_RES, ...STATE_LAZY_ROS },
  p: {
    ...STATE_PROXY_REA,
    ...STATE_PROXY_RES,
    ...STATE_PROXY_ROA,
    ...STATE_PROXY_ROS,
  },
  r: { ...STATE_RESOURCE_REA, ...STATE_RESOURCE_ROA },
  s: { ...STATE_SYNC_RES, ...STATE_SYNC_ROS },
  is(s: any): s is State<any, any> {
    return s instanceof StateBase;
  },
  class: StateBase,
  ok: STATE_SYNC_ROS.ros.ok,
  err: STATE_SYNC_RES.res.err,
  from: STATE_SYNC_RES.res.ok,
  ok_ws: STATE_SYNC_ROS.ros_ws.ok,
  err_ws: STATE_SYNC_RES.res_ws.err,
  from_ws: STATE_SYNC_RES.res_ws.ok,
};

export { type StateArrayRead, type StateArrayWrite } from "./array/shared";
export { StateBase } from "./base";
export { type StateCollectedREA } from "./collected/rea";
export { type StateCollectedRES } from "./collected/res";
export { type StateCollectedROA } from "./collected/roa";
export { type StateCollectedROS } from "./collected/ros";
export {
  type StateDelayedREA,
  type StateDelayedREAWA,
  type StateDelayedREAWS,
} from "./delayed/rea";
export {
  type StateDelayedROA,
  type StateDelayedROAWA,
  type StateDelayedROAWS,
} from "./delayed/roa";
export {
  StateEnumHelper,
  StateNumberHelper,
  StateStringHelper,
  type StateEnumRelated,
  type StateNumberRelated,
  type StateStringRelated,
} from "./helpers";
export { type StateLazyRES, type StateLazyRESWS } from "./lazy/res";
export { type StateLazyROS, type StateLazyROSWS } from "./lazy/ros";
export {
  type StateProxyREA,
  type StateProxyREAWA,
  type StateProxyREAWS,
} from "./proxy/rea";
export {
  type StateProxyRES,
  type StateProxyRESWA,
  type StateProxyRESWS,
} from "./proxy/res";
export {
  type StateProxyROA,
  type StateProxyROAWA,
  type StateProxyROAWS,
} from "./proxy/roa";
export {
  type StateProxyROS,
  type StateProxyROSWA,
  type StateProxyROSWS,
} from "./proxy/ros";
export {
  type StateResourceFuncREA,
  type StateResourceFuncREAWA,
  type StateResourceREA,
  type StateResourceREAWA,
} from "./resource/rea";
export {
  type StateResourceFuncROA,
  type StateResourceROA,
} from "./resource/roa";
export { type StateSyncRES, type StateSyncRESWS } from "./sync/res";
export { type StateSyncROS, type StateSyncROSWS } from "./sync/ros";

//       _____ _______    _______ ______   _________     _______  ______  _____
//      / ____|__   __|/\|__   __|  ____| |__   __\ \   / /  __ \|  ____|/ ____|
//     | (___    | |  /  \  | |  | |__       | |   \ \_/ /| |__) | |__  | (___
//      \___ \   | | / /\ \ | |  |  __|      | |    \   / |  ___/|  __|  \___ \
//      ____) |  | |/ ____ \| |  | |____     | |     | |  | |    | |____ ____) |
//     |_____/   |_/_/    \_\_|  |______|    |_|     |_|  |_|    |______|_____/
export type {
  State,
  StateInferResult,
  StateInferSub,
  StateInferType,
  StateREA,
  StateREAWA,
  StateREAWS,
  StateRES,
  StateRESWA,
  StateRESWS,
  StateROA,
  StateROAWA,
  StateROAWS,
  StateROS,
  StateROSWA,
  StateROSWS,
  StateSub,
} from "./types";
