import {
  StateEnumHelper,
  StateNumberHelper,
  StateStringHelper,
  type StateEnumHelperAnyType,
  type StateEnumHelperList,
  type StateEnumHelperType,
  type StateNumberHelperType,
  type StateStringHelperType,
} from "./helpers";
import * as normal from "./state";
import { StateBase } from "./stateBase";
import * as delayed from "./stateDelayed";
import * as lazy from "./stateLazy";
import type {
  StateRead,
  StateReadBase,
  StateReadOk,
  StateSetter,
  StateSetterOk,
  StateWrite,
  StateWriteBase,
  StateWriteOk,
} from "./types";

//       _____ _        _         _____       _ _   _       _ _
//      / ____| |      | |       |_   _|     (_) | (_)     | (_)
//     | (___ | |_ __ _| |_ ___    | |  _ __  _| |_ _  __ _| |_ _______ _ __ ___
//      \___ \| __/ _` | __/ _ \   | | | '_ \| | __| |/ _` | | |_  / _ \ '__/ __|
//      ____) | || (_| | ||  __/  _| |_| | | | | |_| | (_| | | |/ /  __/ |  \__ \
//     |_____/ \__\__,_|\__\___| |_____|_| |_|_|\__|_|\__,_|_|_/___\___|_|  |___/
export let state = {
  from: normal.from,
  ok: normal.ok,
  err: normal.err,
  from_result: normal.from_result,
  from_result_ok: normal.from_result_ok,
};

//       _____ _        _         _                       _____       _ _   _       _ _
//      / ____| |      | |       | |                     |_   _|     (_) | (_)     | (_)
//     | (___ | |_ __ _| |_ ___  | |     __ _ _____   _    | |  _ __  _| |_ _  __ _| |_ _______ _ __ ___
//      \___ \| __/ _` | __/ _ \ | |    / _` |_  / | | |   | | | '_ \| | __| |/ _` | | |_  / _ \ '__/ __|
//      ____) | || (_| | ||  __/ | |___| (_| |/ /| |_| |  _| |_| | | | | |_| | (_| | | |/ /  __/ |  \__ \
//     |_____/ \__\__,_|\__\___| |______\__,_/___|\__, | |_____|_| |_|_|\__|_|\__,_|_|_/___\___|_|  |___/
//                                                 __/ |
//                                                |___/
export let state_lazy = {
  from: lazy.from,
  ok: lazy.ok,
  err: lazy.err,
  from_result: lazy.from_result,
  from_result_ok: lazy.from_result_ok,
};

//       _____ _        _         _____       _                      _   _____       _ _   _       _ _
//      / ____| |      | |       |  __ \     | |                    | | |_   _|     (_) | (_)     | (_)
//     | (___ | |_ __ _| |_ ___  | |  | | ___| | __ _ _   _  ___  __| |   | |  _ __  _| |_ _  __ _| |_ _______ _ __ ___
//      \___ \| __/ _` | __/ _ \ | |  | |/ _ \ |/ _` | | | |/ _ \/ _` |   | | | '_ \| | __| |/ _` | | |_  / _ \ '__/ __|
//      ____) | || (_| | ||  __/ | |__| |  __/ | (_| | |_| |  __/ (_| |  _| |_| | | | | |_| | (_| | | |/ /  __/ |  \__ \
//     |_____/ \__\__,_|\__\___| |_____/ \___|_|\__,_|\__, |\___|\__,_| |_____|_| |_|_|\__|_|\__,_|_|_/___\___|_|  |___/
//                                                     __/ |
//                                                    |___/

export let state_delayed = {
  from: delayed.from,
  ok: delayed.ok,
  err: delayed.err,
  from_result: delayed.from_result,
  from_result_ok: delayed.from_result_ok,
};

//      _    _      _
//     | |  | |    | |
//     | |__| | ___| |_ __   ___ _ __ ___
//     |  __  |/ _ \ | '_ \ / _ \ '__/ __|
//     | |  | |  __/ | |_) |  __/ |  \__ \
//     |_|  |_|\___|_| .__/ \___|_|  |___/
//                   | |
//                   |_|
export { isState, isStateOk, isStateSync, isStateSyncOk } from "./stateBase";

//       _____ _        _         _______
//      / ____| |      | |       |__   __|
//     | (___ | |_ __ _| |_ ___     | |_   _ _ __   ___  ___
//      \___ \| __/ _` | __/ _ \    | | | | | '_ \ / _ \/ __|
//      ____) | || (_| | ||  __/    | | |_| | |_) |  __/\__ \
//     |_____/ \__\__,_|\__\___|    |_|\__, | .__/ \___||___/
//                                      __/ | |
//                                     |___/|_|
export type {
  StateRead,
  StateReadOk,
  StateSetter,
  StateSetterOk,
  StateWrite,
  StateWriteOk,
};

//      ______      _                 _                _____ _
//     |  ____|    | |               (_)              / ____| |
//     | |__  __  _| |_ ___ _ __  ___ _  ___  _ __   | |    | | __ _ ___ ___  ___  ___
//     |  __| \ \/ / __/ _ \ '_ \/ __| |/ _ \| '_ \  | |    | |/ _` / __/ __|/ _ \/ __|
//     | |____ >  <| ||  __/ | | \__ \ | (_) | | | | | |____| | (_| \__ \__ \  __/\__ \
//     |______/_/\_\\__\___|_| |_|___/_|\___/|_| |_|  \_____|_|\__,_|___/___/\___||___/
export let classes = {
  StateBase,
  StateNumberHelper,
  StateStringHelper,
  StateEnumHelper,
};

//      ______      _                 _               _______
//     |  ____|    | |               (_)             |__   __|
//     | |__  __  _| |_ ___ _ __  ___ _  ___  _ __      | |_   _ _ __   ___  ___
//     |  __| \ \/ / __/ _ \ '_ \/ __| |/ _ \| '_ \     | | | | | '_ \ / _ \/ __|
//     | |____ >  <| ||  __/ | | \__ \ | (_) | | | |    | | |_| | |_) |  __/\__ \
//     |______/_/\_\\__\___|_| |_|___/_|\___/|_| |_|    |_|\__, | .__/ \___||___/
//                                                          __/ | |
//                                                         |___/|_|
export type {
  StateEnumHelperAnyType,
  StateEnumHelperList,
  StateEnumHelperType,
  StateNumberHelper,
  StateNumberHelperType,
  StateReadBase,
  StateStringHelperType,
  StateWriteBase,
};
