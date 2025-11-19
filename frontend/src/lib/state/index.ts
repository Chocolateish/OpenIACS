import { state_array } from "./array";
import { state_collected } from "./collected";
import { state_delayed } from "./delayed";
import { state_helpers } from "./helpers";
import { state_lazy } from "./lazy";
import { state_proxy } from "./proxy";
import { state_resource } from "./resource";
import { state_sync } from "./sync";

export default {
  a: state_array,
  c: state_collected,
  d: state_delayed,
  h: state_helpers,
  l: state_lazy,
  p: state_proxy,
  r: state_resource,
  s: state_sync,
};

export { state_array } from "./array";
export {
  state_collected,
  type STATE_COLLECTED_REA as STATE_CALCULATED_REA,
  type STATE_COLLECTED_ROA as STATE_CALCULATED_ROA,
} from "./collected";
export {
  state_delayed,
  type STATE_DELAYED_REA,
  type STATE_DELAYED_REA_WS,
  type STATE_DELAYED_ROA,
  type STATE_DELAYED_ROA_WS,
} from "./delayed";
export {
  state_helpers,
  type STATE_ENUM_HELPER,
  type STATE_ENUM_HELPER_LIST,
  type STATE_ENUM_RELATED,
  type STATE_NUMBER_HELPER,
  type STATE_NUMBER_RELATED,
  type STATE_STRING_HELPER,
  type STATE_STRING_RELATED,
} from "./helpers";
export {
  state_lazy,
  type STATE_LAZY_RES,
  type STATE_LAZY_RES_WS,
  type STATE_LAZY_ROS,
  type STATE_LAZY_ROS_WS,
} from "./lazy";
export {
  state_proxy,
  type STATE_PROXY_REA,
  type STATE_PROXY_RES,
  type STATE_PROXY_ROA,
  type STATE_PROXY_ROS,
} from "./proxy";
export {
  state_resource,
  type STATE_RESOURCE_REA,
  type STATE_RESOURCE_REA_WA,
} from "./resource";
export {
  state_sync,
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
  STATE_INFER_SUB_OK,
  STATE_INFER_TYPE,
  STATE_REX,
  STATE_REX_WA,
  STATE_REX_WS,
  STATE_REX_WX,
  STATE_REX_XX,
  STATE_ROX,
  STATE_ROX_WA,
  STATE_ROX_WS,
  STATE_ROX_WX,
  STATE_ROX_XX,
  STATE_RXA,
  STATE_RXA_WA,
  STATE_RXA_WS,
  STATE_RXA_WX,
  STATE_RXA_XX,
  STATE_RXS,
  STATE_RXS_WA,
  STATE_RXS_WS,
  STATE_RXS_WX,
  STATE_RXS_XX,
  STATE_RXX,
  STATE_RXX_WA,
  STATE_RXX_WS,
  STATE_RXX_WX,
  STATE_RXX_XX,
  STATE_SUB,
  STATE_SUB_OK,
} from "./types";

//      ________   _________ ______ _   _  _____ _____ ____  _   _    _____ _                _____ _____ ______  _____
//     |  ____\ \ / /__   __|  ____| \ | |/ ____|_   _/ __ \| \ | |  / ____| |        /\    / ____/ ____|  ____|/ ____|
//     | |__   \ V /   | |  | |__  |  \| | (___   | || |  | |  \| | | |    | |       /  \  | (___| (___ | |__  | (___
//     |  __|   > <    | |  |  __| | . ` |\___ \  | || |  | | . ` | | |    | |      / /\ \  \___ \\___ \|  __|  \___ \
//     | |____ / . \   | |  | |____| |\  |____) |_| || |__| | |\  | | |____| |____ / ____ \ ____) |___) | |____ ____) |
//     |______/_/ \_\  |_|  |______|_| \_|_____/|_____\____/|_| \_|  \_____|______/_/    \_\_____/_____/|______|_____/
export {
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
} from "./types";
