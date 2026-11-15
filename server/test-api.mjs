// Greedy Pig API smoke tests.
// Start the server first (npm run dev / node src/index.js), then run:
//   node test-api.mjs
// Optional: BASE_URL=https://your-render-url node test-api.mjs
// Needs Node 18+ (built-in fetch).

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

async function main() {
  console.log(`Testing ${BASE}\n`);

  // ---- Health ----
  console.log("Health");
  let r = await call("GET", "/health");
  check("GET /health returns 200", r.status === 200, JSON.stringify(r));
  check("health status is ok", r.json?.status === "ok");

  // ---- Create game: valid, two players ----
  console.log("\nCreate game (2 players, maxPoints 50)");
  r = await call("POST", "/api/games", {
    playerNames: ["Ada", "Ben"],
    maxPoints: 50,
  });
  check("returns 201", r.status === 201, JSON.stringify(r));
  const game = r.json;
  check("max_points is 50", game?.max_points === 50);
  check("status is in_progress", game?.status === "in_progress");
  check("has 2 players", game?.players?.length === 2);
  check(
    "players ordered by seat (Ada=0, Ben=1)",
    game?.players?.[0]?.player_name === "Ada" &&
      game?.players?.[0]?.seat_order === 0 &&
      game?.players?.[1]?.player_name === "Ben" &&
      game?.players?.[1]?.seat_order === 1
  );
  check(
    "current turn is the first player",
    game?.current_turn_player_id === game?.players?.[0]?.id
  );
  check(
    "players start with 0 total and 0 running points",
    game?.players?.every((p) => p.total_points === 0 && p.running_points === 0)
  );
  check(
    "shield rows exist with defaults (trigger worked)",
    game?.players?.every(
      (p) =>
        p.consecutive_rolls === 0 &&
        p.shields === 0 &&
        p.pending_decision === false
    )
  );
  check("version starts at 0", game?.version === 0);
  check("no winner yet", game?.winner_player_id === null);

  // ---- Get game ----
  console.log("\nGet game");
  r = await call("GET", `/api/games/${game?.id}`);
  check("returns 200", r.status === 200, JSON.stringify(r));
  check("same id returned", r.json?.id === game?.id);
  check("max_points persisted as 50", r.json?.max_points === 50);
  check("players persisted", r.json?.players?.length === 2);
  check(
    "turn persisted",
    r.json?.current_turn_player_id === game?.players?.[0]?.id
  );

  // ---- Old single playerName body ----
  console.log("\nCreate game (old single playerName, default maxPoints)");
  r = await call("POST", "/api/games", { playerName: "Solo" });
  check("returns 201", r.status === 201, JSON.stringify(r));
  check("one player created", r.json?.players?.length === 1);
  check("default max_points applied", Number.isInteger(r.json?.max_points));
  check(
    "single player has the turn",
    r.json?.current_turn_player_id === r.json?.players?.[0]?.id
  );

  // ---- Boundary maxPoints values ----
  console.log("\nmaxPoints boundaries");
  r = await call("POST", "/api/games", { playerNames: ["A"], maxPoints: 10 });
  check("10 is accepted", r.status === 201, JSON.stringify(r));
  r = await call("POST", "/api/games", { playerNames: ["A"], maxPoints: 1000 });
  check("1000 is accepted", r.status === 201, JSON.stringify(r));

  // ---- Invalid maxPoints ----
  console.log("\nInvalid maxPoints (all should be 400)");
  for (const bad of [9, 1001, 0, -5, 50.5, "100", null]) {
    r = await call("POST", "/api/games", { playerNames: ["A"], maxPoints: bad });
    check(`maxPoints=${JSON.stringify(bad)} rejected`, r.status === 400, `got ${r.status}`);
  }

  // ---- Invalid names ----
  console.log("\nInvalid player names (all should be 400)");
  r = await call("POST", "/api/games", {});
  check("empty body rejected", r.status === 400, `got ${r.status}`);
  r = await call("POST", "/api/games", { playerNames: [] });
  check("empty playerNames array rejected", r.status === 400, `got ${r.status}`);
  r = await call("POST", "/api/games", { playerNames: ["Ada", "   "] });
  check("blank name rejected", r.status === 400, `got ${r.status}`);
  r = await call("POST", "/api/games", { playerNames: ["Ada", 42] });
  check("non-string name rejected", r.status === 400, `got ${r.status}`);
  r = await call("POST", "/api/games", { playerNames: ["x".repeat(31)] });
  check("31-character name rejected", r.status === 400, `got ${r.status}`);
  r = await call("POST", "/api/games", { playerNames: ["x".repeat(30)] });
  check("30-character name accepted", r.status === 201, `got ${r.status}`);

  // ---- Get game errors ----
  console.log("\nGet game errors");
  r = await call("GET", "/api/games/not-a-uuid");
  check("malformed id returns 400", r.status === 400, `got ${r.status}`);
  r = await call("GET", "/api/games/00000000-0000-0000-0000-000000000000");
  check("unknown id returns 404", r.status === 404, `got ${r.status}`);

  // ---- Unknown route ----
  console.log("\nUnknown route");
  r = await call("GET", "/nope");
  check("unknown route returns 404", r.status === 404, `got ${r.status}`);

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("\nCould not reach the server. Is it running?", err.message);
  process.exit(1);
});
