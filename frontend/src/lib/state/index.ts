import { STATE_ARRAY_RES } from "./array/res";
import { state_array_ros } from "./array/ros";
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
  a: { ...STATE_ARRAY_RES, ...state_array_ros, ...STATE_ARRAY_SHARED },
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

export {
  type StateArrayRead as STATE_ARRAY_READ,
  type StateArrayWrite as STATE_ARRAY_WRITE,
} from "./array/shared";
export { StateBase as STATE_BASE } from "./base";
export { type StateCollectedREA as STATE_COLLECTED_REA } from "./collected/rea";
export { type StateCollectedRES as STATE_COLLECTED_RES } from "./collected/res";
export { type StateCollectedROA as STATE_COLLECTED_ROA } from "./collected/roa";
export { type StateCollectedROS as STATE_COLLECTED_ROS } from "./collected/ros";
export {
  type StateDelayedREA as STATE_DELAYED_REA,
  type StateDelayedREAWA as STATE_DELAYED_REA_WA,
  type StateDelayedREAWS as STATE_DELAYED_REA_WS,
} from "./delayed/rea";
export {
  type StateDelayedROA as STATE_DELAYED_ROA,
  type StateDelayedROAWA as STATE_DELAYED_ROA_WA,
  type StateDelayedROAWS as STATE_DELAYED_ROA_WS,
} from "./delayed/roa";
export {
  StateEnumHelper as STATE_ENUM_HELPER,
  StateNumberHelper as STATE_NUMBER_HELPER,
  StateStringHelper as STATE_STRING_HELPER,
  type StateEnumRelated as STATE_ENUM_RELATED,
  type StateNumberRelated as STATE_NUMBER_RELATED,
  type StateStringRelated as STATE_STRING_RELATED,
} from "./helpers";
export {
  type StateLazyRES as STATE_LAZY_RES,
  type StateLazyRESWS as STATE_LAZY_RES_WS,
} from "./lazy/res";
export {
  type StateLazyROS as STATE_LAZY_ROS,
  type StateLazyROSWS as STATE_LAZY_ROS_WS,
} from "./lazy/ros";
export {
  type StateProxyREA as STATE_PROXY_REA,
  type StateProxyREAWA as STATE_PROXY_REA_WA,
  type StateProxyREAWS as STATE_PROXY_REA_WS,
} from "./proxy/rea";
export {
  type StateProxyRES as STATE_PROXY_RES,
  type StateProxyRESWA as STATE_PROXY_RES_WA,
  type StateProxyRESWS as STATE_PROXY_RES_WS,
} from "./proxy/res";
export {
  type StateProxyROA as STATE_PROXY_ROA,
  type StateProxyROAWA as STATE_PROXY_ROA_WA,
  type StateProxyROAWS as STATE_PROXY_ROA_WS,
} from "./proxy/roa";
export {
  type StateProxyROS as STATE_PROXY_ROS,
  type StateProxyROSWA as STATE_PROXY_ROS_WA,
  type StateProxyROSWS as STATE_PROXY_ROS_WS,
} from "./proxy/ros";
export {
  type StateResourceFuncREA as STATE_RESOURCE_FUNC_REA,
  type StateResourceFuncREAWA as STATE_RESOURCE_FUNC_REA_WA,
  type StateResourceREA as STATE_RESOURCE_REA,
  type StateResourceREAWA as STATE_RESOURCE_REA_WA,
} from "./resource/rea";
export {
  type StateResourceFuncROA as STATE_RESOURCE_FUNC_ROA,
  type StateResourceROA as STATE_RESOURCE_ROA,
} from "./resource/roa";
export {
  type StateSyncRES as STATE_SYNC_RES,
  type StateSyncRESWS as STATE_SYNC_RES_WS,
} from "./sync/res";
export {
  type StateSyncROS as STATE_SYNC_ROS,
  type StateSyncROSWS as STATE_SYNC_ROS_WS,
} from "./sync/ros";

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
