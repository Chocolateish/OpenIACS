import { Err, Ok, type Option, type Result } from "@libResult";
import {
  state_from_result as sfr,
  state_from_result_ok as sfro,
  state_err,
  state_from,
  state_ok,
} from "../state";
import type { StateBase } from "../stateBase";
import {
  state_delayed_err as sde,
  state_delayed_from as sdf,
  state_delayed_from_result as sdfr,
  state_delayed_from_result_ok as sdfro,
  state_delayed_ok as sdo,
} from "../stateDelayed";
import {
  state_derived_from_states as sdfs,
  state_derived_from_state_array as sdfsa,
  state_derived_ok_from_states as sdofs,
  state_derived_ok_from_state_array as sdofsa,
} from "../stateDerived";
import {
  state_derives_sum_from,
  state_derives_sum_from_ok,
  state_derives_sum_ok_from_ok,
} from "../stateDerives";
import {
  state_lazy_err as sle,
  state_lazy_from as slf,
  state_lazy_from_result as slfr,
  state_lazy_from_result_ok as slfro,
  state_lazy_ok as slo,
} from "../stateLazy";
import {
  state_proxy_from,
  state_proxy_from_ok,
  state_proxy_ok,
  state_proxy_ok_from_ok,
} from "../stateProxy";
import {
  state_proxy_write_from,
  state_proxy_write_from_ok,
  state_proxy_write_ok,
  state_proxy_write_ok_from_ok,
} from "../stateProxyWrite";
import type { StateError, StateOwner, StateRead, StateWrite } from "../types";

export function state_test_gen_error() {
  return { code: "TEST", reason: "Test Error" };
}
let eg = state_test_gen_error;

export type StateTestsRead = [
  string,
  StateRead<number, any>,
  StateOwner<number>,
  StateBase<any, any, any>,
  Result<number, StateError>,
  Result<number, StateError>
];

export type StateTestsWrite = [
  string,
  StateWrite<number, any>,
  StateOwner<number>,
  StateBase<any, any, any>,
  Result<number, StateError>,
  Result<number, StateError>
];

export function norm(
  text: string,
  state: StateBase<any, any, any> & StateOwner<any> & StateWrite<any, any, any>,
  init: Result<number, StateError>
): StateTestsWrite {
  return [text, state.writeable, state, state, init, init.constructor as any];
}

//       _____ _______    _______ ______
//      / ____|__   __|/\|__   __|  ____|
//     | (___    | |  /  \  | |  | |__
//      \___ \   | | / /\ \ | |  |  __|
//      ____) |  | |/ ____ \| |  | |____
//     |_____/   |_/_/    \_\_|  |______|
export function state_test_gen_normals(
  setter?: ((val: number) => Option<Result<number, StateError>>) | true
): StateTestsWrite[] {
  return [
    norm("state_from", state_from(1, setter), Ok(1)),
    norm("state_err", state_err<number>(eg(), setter), Err(eg())),
    norm("state_from_result", sfr<number>(Err(eg()), setter), Err(eg())),
  ];
}
export function state_test_gen_normals_ok(
  setter?: ((val: number) => Option<Result<number, StateError>>) | true
): StateTestsWrite[] {
  return [
    norm("state_ok", state_ok(1, setter as any), Ok(1)),
    norm("state_from_result_ok", sfro<number>(Ok(1), setter as any), Ok(1)),
  ];
}

//      _                ________     __
//     | |        /\    |___  /\ \   / /
//     | |       /  \      / /  \ \_/ /
//     | |      / /\ \    / /    \   /
//     | |____ / ____ \  / /__    | |
//     |______/_/    \_\/_____|   |_|
export function state_test_gen_lazy(
  setter?: ((val: number) => Option<Result<number, StateError>>) | true
): StateTestsWrite[] {
  return [
    norm(
      "state_lazy_from",
      slf(() => 1, setter),
      Ok(1)
    ),
    norm(
      "state_lazy_err",
      sle<number>(() => eg(), setter),
      Err(eg())
    ),
    norm(
      "state_lazy_from_result",
      slfr<number>(() => Err(eg()), setter),
      Err(eg())
    ),
  ];
}
export function state_test_gen_lazy_ok(
  setter?: ((val: number) => Option<Result<number, StateError>>) | true
): StateTestsWrite[] {
  return [
    norm(
      "state_lazy_ok",
      slo(() => 1, setter as any),
      Ok(1)
    ),
    norm(
      "state_lazy_from_result_ok",
      slfro<number>(() => Ok(1), setter as any),
      Ok(1)
    ),
  ];
}

