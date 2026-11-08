import test from "node:test";
import assert from "node:assert/strict";
import {
  createGame,
  applyRoll,
  applyPass,
  rollDie,
  validateNewGame,
  GameError,
} from "./game.js";

const newGame = (maxPoints = 50) =>
  createGame({ players: [{ name: "A" }, { name: "B" }], maxPoints });

test("rollDie always returns 1 to 6", () => {
  for (let i = 0; i < 1000; i++) {
    const r = rollDie();
    assert.ok(Number.isInteger(r) && r >= 1 && r <= 6);
  }
});

test("a non-1 roll adds to running points and keeps the turn", () => {
  const g = applyRoll(newGame(), 4);
  assert.equal(g.players[0].running_points, 4);
  assert.equal(g.currentPlayer, 0);
});

test("rolling a 1 wipes running points and passes the turn", () => {
  let g = applyRoll(newGame(), 5);
  g = applyRoll(g, 1);
  assert.equal(g.players[0].running_points, 0);
  assert.equal(g.players[0].total_points, 0);
  assert.equal(g.currentPlayer, 1);
});

test("passing banks points and passes the turn", () => {
  let g = applyRoll(newGame(), 6);
  g = applyPass(g);
  assert.equal(g.players[0].total_points, 6);
  assert.equal(g.players[0].running_points, 0);
  assert.equal(g.currentPlayer, 1);
});

test("turn order wraps around", () => {
  let g = applyPass(applyPass(newGame()));
  assert.equal(g.currentPlayer, 0);
});

test("reaching max score ends the game and sets the winner", () => {
  let g = newGame(25);
  for (let i = 0; i < 5; i++) g = applyRoll(g, 5);
  assert.equal(g.isGameOver, true);
  assert.equal(g.winner, 0);
});

test("no moves allowed after the game is over", () => {
  let g = newGame(25);
  for (let i = 0; i < 5; i++) g = applyRoll(g, 5);
  assert.throws(() => applyRoll(g, 3), GameError);
  assert.throws(() => applyPass(g), GameError);
});

test("applyRoll does not mutate the old state", () => {
  const before = newGame();
  applyRoll(before, 6);
  assert.equal(before.players[0].running_points, 0);
});

test("validation rejects bad input", () => {
  assert.throws(() => validateNewGame({}), GameError);
  assert.throws(() => validateNewGame({ players: [{ name: "A" }], maxPoints: 100 }), GameError);
  assert.throws(
    () => validateNewGame({ players: [{}, {}], maxPoints: "100" }),
    GameError
  );
  assert.throws(() => validateNewGame({ players: [{}, {}], maxPoints: 5 }), GameError);
});

test("validation cleans names and fills blanks", () => {
  const { players } = validateNewGame({
    players: [{ name: "  Ada  " }, { name: "" }],
    maxPoints: 100,
  });
  assert.equal(players[0].name, "Ada");
  assert.equal(players[1].name, "Player 2");
});
