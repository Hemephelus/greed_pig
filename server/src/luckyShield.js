
export const SHIELD_ROLL_REQUIREMENT = 5;

export function processShieldRoll(player, diceValue) {
  if (!Number.isInteger(diceValue) ||
      diceValue < 1 || diceValue > 6) {
    throw new Error("Invalid dice value");
  }

  if (player.pending_decision) {
    throw new Error("Resolve the pending shield decision first");
  }

  const updated = { ...player };

  if (diceValue === 1) {
    updated.consecutive_rolls = 0;

    if (updated.shields > 0) {
      updated.pending_decision = true;

      return {
        player: updated,
        needsDecision: true,
        earnedShield: false,
      };
    }

    updated.running_points = 0;

    return {
      player: updated,
      needsDecision: false,
      earnedShield: false,
    };
  }

  updated.running_points += diceValue;

  const previousStreak = updated.consecutive_rolls;

  updated.consecutive_rolls = Math.min(
    previousStreak + 1,
    SHIELD_ROLL_REQUIREMENT
  );

  const earnedShield =
    previousStreak < SHIELD_ROLL_REQUIREMENT &&
    updated.consecutive_rolls === SHIELD_ROLL_REQUIREMENT &&
    updated.shields === 0;

  if (earnedShield) {
    updated.shields = 1;
  }

  return {
    player: updated,
    needsDecision: false,
    earnedShield,
  };
}

export function resolveShieldDecision(player, useShield) {
  if (!player.pending_decision) {
    throw new Error("No pending shield decision");
  }

  if (typeof useShield !== "boolean") {
    throw new Error("useShield must be a boolean");
  }

  if (useShield && player.shields < 1) {
    throw new Error("No shield available");
  }

  const updated = { ...player };

  const pointsSaved = useShield
    ? updated.running_points
    : 0;

  if (useShield) {
    updated.total_points += pointsSaved;
    updated.shields -= 1;
  }

  updated.running_points = 0;
  updated.consecutive_rolls = 0;
  updated.pending_decision = false;

  return {
    player: updated,
    pointsSaved,
    turnEnded: true,
  };
}

export function processShieldPass(player) {
  if (player.pending_decision) {
    throw new Error("Resolve shield decision before passing");
  }

  return {
    ...player,
    total_points: player.total_points + player.running_points,
    running_points: 0,
    consecutive_rolls: 0,
  };
}
