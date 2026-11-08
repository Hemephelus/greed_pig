# Greedy Pig server

Express API that owns the game rules (dice and scoring) so players cannot cheat.
Game state is stored in Convex. If CONVEX_URL is not set it falls back to memory.

## Run locally
```bash
cd server
npm install
copy .env.example .env     # macOS/Linux: cp .env.example .env
npm run dev                # http://localhost:4000
npm test                   # runs the game-rule tests
```
Frontend: copy the root `.env.example` to `.env`, then `npm run dev` in the project root.

## Database (Convex)
```bash
cd server
npx convex dev             # first time: log in, create a project. Leave it running.
```
Copy the deployment URL (shown in the terminal, saved in `.env.local`, and on the Convex dashboard)
into `server/.env` as `CONVEX_URL`, then restart the server.
Only whoever edits files in `server/convex/` needs to run `npx convex dev`. Everyone else just needs the URL.

## Endpoints
| Method | Path | What it does |
|---|---|---|
| GET | /health | Is the server up? |
| POST | /games | Create a game. Body: `{ players: [{ name }], maxPoints }` |
| GET | /games/:id | Get a game's current state |
| POST | /games/:id/roll | Server rolls the die, applies the rules, saves. Returns `{ roll, game }` |
| POST | /games/:id/pass | Bank the running points and end the turn. Returns `{ game }` |

## Where to add features
- New rules or power-ups: `logic/game.js` (keep functions pure, add fields to the game state, add tests)
- New endpoints: a new file in `routes/`, registered in `index.js`
- New tables: add to `convex/schema.js`, add functions in `convex/`, and call them from `db.js`
