import { STATE_ARRAY_RES } from "./array/res";
import { state_array_ros } from "./array/ros";
import { STATE_ARRAY_SHARED } from "./array/shared";
import { STATE_BASE } from "./base";
import { STATE_COLLECTS_NUMBER } from "./collected/number";
import { STATE_COLLECTED_REA } from "./collected/rea";
import { STATE_COLLECTED_RES } from "./collected/res";
import { STATE_COLLECTED_ROA } from "./collected/roa";
import { STATE_COLLECTED_ROS } from "./collected/ros";
import { STATE_DELAYED_REA } from "./delayed/rea";
import { STATE_DELAYED_ROA } from "./delayed/roa";
import { state_helpers } from "./helpers";
import { STATE_LAZY_RES } from "./lazy/res";
import { state_lazy_ros } from "./lazy/ros";
import { STATE_PROXY_REA } from "./proxy/rea";
import { state_proxy_res } from "./proxy/res";
import { state_proxy_roa } from "./proxy/roa";
import { state_proxy_ros } from "./proxy/ros";
import { state_resource_rea } from "./resource/rea";
import { state_resource_roa } from "./resource/roa";
import { state_sync_res } from "./sync/res";
import { state_sync_ros } from "./sync/ros";
import type { STATE } from "./types";

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
  h: state_helpers,
  l: { ...STATE_LAZY_RES, ...state_lazy_ros },
  p: {
    ...STATE_PROXY_REA,
    ...state_proxy_res,
    ...state_proxy_roa,
    ...state_proxy_ros,
  },
  r: { ...state_resource_rea, ...state_resource_roa },
  s: { ...state_sync_res, ...state_sync_ros },
  is(s: any): s is STATE<any, any> {
    return s instanceof STATE_BASE;
  },
  class: STATE_BASE,
  ok: state_sync_ros.ros.ok,
  err: state_sync_res.res.err,
  from: state_sync_res.res.ok,
  ok_ws: state_sync_ros.ros_ws.ok,
  err_ws: state_sync_res.res_ws.err,
  from_ws: state_sync_res.res_ws.ok,
};

export {
  type StateArrayRead as STATE_ARRAY_READ,
  type StateArrayWrite as STATE_ARRAY_WRITE,
} from "./array/shared";
export { STATE_BASE } from "./base";
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
  STATE_ENUM_HELPER,
  STATE_NUMBER_HELPER,
  STATE_STRING_HELPER,
  type STATE_ENUM_RELATED,
  type STATE_NUMBER_RELATED,
  type STATE_STRING_RELATED,
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
  type STATE_PROXY_RES,
  type STATE_PROXY_RES_WA,
  type STATE_PROXY_RES_WS,
} from "./proxy/res";
export {
  type STATE_PROXY_ROA,
  type STATE_PROXY_ROA_WA,
  type STATE_PROXY_ROA_WS,
} from "./proxy/roa";
export {
  type STATE_PROXY_ROS,
  type STATE_PROXY_ROS_WA,
  type STATE_PROXY_ROS_WS,
} from "./proxy/ros";
export {
  type STATE_RESOURCE_FUNC_REA,
  type STATE_RESOURCE_FUNC_REA_WA,
  type STATE_RESOURCE_REA,
  type STATE_RESOURCE_REA_WA,
} from "./resource/rea";
export {
  type STATE_RESOURCE_FUNC_ROA,
  type STATE_RESOURCE_ROA,
} from "./resource/roa";
export { type STATE_SYNC_RES, type STATE_SYNC_RES_WS } from "./sync/res";
export { type STATE_SYNC_ROS, type STATE_SYNC_ROS_WS } from "./sync/ros";

//       _____ _______    _______ ______   _________     _______  ______  _____
//      / ____|__   __|/\|__   __|  ____| |__   __\ \   / /  __ \|  ____|/ ____|
//     | (___    | |  /  \  | |  | |__       | |   \ \_/ /| |__) | |__  | (___
//      \___ \   | | / /\ \ | |  |  __|      | |    \   / |  ___/|  __|  \___ \
//      ____) |  | |/ ____ \| |  | |____     | |     | |  | |    | |____ ____) |
//     |_____/   |_/_/    \_\_|  |______|    |_|     |_|  |_|    |______|_____/
export type {
  STATE,
  STATE_INFER_RESULT,
  STATE_INFER_SUB,
  STATE_INFER_TYPE,
  STATE_REA,
  STATE_REA_WA,
  STATE_REA_WS,
  STATE_RES,
  STATE_RES_WA,
  STATE_RES_WS,
  STATE_ROA,
  STATE_ROA_WA,
  STATE_ROA_WS,
  STATE_ROS,
  STATE_ROS_WA,
  STATE_ROS_WS,
  STATE_SUB,
} from "./types";
