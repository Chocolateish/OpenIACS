import { Ok } from "@libResult";
import { describe, expect, it } from "vitest";
import { state } from "./state";
import { stateDerived } from "./stateDerived";

describe("Getting value", async () => {
  it("Getting value from StateDerived with no States", async () => {
    let derived = stateDerived(false);
    expect((await derived).err).equal(true);
  });
  it("Getting value from StateDerived with one state without function", async () => {
    let state1 = state(Ok(5));
    let derived = stateDerived(false, state1);
    expect((await derived).unwrap).equal(5);
  });
  it("Getting value from StateDerived with two states without function", async () => {
    let state1 = state(Ok(5));
    let derived = stateDerived(false, state1);
    expect((await derived).unwrap).equal(5);
  });
  it("Getting value from StateDerived with state with read function set", async () => {
    let state1 = state(Ok(5));
    let state2 = state(Ok(6));
    let derived = stateDerived(
      ([a, b]) => {
        return Ok(a.unwrap * b.unwrap);
      },
      state1,
      state2
    );
    expect((await derived).unwrap).equal(30);
  });
});

describe("Subscribers", async () => {
  it("If a subscriber is added to a StateDerived, it start listening to all States", async () => {
    let state1 = state(Ok(1));
    let state2 = state(Ok(2));
    let state3 = state(Ok(3));
    let derived = stateDerived(false, state1, state2, state3);
    let callCount = 0;
    derived.subscribe((value) => {
      expect(value.unwrap).equal(1);
      callCount++;
    }, true);
    await new Promise((a) => {
      setTimeout(a, 10);
    });
    expect(callCount).equal(1);
  });
  it("If a subscriber is added to a StateDerived, it start listening to all States", async () => {
    let state1 = state(Ok(1));
    let state2 = state(Ok(2));
    let state3 = state(Ok(3));
    let derived = stateDerived(false, state1, state2, state3);
    let callCount = 0;
    derived.subscribe((val) => {
      callCount++;
      expect(val.unwrap).equal(2);
    });
    await Promise.resolve();
    state1.set(Ok(2));
    state2.set(Ok(3));
    state3.set(Ok(4));
    await Promise.resolve();
    expect(callCount).equal(1);
  });
  it("If a subscriber is added to a StateDerived then removed, the States should not have listeners", async () => {
    let state1 = state(Ok(1));
    let state2 = state(Ok(2));
    let state3 = state(Ok(3));
    let derived = stateDerived(false, state1, state2, state3);
    let func = derived.subscribe(() => {});
    derived.unsubscribe(func);
  });
  it("should not notify unsubscribed listeners when state changes", async () => {
    let state1 = state(Ok(1));
    let state2 = state(Ok(2));
    let state3 = state(Ok(3));
    let derived = stateDerived(false, state1, state2, state3);
    let callCount = 0;
    let func = derived.subscribe(() => {
      callCount++;
    });
    derived.unsubscribe(func);
    state1.set(Ok(2));
    await new Promise((a) => {
      setTimeout(a, 10);
    });
    expect(callCount).equal(0);
  });

  it("should continue to notify other subscribers after one is removed", async () => {
    let state1 = state(Ok(1));
    let state2 = state(Ok(2));
    let state3 = state(Ok(3));
    let derived = stateDerived(false, state1, state2, state3);
    let callCount = 0;
    let func1 = derived.subscribe(() => {
      expect(true).equal(false);
    });
    derived.subscribe((val) => {
      callCount++;
      expect(val.unwrap).equal(2);
    });
    await Promise.resolve();
    derived.unsubscribe(func1);
    state1.set(Ok(2));
    await Promise.resolve();
    expect(callCount).equal(1);
  });

  it("Subscriber is called when update flag is set true and a single state is used", async () => {
    let state1 = state(Ok(5));
    let derived = stateDerived(false, state1);
    let check = false;
    await new Promise<void>((done) => {
      derived.subscribe((value) => {
        check = true;
        expect(value.unwrap).equal(5);
        done();
      }, true);
    });
    expect(check).equal(true);
  });
});

describe("Change function and states", async () => {
  it("Changing getter function with no subscribers", async () => {
    let state1 = state(Ok(5));
    let state2 = state(Ok(6));
    let derived = stateDerived(
      ([a, b]) => {
        return Ok(a.unwrap * b.unwrap);
      },
      state1,
      state2
    );
    expect((await derived).unwrap).equal(30);
    state1.set(Ok(6));
    expect((await derived).unwrap).equal(36);
    derived.setGetter(([a, b]) => {
      return Ok(a.unwrap + b.unwrap);
    });
    expect((await derived).unwrap).equal(12);
  });
  it("Changing getter function with subscribers", async () => {
    let state1 = state(Ok(5));
    let state2 = state(Ok(6));
    let derived = stateDerived(
      ([a, b]) => {
        return Ok(a.unwrap * b.unwrap);
      },
      state1,
      state2
    );
    let callCount = 0;
    derived.subscribe(() => {
      callCount++;
    }, true);
    await Promise.resolve();
    expect((await derived).unwrap).equal(30);
    state1.set(Ok(6));
    await Promise.resolve();
    expect((await derived).unwrap).equal(36);
    derived.setGetter(([a, b]) => {
      return Ok(a.unwrap + b.unwrap);
    });
    expect((await derived).unwrap).equal(12);
    expect(callCount).equal(3);
  });
  it("Changing states with no subscribers", async () => {
    let state1 = state(Ok(5));
    let state2 = state(Ok(6));
    let derived = stateDerived(
      ([a, b]) => {
        return Ok(a.unwrap * b.unwrap);
      },
      state1,
      state2
    );
    expect((await derived).unwrap).equal(30);
    state1.set(Ok(6));
    expect((await derived).unwrap).equal(36);
    let state3 = state(Ok(7));
    let state4 = state(Ok(8));
    derived.setStates(state3, state4);
    expect((await derived).unwrap).equal(56);
    state3.set(Ok(6));
    expect((await derived).unwrap).equal(48);
  });
  it("Changing states with subscribers", async () => {
    let state1 = state(Ok(5));
    let state2 = state(Ok(6));
    let derived = stateDerived(
      ([a, b]) => {
        return Ok(a.unwrap * b.unwrap);
      },
      state1,
      state2
    );
    let callCount = 0;
    derived.subscribe(() => {
      callCount++;
    }, true);
    await Promise.resolve();
    expect((await derived).unwrap).equal(30);
    state1.set(Ok(6));
    await Promise.resolve();
    expect((await derived).unwrap).equal(36);
    let state3 = state(Ok(7));
    let state4 = state(Ok(8));
    derived.setStates(state3, state4);
    await Promise.resolve();
    expect((await derived).unwrap).equal(56);
    state3.set(Ok(6));
    await Promise.resolve();
    expect((await derived).unwrap).equal(48);
    expect(callCount).equal(3);
  });
});

describe("Error Scenarios", async () => {
  it("If an array is passed to the StateDerived, and the array is modified, the StateDerived shall not be affected", async () => {
    let state1 = state(Ok(1));
    let state2 = state(Ok(2));
    let state3 = state(Ok(3));
    let state4 = state(Ok(4));
    let States = [state1, state2, state3];
    let derived = stateDerived(false, ...States);
    expect((await derived).unwrap).equal(1);
    States.unshift(state4);
    expect((await derived).unwrap).equal(1);
    States.shift();
    expect((await derived).unwrap).equal(1);
  });
});
