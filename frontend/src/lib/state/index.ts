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
import type { State, StateOk } from "./state";
import * as normal from "./state";
import type { StateArray, StateArrayRead, StateArrayWrite } from "./stateArray";
import * as array from "./stateArray";
import { StateBase } from "./stateBase";
import type { StateDelayed, StateDelayedOk } from "./stateDelayed";
import * as delayed from "./stateDelayed";
import type { StateDerived } from "./stateDerived";
import * as derived from "./stateDerived";
import type { StateLazy, StateLazyOk } from "./stateLazy";
import * as lazy from "./stateLazy";
import type {
  StateOwner,
  StateOwnerOk,
  StateRead,
  StateReadBase,
  StateReadOk,
  StateSetter,
  StateSetterOk,
  StateSubscriber,
  StateSubscriberBase,
  StateSubscriberOk,
  StateWrite,
  StateWriteBase,
  StateWriteOk,
} from "./types";

//       _____ _______    _______ ______   _____ _   _ _____ _______ _____          _      _____ ____________ _____
//      / ____|__   __|/\|__   __|  ____| |_   _| \ | |_   _|__   __|_   _|   /\   | |    |_   _|___  /  ____|  __ \
//     | (___    | |  /  \  | |  | |__      | | |  \| | | |    | |    | |    /  \  | |      | |    / /| |__  | |__) |
//      \___ \   | | / /\ \ | |  |  __|     | | | . ` | | |    | |    | |   / /\ \ | |      | |   / / |  __| |  _  /
//      ____) |  | |/ ____ \| |  | |____   _| |_| |\  |_| |_   | |   _| |_ / ____ \| |____ _| |_ / /__| |____| | \ \
//     |_____/   |_/_/    \_\_|  |______| |_____|_| \_|_____|  |_|  |_____/_/    \_\______|_____/_____|______|_|  \_\
export let state = {
  from: normal.from,
  ok: normal.ok,
  err: normal.err,
  from_result: normal.from_result,
  from_result_ok: normal.from_result_ok,
};
export type { State, StateOk };

//      _                ________     __  _____ _   _ _____ _______ _____          _      _____ ____________ _____   _____
//     | |        /\    |___  /\ \   / / |_   _| \ | |_   _|__   __|_   _|   /\   | |    |_   _|___  /  ____|  __ \ / ____|
//     | |       /  \      / /  \ \_/ /    | | |  \| | | |    | |    | |    /  \  | |      | |    / /| |__  | |__) | (___
//     | |      / /\ \    / /    \   /     | | | . ` | | |    | |    | |   / /\ \ | |      | |   / / |  __| |  _  / \___ \
//     | |____ / ____ \  / /__    | |     _| |_| |\  |_| |_   | |   _| |_ / ____ \| |____ _| |_ / /__| |____| | \ \ ____) |
//     |______/_/    \_\/_____|   |_|    |_____|_| \_|_____|  |_|  |_____/_/    \_\______|_____/_____|______|_|  \_\_____/
export let state_lazy = {
  from: lazy.from,
  ok: lazy.ok,
  err: lazy.err,
  from_result: lazy.from_result,
  from_result_ok: lazy.from_result_ok,
};
export type { StateLazy, StateLazyOk };

//      _____  ______ _           __     ________ _____    _____ _   _ _____ _______ _____          _      _____ ____________ _____
//     |  __ \|  ____| |        /\\ \   / /  ____|  __ \  |_   _| \ | |_   _|__   __|_   _|   /\   | |    |_   _|___  /  ____|  __ \
//     | |  | | |__  | |       /  \\ \_/ /| |__  | |  | |   | | |  \| | | |    | |    | |    /  \  | |      | |    / /| |__  | |__) |
//     | |  | |  __| | |      / /\ \\   / |  __| | |  | |   | | | . ` | | |    | |    | |   / /\ \ | |      | |   / / |  __| |  _  /
//     | |__| | |____| |____ / ____ \| |  | |____| |__| |  _| |_| |\  |_| |_   | |   _| |_ / ____ \| |____ _| |_ / /__| |____| | \ \
//     |_____/|______|______/_/    \_\_|  |______|_____/  |_____|_| \_|_____|  |_|  |_____/_/    \_\______|_____/_____|______|_|  \_\
export let state_delayed = {
  from: delayed.from,
  ok: delayed.ok,
  err: delayed.err,
  from_result: delayed.from_result,
  from_result_ok: delayed.from_result_ok,
};
export type { StateDelayed, StateDelayedOk };
//      _____  ______ _____  _______      ________ _____    _____ _   _ _____ _______ _____          _      _____ ____________ _____   _____
//     |  __ \|  ____|  __ \|_   _\ \    / /  ____|  __ \  |_   _| \ | |_   _|__   __|_   _|   /\   | |    |_   _|___  /  ____|  __ \ / ____|
//     | |  | | |__  | |__) | | |  \ \  / /| |__  | |  | |   | | |  \| | | |    | |    | |    /  \  | |      | |    / /| |__  | |__) | (___
//     | |  | |  __| |  _  /  | |   \ \/ / |  __| | |  | |   | | | . ` | | |    | |    | |   / /\ \ | |      | |   / / |  __| |  _  / \___ \
//     | |__| | |____| | \ \ _| |_   \  /  | |____| |__| |  _| |_| |\  |_| |_   | |   _| |_ / ____ \| |____ _| |_ / /__| |____| | \ \ ____) |
//     |_____/|______|_|  \_\_____|   \/   |______|_____/  |_____|_| \_|_____|  |_|  |_____/_/    \_\______|_____/_____|______|_|  \_\_____/
export let state_derived = {
  from_states: derived.from_states,
  from_state_array: derived.from_state_array,
};
export type { StateDerived };

