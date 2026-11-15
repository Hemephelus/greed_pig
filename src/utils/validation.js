import {
  MAX_NAME_LENGTH,
  MAX_PLAYERS,
  MAX_TARGET,
  MIN_PLAYERS,
  MIN_TARGET,
} from "src/constants/game";
import { toPlayerNames } from "src/mappers/gameMappers";
import { isValidLevel, MAX_LEVEL, MIN_LEVEL } from "src/computer/difficulty";

// Checks the setup screen BEFORE calling POST /game/create, using the same
// rules as the backend, so players see a friendly message instead of a 400.
//
// setupPlayers: the setup screen's player list
//   ({ name, tag, pig_index, is_computer?, difficulty? })
// winningTarget: the "Max Score" input value (can be a string from <input>)
//
// Returns { ok: true, payload: { playerNames, winningTarget } }
//      or { ok: false, errors: ["..."] }
export function validateSetup({ setupPlayers, winningTarget }) {
  const errors = [];

  if (!Array.isArray(setupPlayers) || setupPlayers.length < MIN_PLAYERS) {
    errors.push(`Add at least ${MIN_PLAYERS} players.`);
  } else if (setupPlayers.length > MAX_PLAYERS) {
    errors.push(`You can have at most ${MAX_PLAYERS} players.`);
  }

  const playerNames = toPlayerNames(setupPlayers || []);
  playerNames.forEach((name, i) => {
    if (name.length < 1) errors.push(`Player ${i + 1} needs a name.`);
    if (name.length > MAX_NAME_LENGTH) {
      errors.push(`Player ${i + 1}'s name must be ${MAX_NAME_LENGTH} characters or fewer.`);
    }
  });

  // Computer players
  const list = Array.isArray(setupPlayers) ? setupPlayers : [];
  if (list.length && list.every((p) => p.is_computer)) {
    errors.push("At least one player must be a person.");
  }
  list.forEach((p, i) => {
    if (p.is_computer && !isValidLevel(p.difficulty)) {
      errors.push(`Player ${i + 1} (computer) needs a difficulty from ${MIN_LEVEL} to ${MAX_LEVEL}.`);
    }
  });

  // <input type="number"> gives a string. The backend needs a whole number.
  const target = Number(winningTarget);
  if (!Number.isInteger(target) || target < MIN_TARGET || target > MAX_TARGET) {
    errors.push(`Max score must be a whole number from ${MIN_TARGET} to ${MAX_TARGET}.`);
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, payload: { playerNames, winningTarget: target } };
}
