import { describe, expect, it } from "vitest";
import { applyDoubleJeopardyRoll } from "./doubleJeopardyRules";

describe("applyDoubleJeopardyRoll", () => {
  it.each([
    [1, 3],
    [3, 1],
  ])("saves a %i + %i roll and keeps the turn points", (die1, die2) => {
    expect(applyDoubleJeopardyRoll(die1, die2, 12)).toEqual({
      outcome: "saved",
      turnPoints: 12,
    });
  });

  it("busts on 1 + 1", () => {
    expect(applyDoubleJeopardyRoll(1, 1, 12)).toEqual({
      outcome: "bust",
      turnPoints: 0,
    });
  });

  it("busts on 1 + any non-3 value", () => {
    expect(applyDoubleJeopardyRoll(1, 5, 12)).toEqual({
      outcome: "bust",
      turnPoints: 0,
    });
  });

  it("adds both dice when neither is 1", () => {
    expect(applyDoubleJeopardyRoll(2, 5, 12)).toEqual({
      outcome: "continue",
      turnPoints: 19,
    });
  });

  it("continues on 6 + 6", () => {
    expect(applyDoubleJeopardyRoll(6, 6, 0)).toEqual({
      outcome: "continue",
      turnPoints: 12,
    });
  });

  it("continues on 3 + 3", () => {
    expect(applyDoubleJeopardyRoll(3, 3, 4)).toEqual({
      outcome: "continue",
      turnPoints: 10,
    });
  });
});
