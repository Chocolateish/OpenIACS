import { describe, expect, expectTypeOf, it } from "vitest";
import { Err, None, Ok, Some, type Option, type Result } from ".";

//###########################################################################################################################################################
//       ____  _  __
//      / __ \| |/ /
//     | |  | | ' /
//     | |  | |  <
//     | |__| | . \
//      \____/|_|\_\
//###########################################################################################################################################################
describe("Result Ok", function () {
  it("Value from valid result", function () {
    const result = Ok(42);
    expect(result.value).equal(42);
  });
  it("Ok from valid result", function () {
    const result = Ok(42);
    expect(result.ok).equal(true);
  });
  it("Err from valid result", function () {
    const result = Ok(42);
    expect(result.err).equal(false);
  });
  it("Expect value from valid result", function () {
    const result = Ok(42);
    expect(result.expect()).equal(42);
  });
  it("Expect err value from valid result", function () {
    const result = Ok(42);
    expect(() => {
      result.expect_err("YOYO");
    }).to.throw();
  });
  it("Unwrap value from valid result", function () {
    const result = Ok(42);
    expect(result.unwrap).equal(42);
  });
  it("UnwrapOr value from valid result", function () {
    const result = Ok(42);
    expect(result.unwrap_or()).equal(42);
  });
  it("andThen from valid result returning valid result", function () {
    const result = Ok(42);
    expect(
      result
        .and_then((val) => {
          expect(val).equal(42);
          return Ok("42");
        })
        .expect()
    ).equal("42");
  });
  it("andThen from valid result returning error result", function () {
    const result = Ok(42);
    expect(
      result
        .and_then((val) => {
          expect(val).equal(42);
          return Err("42");
        })
        .expect_err()
    ).equal("42");
  });
  it("orElse from valid result", function () {
    const result = Ok(42);
    expect(result.or_else().expect()).equal(42);
  });
  it("map from valid result", function () {
    const result = Ok(42);
    expect(
      result
        .map((val) => {
          expect(val).equal(42);
          return "42";
        })
        .expect()
    ).equal("42");
  });
  it("mapErr from valid result", function () {
    const result = Ok(42);
    expect(result.map_err().expect()).equal(42);
  });
  it("Compare equal valid results", function () {
    const result1 = Ok(42);
    const result2 = Ok(42);
    expect(result1.compare(result2)).equal(true);
  });
  it("Compare unequal valid results", function () {
    const result1 = Ok(42);
    const result2 = Ok(43);
    expect(result1.compare(result2)).equal(false);
  });
  it("Compare valid and error results", function () {
    const result1 = Ok(42) as Result<number, string>;
    const result2 = Err("42") as Result<number, string>;
    expect(result1.compare(result2)).equal(false);
  });

  it("toOptional from valid result", function () {
    const result = Ok(42);
    expect(result.to_option.expect()).equal(42);
  });
});

//###########################################################################################################################################################
//      ______
//     |  ____|
//     | |__   _ __ _ __ ___  _ __
//     |  __| | '__| '__/ _ \| '__|
//     | |____| |  | | | (_) | |
//     |______|_|  |_|  \___/|_|
//###########################################################################################################################################################
describe("Result Error", function () {
  it("Value from error result", function () {
    const result = Err(42);
    expect(result.error).equal(42);
  });
  it("Valid from error result", function () {
    const result = Err(42);
    expect(result.valid).equal(false);
  });
  it("Ok from error result", function () {
    const result = Err(42);
    expect(result.ok).equal(false);
  });
  it("Err from error result", function () {
    const result = Err(42);
    expect(result.err).equal(true);
  });
  it("Expect err value from error result", function () {
    const result = Err(42);
    expect(result.expect_err()).equal(42);
  });
  it("Unwrap value from error result", function () {
    const result = Err(42);
    let yo;
    expect(() => {
      yo = result.unwrap;
    }).to.throw();
    yo = yo;
  });
  it("UnwrapOr value from error result", function () {
    const result = Err(42);
    expect(result.unwrap_or(42)).equal(42);
  });
  it("andThen from error result", function () {
    const result = Err(42);
    expect(result.and_then().expect_err()).equal(42);
  });
  it("orElse from error result", function () {
    const result = Err(42);
    expect(
      result
        .or_else((val) => {
          expect(val).equal(42);
          return Ok("42");
        })
        .expect()
    ).equal("42");
  });
  it("map from error result", function () {
    const result = Err(42);
    expect(result.map().expect_err()).equal(42);
  });
  it("mapErr from error result", function () {
    const result = Err(42);
    expect(
      result
        .map_err((val) => {
          expect(val).equal(42);
          return "42";
        })
        .expect_err()
    ).equal("42");
  });
  it("Compare equal error results", function () {
    const result1 = Err(42);
    const result2 = Err(42);
    expect(result1.compare(result2)).equal(true);
  });
  it("Compare unequal error results", function () {
    const result1 = Err(42);
    const result2 = Err(43);
    expect(result1.compare(result2)).equal(false);
  });
  it("Compare error and valid results", function () {
    const result1 = Err(42) as Result<number, number>;
    const result2 = Ok(42) as Result<number, number>;
    expect(result1.compare(result2)).equal(false);
  });
  it("toOptional from error result", function () {
    const result = Err(42);
    expect(result.to_option.none).equal(true);
  });
});
//###########################################################################################################################################################
//       _____
//      / ____|
//     | (___   ___  _ __ ___   ___
//      \___ \ / _ \| '_ ` _ \ / _ \
//      ____) | (_) | | | | | |  __/
//     |_____/ \___/|_| |_| |_|\___|
//###########################################################################################################################################################
describe("Option Some", function () {
  it("Value from Some", function () {
    const result = Some(42);
    expect(result.value).equal(42);
  });
  it("Some from Some", function () {
    const result = Some(42);
    expect(result.some).equal(true);
  });
  it("None from Some", function () {
    const result = Some(42);
    expect(result.none).equal(false);
  });
  it("Expect value from Some", function () {
    const result = Some(42);
    expect(result.expect()).equal(42);
  });
  it("Unwrap value from Some", function () {
    const result = Some(42);
    expect(result.unwrap).equal(42);
  });
  it("UnwrapOr value from Some", function () {
    const result = Some(42);
    expect(result.unwrap_or()).equal(42);
  });
  it("andThen from Some returning Some", function () {
    const result = Some(42);
    expect(
      result
        .and_then((val) => {
          expect(val).equal(42);
          return Some("42");
        })
        .expect()
    ).equal("42");
  });
  it("andThen from Some returning error result", function () {
    const result = Some(42);
    expect(
      result.and_then((val) => {
        expect(val).equal(42);
        return None();
      }).none
    ).equal(true);
  });
  it("orElse from Some", function () {
    const result = Some(42);
    expect(result.or_else().expect()).equal(42);
  });
  it("map from Some", function () {
    const result = Some(42);
    expect(
      result
        .map((val) => {
          expect(val).equal(42);
          return "42";
        })
        .expect()
    ).equal("42");
  });
  it("Compare equal Some", function () {
    const result1 = Some(42);
    const result2 = Some(42);
    expect(result1.compare(result2)).equal(true);
  });
  it("Compare unequal Some", function () {
    const result1 = Some(42);
    const result2 = Some(43);
    expect(result1.compare(result2)).equal(false);
  });
  it("Compare Some and None", function () {
    const result1 = Some(42);
    const result2 = None();
    expect(result1.compare(result2)).equal(false);
  });
  it("toResult from Some", function () {
    const result = Some(42);
    expect(result.to_result().expect()).equal(42);
  });
});

