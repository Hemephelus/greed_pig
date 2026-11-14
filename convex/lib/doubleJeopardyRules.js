// Change this one predicate to die1 === 1 && die2 === 3 for an ordered save.
export const isSavedDoubleJeopardyRoll = (die1, die2) =>
  (die1 === 1 && die2 === 3) || (die1 === 3 && die2 === 1);

// Apply one Double Jeopardy roll without reading or changing external state.
export function applyDoubleJeopardyRoll(die1, die2, turnPoints) {
  if (!Number.isInteger(die1) || die1 < 1 || die1 > 6) {
    throw new RangeError("die1 must be an integer from 1 to 6");
  }
  if (!Number.isInteger(die2) || die2 < 1 || die2 > 6) {
    throw new RangeError("die2 must be an integer from 1 to 6");
  }
  if (!Number.isInteger(turnPoints) || turnPoints < 0) {
    throw new RangeError("turnPoints must be a non-negative integer");
  }

  if (isSavedDoubleJeopardyRoll(die1, die2)) {
    return { outcome: "saved", turnPoints };
  }

  if (die1 === 1 || die2 === 1) {
    return { outcome: "bust", turnPoints: 0 };
  }

  return { outcome: "continue", turnPoints: turnPoints + die1 + die2 };
}
