import { Err, Ok } from "@libResult";
import { describe, expect, it } from "vitest";
import {
  state_test_gen_error as gen_error,
  state_test_gen_normals as normals,
  state_test_gen_proxies as proxies,
  type StateTestsRead,
} from "./shared";

let gen_states = (): StateTestsRead[] => {
  return [...normals(), ...proxies()];
};

describe(
  "Subscribing with update set to true",
  {
    timeout: 50,
  },
  function () {
    let tests = gen_states();
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      it(test[0], async function () {
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
        test[2](Ok(8));
        expect(count).equal(12);
        let sub3 = test[1].subscribe(() => {
          count += 100;
          throw new Error("Gaurded against crash");
        });
        expect(test[3].inUse()).equal(true);
        expect(test[3].hasSubscriber(sub3)).equal(true);
        expect(test[3].amountSubscriber()).equal(3);
        test[2](Ok(12));
        expect(count).equal(123);
        test[1].unsubscribe(sub1);
        test[1].unsubscribe(sub2);
        expect(test[3].inUse()).equal(true);
        expect(test[3].hasSubscriber(sub3)).equal(true);
        expect(test[3].amountSubscriber()).equal(1);
        test[2](Ok(12));
        expect(count).equal(223);
        test[1].unsubscribe(sub3);
        expect(test[3].inUse()).equal(false);
        expect(test[3].amountSubscriber()).equal(0);
        let sub4 = test[1].subscribe((val) => {
          count += 1000;
          expect(val).toEqual(Ok(15));
        });
        test[2](Ok(15));
        expect(count).equal(1223);
        test[1].unsubscribe(sub4);
        let sub5 = test[1].subscribe((val) => {
          count += 10000;
          expect(val).toEqual(gen_error());
        });
        test[2](Err(gen_error()));
        expect(count).equal(11223);
        test[1].unsubscribe(sub5);
      });
    }
  }
);
