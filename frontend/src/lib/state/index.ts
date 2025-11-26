import { state_array_res } from "./array/res";
import { state_array_ros } from "./array/ros";
import { state_array_shared } from "./array/shared";
import { state_collects_number } from "./collected/number";
import { state_collected_rea } from "./collected/rea";
import { state_collected_res } from "./collected/res";
import { state_collected_roa } from "./collected/roa";
import { state_collected_ros } from "./collected/ros";
import { state_delayed_rea } from "./delayed/rea";
import { state_delayed_roa } from "./delayed/roa";
import { state_helpers } from "./helpers";
import { state_lazy_res } from "./lazy/res";
import { state_lazy_ros } from "./lazy/ros";
import { state_proxy_rea } from "./proxy/rea";
import { state_proxy_res } from "./proxy/res";
import { state_proxy_roa } from "./proxy/roa";
import { state_proxy_ros } from "./proxy/ros";
import { state_resource_rea } from "./resource/rea";
import { state_resource_roa } from "./resource/roa";
import { state_sync_res } from "./sync/res";
import { state_sync_ros } from "./sync/ros";
import type { STATE_ROA_WA, STATE_ROS_WA } from "./types";

export default {
  a: { ...state_array_res, ...state_array_ros, ...state_array_shared },
  /**Collected states, collects values from multiple states and reduces it to one */
  c: {
    rea: state_collected_rea,
    res: state_collected_res,
    roa: state_collected_roa,
    ros: state_collected_ros,
    num: state_collects_number,
  },
  d: { ...state_delayed_rea, ...state_delayed_roa },
  h: state_helpers,
  l: { ...state_lazy_res, ...state_lazy_ros },
  p: {
    ...state_proxy_rea,
    ...state_proxy_res,
    ...state_proxy_roa,
    ...state_proxy_ros,
  },
  r: { ...state_resource_rea, ...state_resource_roa },
  s: { ...state_sync_res, ...state_sync_ros },
  ok: state_sync_ros.ros.ok,
  err: state_sync_res.res.err,
  from: state_sync_res.res.ok,
  ok_ws: state_sync_ros.ros_ws.ok,
  err_ws: state_sync_res.res_ws.err,
  from_ws: state_sync_res.res_ws.ok,
};

export { type STATE_ARRAY_READ, type STATE_ARRAY_WRITE } from "./array/shared";
export { type STATE_COLLECTED_REA } from "./collected/rea";
export { type STATE_COLLECTED_RES } from "./collected/res";
export { type STATE_COLLECTED_ROA } from "./collected/roa";
export { type STATE_COLLECTED_ROS } from "./collected/ros";
export {
  type STATE_DELAYED_REA,
  type STATE_DELAYED_REA_WA,
  type STATE_DELAYED_REA_WS,
} from "./delayed/rea";
export {
  type STATE_DELAYED_ROA,
  type STATE_DELAYED_ROA_WA,
  type STATE_DELAYED_ROA_WS,
} from "./delayed/roa";
export {
  type STATE_ENUM_HELPER,
  type STATE_ENUM_RELATED,
  type STATE_NUMBER_HELPER,
  type STATE_NUMBER_RELATED,
  type STATE_STRING_HELPER,
  type STATE_STRING_RELATED,
} from "./helpers";
export { type STATE_LAZY_RES, type STATE_LAZY_RES_WS } from "./lazy/res";
export { type STATE_LAZY_ROS, type STATE_LAZY_ROS_WS } from "./lazy/ros";
export {
  type STATE_PROXY_REA,
  type STATE_PROXY_REA_WA,
  type STATE_PROXY_REA_WS,
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
export {
  type ROS as STATE_SYNC_ROS,
  type ROS_WS as STATE_SYNC_ROS_WS,
} from "./sync/ros";

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

//      ________   _________ ______ _   _  _____ _____ ____  _   _    _____ _                _____ _____ ______  _____
//     |  ____\ \ / /__   __|  ____| \ | |/ ____|_   _/ __ \| \ | |  / ____| |        /\    / ____/ ____|  ____|/ ____|
//     | |__   \ V /   | |  | |__  |  \| | (___   | || |  | |  \| | | |    | |       /  \  | (___| (___ | |__  | (___
//     |  __|   > <    | |  |  __| | . ` |\___ \  | || |  | | . ` | | |    | |      / /\ \  \___ \\___ \|  __|  \___ \
//     | |____ / . \   | |  | |____| |\  |____) |_| || |__| | |\  | | |____| |____ / ____ \ ____) |___) | |____ ____) |
//     |______/_/ \_\  |_|  |______|_| \_|_____/|_____\____/|_| \_|  \_____|______/_/    \_\_____/_____/|______|_____/
export type { STATE_BASE } from "./base";

async function name(s: STATE_ROA_WA<number>) {
  const v = await s;
  if (s.rsync) {
    let w = s.get();
  }
}

name({} as STATE_ROS_WA<number>);
