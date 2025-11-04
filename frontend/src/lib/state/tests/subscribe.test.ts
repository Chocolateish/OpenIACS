import { Err, Ok, type Result } from "@libResult";
import { describe, expect, it } from "vitest";
import type { StateReadError } from "../types";
import {
  state_test_gen_delayed as delayed,
  state_test_gen_delayed_ok as delayed_ok,
  state_test_gen_delayed_with_delay as delayed_with_delay,
  state_test_gen_delayed_with_delay_ok as delayed_with_delay_ok,
  state_test_gen_derived as derived,
  state_test_gen_derived_ok as derived_ok,
  state_test_gen_derives_sum as derives_sum,
  state_test_gen_error as errGen,
  state_test_gen_lazy as lazy,
  state_test_gen_lazy_ok as lazy_ok,
  state_test_gen_normals as normals,
  state_test_gen_normals_ok as normals_ok,
  state_test_gen_proxies as proxies,
  state_test_gen_proxies_ok as proxies_ok,
  state_test_gen_proxies_write as proxwrite,
  state_test_gen_proxies_write_ok as proxwrite_ok,
  type StateTestsRead,
} from "./shared";

let gen_states = (): StateTestsRead[] => {
  return [
    ...normals(),
    ...lazy(),
    ...delayed(),
    ...delayed_with_delay(),
    ...proxies(),
    ...proxwrite(),
    ...normals_ok(),
    ...lazy_ok(),
    ...delayed_ok(),
    ...delayed_with_delay_ok(),
    ...proxies_ok(),
    ...proxwrite_ok(),
    ...derived(),
    ...derived_ok(),
    ...derives_sum(),
  ];
};

describe(
  "Subscribing",
  {
    timeout: 500,
  },
  function () {
    let tests = gen_states();
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      it(test[0], async function () {
        console.warn = () => {
          count += 100000000;
        };
        let count = 0;
        let sub1 = test[1].subscribe(() => {
          count++;
        }, true);
        expect(test[3].inUse()).equal(true);
        expect(test[3].hasSubscriber(sub1)).equal(true);
        expect(test[3].amountSubscriber()).equal(1);
        await new Promise((a) => {
          setTimeout(a, 8);
        });
        expect(count).equal(1);
        let sub2 = test[1].subscribe(() => {
          count += 10;
        });
        expect(test[3].inUse()).equal(true);
        expect(test[3].hasSubscriber(sub2)).equal(true);
        expect(test[3].amountSubscriber()).equal(2);
        expect(count).equal(1);
        test[2].set(Ok(8));
        expect(count).equal(12);
        let sub3 = test[1].subscribe(() => {
          count += 100;
          throw new Error("Gaurded against crash");
        });
        expect(test[3].inUse()).equal(true);
        expect(test[3].hasSubscriber(sub3)).equal(true);
        expect(test[3].amountSubscriber()).equal(3);
        test[2].set(Ok(12));
        expect(count).equal(100000123);
        test[1].unsubscribe(sub1);
        test[1].unsubscribe(sub2);
        expect(test[3].inUse()).equal(true);
        expect(test[3].hasSubscriber(sub3)).equal(true);
        expect(test[3].amountSubscriber()).equal(1);
        test[2].set(Ok(12));
        expect(count).equal(200000223);
        test[1].unsubscribe(sub3);
        expect(test[3].inUse()).equal(false);
        expect(test[3].amountSubscriber()).equal(0);
        let [sub4, val] = await new Promise<
          [(val: any) => void, Result<number, StateReadError>]
        >((a) => {
          let sub4 = test[1].subscribe((val) => {
            count += 1000;
            a([sub4, val]);
          });
          test[2].set(Ok(15));
        });
        expect(val).toEqual(Ok(15));
        expect(count).equal(200001223);
        test[1].unsubscribe(sub4);
        let [sub5, val2] = await new Promise<
          [(val: any) => void, Result<number, StateReadError>]
        >((a) => {
          let sub5 = test[1].subscribe((val) => {
            count += 10000;
            a([sub5, val]);
          });
          test[2].set(Err(errGen()));
        });
        expect(val2).toEqual(Err(errGen()));
        expect(count).equal(200011223);
        test[1].unsubscribe(sub5);
      });
    }
  }
);
