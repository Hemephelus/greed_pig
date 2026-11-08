import { Router } from "express";
import {
  GameError,
  validateNewGame,
  createGame,
  rollDie,
  applyRoll,
  applyPass,
} from "../logic/game.js";
import { createGameRecord, loadGame, saveGame } from "../db.js";

const router = Router();

// Express 4 does not catch errors thrown in async handlers, so wrap them.
const handle = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// What we send to the browser: the state plus the game's id.
const toPublic = (id, state) => ({ id, ...state });

async function getOr404(id) {
  const state = await loadGame(id);
  if (!state) throw new GameError("Game not found.", 404);
  return state;
}

// Create a game
router.post(
  "/",
  handle(async (req, res) => {
    const input = validateNewGame(req.body);
    const state = createGame(input);
    const id = await createGameRecord(state);
    res.status(201).json(toPublic(id, state));
  })
);

// Read a game
router.get(
  "/:id",
  handle(async (req, res) => {
    const state = await getOr404(req.params.id);
    res.json(toPublic(req.params.id, state));
  })
);

// Roll the dice. The server rolls, applies the rules and saves the result.
router.post(
  "/:id/roll",
  handle(async (req, res) => {
    const state = await getOr404(req.params.id);
    const roll = rollDie();
    const next = applyRoll(state, roll);
    await saveGame(req.params.id, next);
    res.json({ roll, game: toPublic(req.params.id, next) });
  })
);

// Pass: bank the points and end the turn
router.post(
  "/:id/pass",
  handle(async (req, res) => {
    const state = await getOr404(req.params.id);
    const next = applyPass(state);
    await saveGame(req.params.id, next);
    res.json({ game: toPublic(req.params.id, next) });
  })
);

export default router;