//###########################################################################################################################################################
//      _   _
//     | \ | |
//     |  \| | ___  _ __   ___
//     | . ` |/ _ \| '_ \ / _ \
//     | |\  | (_) | | | |  __/
//     |_| \_|\___/|_| |_|\___|
//###########################################################################################################################################################
describe("Option None", function () {
  it("Some from None", function () {
    const result = None();
    expect(result.some).equal(false);
  });
  it("None from None", function () {
    const result = None();
    expect(result.none).equal(true);
  });
  it("Expect value from None", function () {
    const result = None();
    expect(() => {
      result.expect("YOYO");
    }).to.throw();
  });
  it("Unwrap value from None", function () {
    const result = None();
    let yo;
    expect(() => {
      yo = result.unwrap;
    }).to.throw();
    yo = yo;
  });
  it("UnwrapOr value from None", function () {
    const result = None();
    expect(result.unwrap_or(42)).equal(42);
  });
  it("andThen from None returning error result", function () {
    const result = None();
    expect(result.and_then().none).equal(true);
  });
  it("orElse from Some returning Some", function () {
    const result = None();
    expect(
      result
        .or_else(() => {
          return Some("42");
        })
        .expect()
    ).equal("42");
  });
  it("orElse from Some returning error result", function () {
    const result = None();
    expect(
      result.or_else(() => {
        return None();
      }).none
    ).equal(true);
  });
  it("map from None", function () {
    const result = None();
    expect(result.map()).equal(result);
  });
  it("Compare equal None", function () {
    const result1 = None();
    const result2 = None();
    expect(result1.compare(result2)).equal(true);
  });
  it("Compare Some and None", function () {
    const result1 = Some(42);
    const result2 = None();
    expect(result1.compare(result2)).equal(false);
  });
  it("toResult from None", function () {
    const result = None();
    expect(result.to_result("YOYO").err).equal(true);
  });
});

//###########################################################################################################################################################
//       ____  _____ _______ _____ ____  _   _
//      / __ \|  __ \__   __|_   _/ __ \| \ | |
//     | |  | | |__) | | |    | || |  | |  \| |
//     | |  | |  ___/  | |    | || |  | | . ` |
//     | |__| | |      | |   _| || |__| | |\  |
//      \____/|_|      |_|  |_____\____/|_| \_|
//###########################################################################################################################################################
describe("Option", function () {
  it("Type narrowing", function () {
    const result = ((): Option<boolean> => {
      return None();
    })();
    expectTypeOf(result).toEqualTypeOf<Option<boolean>>();
    if (result.some) {
      expectTypeOf(result.value).toEqualTypeOf<boolean>();
    }
  });
});

//###########################################################################################################################################################
//      _____                 _ _
//     |  __ \               | | |
//     | |__) |___  ___ _   _| | |_
//     |  _  // _ \/ __| | | | | __|
//     | | \ \  __/\__ \ |_| | | |_
//     |_|  \_\___||___/\__,_|_|\__|
//###########################################################################################################################################################
describe("Result", function () {
  it("Type narrowing", function () {
    const result = ((): Result<boolean, string> => {
      return Err("YOYO");
    })();
    expectTypeOf(result).toEqualTypeOf<Result<boolean, string>>();
    if (result.ok) {
      expectTypeOf(result.value).toEqualTypeOf<boolean>();
    } else {
      expectTypeOf(result.error).toEqualTypeOf<string>();
    }
  });
});