//      _____  ______ _           __     ________ _____
//     |  __ \|  ____| |        /\\ \   / /  ____|  __ \
//     | |  | | |__  | |       /  \\ \_/ /| |__  | |  | |
//     | |  | |  __| | |      / /\ \\   / |  __| | |  | |
//     | |__| | |____| |____ / ____ \| |  | |____| |__| |
//     |_____/|______|______/_/    \_\_|  |______|_____/
export function state_test_gen_delayed(
  setter?: ((val: number) => Option<Result<number, StateError>>) | true
): StateTestsWrite[] {
  return [
    norm("state_delayed_from", sdf((async () => 1)(), setter), Ok(1)),
    norm(
      "state_delayed_err",
      sde<number>((async () => eg())(), setter),
      Err(eg())
    ),
    norm(
      "state_delayed_from_result",
      sdfr<number>((async () => Err(eg()))(), setter),
      Err(eg())
    ),
  ];
}
export function state_test_gen_delayed_ok(
  setter?: ((val: number) => Option<Result<number, StateError>>) | true
): StateTestsWrite[] {
  return [
    norm("state_delayed_ok", sdo((async () => 1)(), setter as any), Ok(1)),
    norm(
      "state_delayed_from_result_ok",
      sdfro<number>((async () => Ok(1))(), setter as any),
      Ok(1)
    ),
  ];
}

//      _____  ______ _           __     ________ _____   __          _______ _______ _    _   _____  ______ _           __     __
//     |  __ \|  ____| |        /\\ \   / /  ____|  __ \  \ \        / /_   _|__   __| |  | | |  __ \|  ____| |        /\\ \   / /
//     | |  | | |__  | |       /  \\ \_/ /| |__  | |  | |  \ \  /\  / /  | |    | |  | |__| | | |  | | |__  | |       /  \\ \_/ /
//     | |  | |  __| | |      / /\ \\   / |  __| | |  | |   \ \/  \/ /   | |    | |  |  __  | | |  | |  __| | |      / /\ \\   /
//     | |__| | |____| |____ / ____ \| |  | |____| |__| |    \  /\  /   _| |_   | |  | |  | | | |__| | |____| |____ / ____ \| |
//     |_____/|______|______/_/    \_\_|  |______|_____/      \/  \/   |_____|  |_|  |_|  |_| |_____/|______|______/_/    \_\_|
let dg = (ret: any) => {
  return (async () => {
    await new Promise((a) => setTimeout(a, 4));
    return ret;
  })();
};

export function state_test_gen_delayed_with_delay(
  setter?: ((val: number) => Option<Result<number, StateError>>) | true
): StateTestsWrite[] {
  return [
    norm("state_delayed_from", sdf(dg(1), setter), Ok(1)),
    norm("state_delayed_err", sde<number>(dg(eg()), setter), Err(eg())),
    norm(
      "state_delayed_from_result",
      sdfr<number>(dg(Err(eg())), setter),
      Err(eg())
    ),
  ];
}
export function state_test_gen_delayed_with_delay_ok(
  setter?: ((val: number) => Option<Result<number, StateError>>) | true
): StateTestsWrite[] {
  return [
    norm("state_delayed_ok", sdo(dg(1), setter as any), Ok(1)),
    norm(
      "state_delayed_from_result_ok",
      sdfro<number>(dg(Ok(1)), setter as any),
      Ok(1)
    ),
  ];
}

//      _____  _____   ______   ____     __
//     |  __ \|  __ \ / __ \ \ / /\ \   / /
//     | |__) | |__) | |  | \ V /  \ \_/ /
//     |  ___/|  _  /| |  | |> <    \   /
//     | |    | | \ \| |__| / . \    | |
//     |_|    |_|  \_\\____/_/ \_\   |_|
let pr = Ok(1);
let prc = pr.constructor as any;

export function state_test_gen_proxies(): StateTestsRead[] {
  let s3 = state_ok(1);
  let s4 = state_ok(1);
  let sp3 = state_proxy_from(s3);
  let sp4 = state_proxy_from_ok(s4);
  return [
    ["state_proxy_from", sp3.readable, s3, sp3, pr, prc],
    ["state_proxy_from_ok", sp4.readable, s4, sp4, pr, prc],
  ];
}

export function state_test_gen_proxies_ok(): StateTestsRead[] {
  let s1 = state_ok(1);
  let s2 = state_ok(1);
  let sp1 = state_proxy_ok(s1);
  let sp2 = state_proxy_ok_from_ok(s2);
  return [
    ["state_proxy_ok", sp1.readable, s1, sp1, pr, prc],
    ["state_proxy_ok_from_ok", sp2.readable, s2, sp2, pr, prc],
  ];
}