//               _____  _____        __     __  _____ _   _ _____ _______ _____          _      _____ ____________ _____   _____
//         /\   |  __ \|  __ \     /\\ \   / / |_   _| \ | |_   _|__   __|_   _|   /\   | |    |_   _|___  /  ____|  __ \ / ____|
//        /  \  | |__) | |__) |   /  \\ \_/ /    | | |  \| | | |    | |    | |    /  \  | |      | |    / /| |__  | |__) | (___
//       / /\ \ |  _  /|  _  /   / /\ \\   /     | | | . ` | | |    | |    | |   / /\ \ | |      | |   / / |  __| |  _  / \___ \
//      / ____ \| | \ \| | \ \  / ____ \| |     _| |_| |\  |_| |_   | |   _| |_ / ____ \| |____ _| |_ / /__| |____| | \ \ ____) |
//     /_/    \_\_|  \_\_|  \_\/_/    \_\_|    |_____|_| \_|_____|  |_|  |_____/_/    \_\______|_____/_____|______|_|  \_\_____/
export let state_array = {
  StateArray: array.StateArray,
  applyReadToArray: array.applyReadToArray,
  applyReadToArrayTransform: array.applyReadToArrayTransform,
};
export type { StateArray, StateArrayRead, StateArrayWrite };

//      _    _ ______ _      _____  ______ _____   _____
//     | |  | |  ____| |    |  __ \|  ____|  __ \ / ____|
//     | |__| | |__  | |    | |__) | |__  | |__) | (___
//     |  __  |  __| | |    |  ___/|  __| |  _  / \___ \
//     | |  | | |____| |____| |    | |____| | \ \ ____) |
//     |_|  |_|______|______|_|    |______|_|  \_\_____/
export { isState, isStateOk, isStateSync, isStateSyncOk } from "./stateBase";

//       _____ _______    _______ ______   _________     _______  ______  _____
//      / ____|__   __|/\|__   __|  ____| |__   __\ \   / /  __ \|  ____|/ ____|
//     | (___    | |  /  \  | |  | |__       | |   \ \_/ /| |__) | |__  | (___
//      \___ \   | | / /\ \ | |  |  __|      | |    \   / |  ___/|  __|  \___ \
//      ____) |  | |/ ____ \| |  | |____     | |     | |  | |    | |____ ____) |
//     |_____/   |_/_/    \_\_|  |______|    |_|     |_|  |_|    |______|_____/
export type {
  StateOwner,
  StateOwnerOk,
  StateRead,
  StateReadOk,
  StateSetter,
  StateSetterOk,
  StateSubscriber,
  StateSubscriberBase,
  StateSubscriberOk,
  StateWrite,
  StateWriteOk,
};

//      ________   _________ ______ _   _  _____ _____ ____  _   _    _____ _                _____ _____ ______  _____
//     |  ____\ \ / /__   __|  ____| \ | |/ ____|_   _/ __ \| \ | |  / ____| |        /\    / ____/ ____|  ____|/ ____|
//     | |__   \ V /   | |  | |__  |  \| | (___   | || |  | |  \| | | |    | |       /  \  | (___| (___ | |__  | (___
//     |  __|   > <    | |  |  __| | . ` |\___ \  | || |  | | . ` | | |    | |      / /\ \  \___ \\___ \|  __|  \___ \
//     | |____ / . \   | |  | |____| |\  |____) |_| || |__| | |\  | | |____| |____ / ____ \ ____) |___) | |____ ____) |
//     |______/_/ \_\  |_|  |______|_| \_|_____/|_____\____/|_| \_|  \_____|______/_/    \_\_____/_____/|______|_____/
export let classes = {
  StateBase,
  StateNumberHelper,
  StateStringHelper,
  StateEnumHelper,
};

//      ________   _________ ______ _   _  _____ _____ ____  _   _   _________     _______  ______  _____
//     |  ____\ \ / /__   __|  ____| \ | |/ ____|_   _/ __ \| \ | | |__   __\ \   / /  __ \|  ____|/ ____|
//     | |__   \ V /   | |  | |__  |  \| | (___   | || |  | |  \| |    | |   \ \_/ /| |__) | |__  | (___
//     |  __|   > <    | |  |  __| | . ` |\___ \  | || |  | | . ` |    | |    \   / |  ___/|  __|  \___ \
//     | |____ / . \   | |  | |____| |\  |____) |_| || |__| | |\  |    | |     | |  | |    | |____ ____) |
//     |______/_/ \_\  |_|  |______|_| \_|_____/|_____\____/|_| \_|    |_|     |_|  |_|    |______|_____/
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
