
import test from "node:test";
import assert from "node:assert/strict";

import {
  processShieldRoll,
  resolveShieldDecision,
  processShieldPass,
} from "./luckyShield.js";

function createPlayer(overrides = {}) {
  return {
    running_points: 0,
    total_points: 0,
    consecutive_rolls: 0,
    shields: 0,
    pending_decision: false,
    ...overrides,
  };
}

test("awards shield after 5 successful rolls", () => {
  let player = createPlayer();

  for (const dice of [2, 3, 4, 5, 6]) {
    player = processShieldRoll(player, dice).player;
  }

  assert.equal(player.shields, 1);
  assert.equal(player.consecutive_rolls, 5);
});

test("rolling 1 with a shield requires a decision", () => {
  const player = createPlayer({
    shields: 1,
    running_points: 24,
  });

  const result = processShieldRoll(player, 1);

  assert.equal(result.needsDecision, true);
  assert.equal(result.player.running_points, 24);
});

test("using shield banks points and consumes shield", () => {
  const player = createPlayer({
    shields: 1,
    running_points: 24,
    total_points: 30,
    pending_decision: true,
  });

  const result = resolveShieldDecision(player, true);

  assert.equal(result.player.total_points, 54);
  assert.equal(result.player.shields, 0);
  assert.equal(result.player.running_points, 0);
  assert.equal(result.player.pending_decision, false);
});

test("declining shield loses points but keeps shield", () => {
  const player = createPlayer({
    shields: 1,
    running_points: 24,
    pending_decision: true,
  });

  const result = resolveShieldDecision(player, false);

  assert.equal(result.player.running_points, 0);
  assert.equal(result.player.shields, 1);
});

test("passing preserves unused shield", () => {
  const player = createPlayer({
    shields: 1,
    running_points: 15,
    consecutive_rolls: 3,
  });

  const result = processShieldPass(player);

  assert.equal(result.total_points, 15);
  assert.equal(result.shields, 1);
  assert.equal(result.consecutive_rolls, 0);
});

test("rejects rolls while decision is pending", () => {
  const player = createPlayer({
    shields: 1,
    pending_decision: true,
  });

  assert.throws(
    () => processShieldRoll(player, 5),
    /Resolve the pending/
  );
});