//      _____  _____   ______   ____     __ __          _______  _____ _______ ______
//     |  __ \|  __ \ / __ \ \ / /\ \   / / \ \        / /  __ \|_   _|__   __|  ____|
//     | |__) | |__) | |  | \ V /  \ \_/ /   \ \  /\  / /| |__) | | |    | |  | |__
//     |  ___/|  _  /| |  | |> <    \   /     \ \/  \/ / |  _  /  | |    | |  |  __|
//     | |    | | \ \| |__| / . \    | |       \  /\  /  | | \ \ _| |_   | |  | |____
//     |_|    |_|  \_\\____/_/ \_\   |_|        \/  \/   |_|  \_\_____|  |_|  |______|
export function state_test_gen_proxies_write(
  setter?: ((val: number) => Option<Result<number, StateError>>) | true
): StateTestsWrite[] {
  let s7 = state_ok(1, setter as any);
  let s8 = state_ok(1, setter as any);
  let sp7 = state_proxy_write_from(s7);
  let sp8 = state_proxy_write_from_ok(s8);

  return [
    ["state_proxy_write_from", sp7.writeable, s7, sp7, pr, prc],
    ["state_proxy_write_from_ok", sp8.writeable, s8, sp8, pr, prc],
  ];
}

export function state_test_gen_proxies_write_ok(
  setter?: ((val: number) => Option<Result<number, StateError>>) | true
): StateTestsWrite[] {
  let s5 = state_ok(1, setter as any);
  let s6 = state_ok(1, setter as any);
  let sp5 = state_proxy_write_ok(s5);
  let sp6 = state_proxy_write_ok_from_ok(s6);
  return [
    ["state_proxy_write_ok", sp5.writeable, s5, sp5, pr, prc],
    ["state_proxy_write_ok_from_ok", sp6.writeable, s6, sp6, pr, prc],
  ];
}

//      _____  ______ _____  _______      ________ _____
//     |  __ \|  ____|  __ \|_   _\ \    / /  ____|  __ \
//     | |  | | |__  | |__) | | |  \ \  / /| |__  | |  | |
//     | |  | |  __| |  _  /  | |   \ \/ / |  __| | |  | |
//     | |__| | |____| | \ \ _| |_   \  /  | |____| |__| |
//     |_____/|______|_|  \_\_____|   \/   |______|_____/
let dr = Ok(1);
let drc = pr.constructor as any;

export function state_test_gen_derived(
  setter?: ((val: number) => Option<Result<number, StateError>>) | true
): StateTestsRead[] {
  let s1 = state_ok(1, setter as any);
  let s2 = state_ok(1, setter as any);
  let d1 = sdfs((val) => {
    return val[0];
  }, s1);
  let d2 = sdfsa(
    (val) => {
      return val[0];
    },
    [s2]
  );
  return [
    ["state_derived_from_states", d1.readable, s1, d1, dr, drc],
    ["state_derived_from_state_array", d2.readable, s2, d2, dr, drc],
  ];
}

export function state_test_gen_derived_ok(
  setter?: ((val: number) => Option<Result<number, StateError>>) | true
): StateTestsRead[] {
  let s1 = state_ok(1, setter as any);
  let s2 = state_ok(1, setter as any);
  let d1 = sdofs((val) => {
    return val[0];
  }, s1);
  let d2 = sdofsa(
    (val) => {
      return val[0];
    },
    [s2]
  );
  return [
    ["state_derived_ok_from_states", d1.readable, s1, d1, dr, drc],
    ["state_derived_ok_from_state_array", d2.readable, s2, d2, dr, drc],
  ];
}

//      _____  ______ _____  _______      ________  _____
//     |  __ \|  ____|  __ \|_   _\ \    / /  ____|/ ____|
//     | |  | | |__  | |__) | | |  \ \  / /| |__  | (___
//     | |  | |  __| |  _  /  | |   \ \/ / |  __|  \___ \
//     | |__| | |____| | \ \ _| |_   \  /  | |____ ____) |
//     |_____/|______|_|  \_\_____|   \/   |______|_____/

export function state_test_gen_derives_sum(
  setter?: ((val: number) => Option<Result<number, StateError>>) | true
): StateTestsRead[] {
  let s1 = state_ok(1, setter as any);
  let s2 = state_ok(1, setter as any);
  let d1 = state_derives_sum_from(s1);
  let d2 = state_derives_sum_from_ok(s2);
  return [
    ["state_derives_sum_from", d1.readable, s1, d1, dr, drc],
    ["state_derives_sum_from_ok", d2.readable, s2, d2, dr, drc],
  ];
}
export function state_test_gen_derives_sum_ok(
  setter?: ((val: number) => Option<Result<number, StateError>>) | true
): StateTestsRead[] {
  let s1 = state_ok(1, setter as any);
  let d1 = state_derives_sum_ok_from_ok(s1);
  return [["state_derives_sum_ok_from_ok", d1.readable, s1, d1, dr, drc]];
}
