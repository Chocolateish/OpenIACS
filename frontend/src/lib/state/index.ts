import { state_array_res } from "./array/res";
import { state_array_ros } from "./array/ros";
import { state_array_shared } from "./array/shared";
import { state_collected } from "./collected/collected";
import { state_delayed_rea } from "./delayed/rea";
import { state_delayed_roa } from "./delayed/roa";
import { state_helpers } from "./helpers";
import { state_lazy } from "./lazy";
import { state_proxy_rea } from "./proxy/rea";
import { state_proxy_res } from "./proxy/res";
import { state_proxy_roa } from "./proxy/roa";
import { state_proxy_ros } from "./proxy/ros";
import { state_resource_rea } from "./resource/rea";
import { state_resource_roa } from "./resource/roa";
import { state_sync } from "./sync";

export default {
  a: { ...state_array_res, ...state_array_ros, ...state_array_shared },
  c: state_collected,
  d: { ...state_delayed_rea, ...state_delayed_roa },
  h: state_helpers,
  l: state_lazy,
  p: {
    ...state_proxy_rea,
    ...state_proxy_res,
    ...state_proxy_roa,
    ...state_proxy_ros,
  },
  r: { ...state_resource_rea, ...state_resource_roa },
  s: state_sync,
  ok: state_sync.ros.ok,
  err: state_sync.res.err,
  from: state_sync.res.ok,
  ok_ws: state_sync.ros_ws.ok,
  err_ws: state_sync.res_ws.err,
  from_ws: state_sync.res_ws.ok,
};

export { type STATE_ARRAY_READ, type STATE_ARRAY_WRITE } from "./array/shared";
export {
  type STATE_COLLECTED_REA as STATE_CALCULATED_REA,
  type STATE_COLLECTED_ROA as STATE_CALCULATED_ROA,
} from "./collected/collected";
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
export {
  type STATE_LAZY_RES,
  type STATE_LAZY_RES_WS,
  type STATE_LAZY_ROS,
  type STATE_LAZY_ROS_WS,
} from "./lazy";
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
export {
  type STATE_SYNC_RES,
  type STATE_SYNC_RES_WS,
  type STATE_SYNC_ROS,
  type STATE_SYNC_ROS_WS,
} from "./sync";

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
  STATE_REX,
  STATE_REX_WA,
  STATE_REX_WS,
  STATE_REX_WX,
  STATE_ROX,
  STATE_ROX_WA,
  STATE_ROX_WS,
  STATE_ROX_WX,
  STATE_RXA,
  STATE_RXA_WA,
  STATE_RXA_WS,
  STATE_RXA_WX,
  STATE_RXS,
  STATE_RXS_WA,
  STATE_RXS_WS,
  STATE_RXS_WX,
  STATE_RXX_WA,
  STATE_RXX_WS,
  STATE_RXX_WX,
  STATE_SUB,
} from "./types";

//      ________   _________ ______ _   _  _____ _____ ____  _   _    _____ _                _____ _____ ______  _____
//     |  ____\ \ / /__   __|  ____| \ | |/ ____|_   _/ __ \| \ | |  / ____| |        /\    / ____/ ____|  ____|/ ____|
//     | |__   \ V /   | |  | |__  |  \| | (___   | || |  | |  \| | | |    | |       /  \  | (___| (___ | |__  | (___
//     |  __|   > <    | |  |  __| | . ` |\___ \  | || |  | | . ` | | |    | |      / /\ \  \___ \\___ \|  __|  \___ \
//     | |____ / . \   | |  | |____| |\  |____) |_| || |__| | |\  | | |____| |____ / ____ \ ____) |___) | |____ ____) |
//     |______/_/ \_\  |_|  |______|_| \_|_____/|_____\____/|_| \_|  \_____|______/_/    \_\_____/_____/|______|_____/
export type { STATE_BASE } from "./base";
