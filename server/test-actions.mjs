// Greedy Pig gameplay tests: roll, pass, shield decision, win.
// Start the server first, then run:   node test-actions.mjs
// Optional: BASE_URL=https://your-render-url node test-actions.mjs
// Dice are random, so the script checks rules that must hold for ANY roll,
// and plays real games until the shield and win cases happen.

const BASE = process.env.BASE_URL || "http://localhost:4000";

let passed = 0;
let failed = 0;

async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    // non-JSON response
  }
  return { status: res.status, json };
}

function check(name, condition, extra = "") {
  if (condition) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name} ${extra}`);
  }
}

const roll = (gameId, playerId) =>
  call("POST", `/api/games/${gameId}/roll`, { playerId });
const pass = (gameId, playerId) =>
  call("POST", `/api/games/${gameId}/pass`, { playerId });
const decide = (gameId, playerId, useShield) =>
  call("POST", `/api/games/${gameId}/shield/decision`, { playerId, useShield });

const current = (g) => g.players.find((p) => p.id === g.current_turn_player_id);
const otherThan = (g, id) => g.players.find((p) => p.id !== id);
const byId = (g, id) => g.players.find((p) => p.id === id);

async function newGame(maxPoints) {
  const r = await call("POST", "/api/games", {
    playerNames: ["Ada", "Ben"],
    maxPoints,
  });
  if (r.status !== 201) throw new Error("Could not create game: " + JSON.stringify(r));
  return r.json;
}

// Rolls as whoever's turn it is until a shield decision is pending.
async function rollUntilPending(game, maxActions = 400) {
  let g = game;
  for (let i = 0; i < maxActions; i++) {
    const r = await roll(g.id, g.current_turn_player_id);
    if (r.status !== 200) {
      check("roll during search returned 200", false, JSON.stringify(r));
      return null;
    }
    g = r.json;
    if (g.lastAction.needsDecision) return g;
  }
  return null;
}

async function main() {
  console.log(`Testing ${BASE}\n`);

  // ---------- Request validation and turn rules ----------
  console.log("Validation and turn rules");
  let game = await newGame(1000);
  const ada = game.players[0];
  const ben = game.players[1];

  let r = await call("POST", `/api/games/${game.id}/roll`, {});
  check("roll without playerId returns 400", r.status === 400, `got ${r.status}`);
  r = await roll(game.id, "not-a-uuid");
  check("roll with malformed playerId returns 400", r.status === 400, `got ${r.status}`);
  r = await roll(game.id, "00000000-0000-0000-0000-000000000000");
  check("roll with a player not in the game returns 400", r.status === 400, `got ${r.status}`);
  r = await roll(game.id, ben.id);
  check("roll out of turn returns 409", r.status === 409, `got ${r.status}`);
  r = await pass(game.id, ben.id);
  check("pass out of turn returns 409", r.status === 409, `got ${r.status}`);
  r = await decide(game.id, ada.id, true);
  check("decision with nothing pending returns 409", r.status === 409, `got ${r.status}`);
  r = await roll("00000000-0000-0000-0000-000000000000", ada.id);
  check("roll on unknown game returns 404", r.status === 404, `got ${r.status}`);
  r = await roll("not-a-uuid", ada.id);
  check("roll on malformed game id returns 400", r.status === 400, `got ${r.status}`);

  // ---------- First roll ----------
  console.log("\nFirst roll");
  r = await roll(game.id, ada.id);
  check("roll returns 200", r.status === 200, JSON.stringify(r));
  let g = r.json;
  const dice = g?.lastAction?.diceValue;
  check("dice value is 1 to 6", Number.isInteger(dice) && dice >= 1 && dice <= 6, `got ${dice}`);
  check("version increased to 1", g?.version === 1);
  if (dice === 1) {
    check("rolling a 1 ends the turn", g.current_turn_player_id === ben.id);
    check("rolling a 1 zeroes running points", byId(g, ada.id).running_points === 0);
    check("lastAction says busted", g.lastAction.busted === true);
  } else {
    check("rolling 2-6 keeps the turn", g.current_turn_player_id === ada.id);
    check("running points equal the dice value", byId(g, ada.id).running_points === dice);
    check("streak is 1", byId(g, ada.id).consecutive_rolls === 1);
  }

  // ---------- Pass ----------
  console.log("\nPass");
  const before = byId(g, g.current_turn_player_id);
  r = await pass(g.id, before.id);
  check("pass returns 200", r.status === 200, JSON.stringify(r));
  const afterPass = r.json;
  const bankedPlayer = byId(afterPass, before.id);
  check(
    "pass banks running points into total",
    bankedPlayer?.total_points === before.total_points + before.running_points
  );
  check("pass zeroes running points", bankedPlayer?.running_points === 0);
  check("pass resets the streak", bankedPlayer?.consecutive_rolls === 0);
  check(
    "pass moves the turn to the other player",
    afterPass?.current_turn_player_id === otherThan(afterPass, before.id).id
  );
  check("version increased again", afterPass?.version === 2);

  // ---------- Shield decision: use the shield ----------
  console.log("\nShield decision (use shield). Rolling until one is pending...");
  game = await newGame(1000);
  g = await rollUntilPending(game);
  check("a pending shield decision was reached", g !== null);
  if (g) {
    const p = current(g);
    const other = otherThan(g, p.id);
    check("pending player has 1 shield", p.shields === 1);
    check("pending flag is set", p.pending_decision === true);
    check("streak was reset by the 1", p.consecutive_rolls === 0);
    check("turn is kept while waiting", g.current_turn_player_id === p.id);

    r = await roll(g.id, p.id);
    check("roll while decision pending returns 409", r.status === 409, `got ${r.status}`);
    r = await pass(g.id, p.id);
    check("pass while decision pending returns 409", r.status === 409, `got ${r.status}`);
    r = await decide(g.id, other.id, true);
    check("decision from the wrong player returns 409", r.status === 409, `got ${r.status}`);
    r = await decide(g.id, p.id, "yes");
    check("non-boolean useShield returns 400", r.status === 400, `got ${r.status}`);
    r = await call("POST", `/api/games/${g.id}/shield/decision`, { playerId: p.id });
    check("missing useShield returns 400", r.status === 400, `got ${r.status}`);

    r = await decide(g.id, p.id, true);
    check("using the shield returns 200", r.status === 200, JSON.stringify(r));
    const after = byId(r.json, p.id);
    check("points were banked", after?.total_points === p.total_points + p.running_points);
    check("shield was consumed", after?.shields === 0);
    check("running points cleared", after?.running_points === 0);
    check("pending flag cleared", after?.pending_decision === false);
    check("turn moved to the other player", r.json?.current_turn_player_id === other.id);

    r = await decide(g.id, other.id, true);
    check("deciding again returns 409", r.status === 409, `got ${r.status}`);
  }

  // ---------- Shield decision: decline ----------
  console.log("\nShield decision (decline). Rolling until one is pending...");
  game = await newGame(1000);
  g = await rollUntilPending(game);
  check("a pending shield decision was reached", g !== null);
  if (g) {
    const p = current(g);
    const other = otherThan(g, p.id);
    r = await decide(g.id, p.id, false);
    check("declining returns 200", r.status === 200, JSON.stringify(r));
    const after = byId(r.json, p.id);
    check("total points unchanged", after?.total_points === p.total_points);
    check("running points lost", after?.running_points === 0);
    check("shield kept", after?.shields === 1);
    check("pending flag cleared", after?.pending_decision === false);
    check("turn moved to the other player", r.json?.current_turn_player_id === other.id);
  }

  // ---------- Win ----------
  console.log("\nWin condition (maxPoints 10). Playing until someone wins...");
  game = await newGame(10);
  g = game;
  for (let i = 0; i < 500 && g.status === "in_progress"; i++) {
    const id = g.current_turn_player_id;
    r = await roll(g.id, id);
    if (r.status !== 200) {
      check("roll during win test returned 200", false, JSON.stringify(r));
      break;
    }
    g = r.json;
    if (g.lastAction.needsDecision) {
      r = await decide(g.id, id, true);
      g = r.json;
    }
  }
  check("game finished", g?.status === "finished", `status ${g?.status}`);
  check("winner is recorded", !!g?.winner_player_id);
  if (g?.winner_player_id) {
    const w = byId(g, g.winner_player_id);
    check(
      "winner's total + running reached maxPoints",
      w.total_points + w.running_points >= 10,
      `${w.total_points} + ${w.running_points}`
    );
    check("winning roll reported in lastAction", g.lastAction?.won === true);

    r = await roll(g.id, g.current_turn_player_id);
    check("roll after the game ends returns 409", r.status === 409, `got ${r.status}`);
    r = await pass(g.id, g.current_turn_player_id);
    check("pass after the game ends returns 409", r.status === 409, `got ${r.status}`);
  }

  // ---------- Single player ----------
  console.log("\nSingle player game");
  r = await call("POST", "/api/games", { playerNames: ["Solo"], maxPoints: 1000 });
  const solo = r.json;
  r = await pass(solo.id, solo.players[0].id);
  check("pass in a one-player game keeps the turn", r.json?.current_turn_player_id === solo.players[0].id);

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("\nTest run failed:", err.message);
  process.exit(1);
});
