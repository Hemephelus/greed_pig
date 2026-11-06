# Greedy Pig Reimagined

A multiplayer take on the classic dice game **Greedy Pig**, built for CSC 419 (Advances in Web, Mobile and Blockchain Development) at Pan-Atlantic University.

**Live site:** https://greed-pig.vercel.app

Base project: [Hemephelus/greed_pig](https://github.com/Hemephelus/greed_pig)

## Team

| Name                          | Matric number | Main responsibilities                                                     |
| ----------------------------- | ------------- | ------------------------------------------------------------------------- |
| Kolawole Agbolade (team lead) | `23120112006` | Backend setup, authentication, game engine, power-ups, deployment, README |
| `Gabriel Mamman`              | `23120112028` | Online rooms, lobby, sign-in and home screens, game screen                |
| `Leonard Okolie`              | `23120112040` | Match history, loading and error states, mobile layout, accessibility     |

## How the game works

Players take turns rolling a die and building up **running points**.

- Roll 2 to 6: the number is added to your running points. Roll again or **Pass**.
- Roll a **1**: you lose your running points and your turn ends.
- **Pass** to bank your running points into your total and end your turn.
- The first player to reach the target score wins. The host chooses the target (25 to 500 points).

## Our three improvements

### 1. Gameplay: Power-ups

Roll a 6 to earn a random power-up. You can hold up to 2 and use one on your own turn.

| Power-up    | Effect                                           |
| ----------- | ------------------------------------------------ |
| Shield      | Survive your next roll of 1 and keep your points |
| Double Down | Your next roll counts double                     |
| Freeze      | The next player skips their next turn            |
| Reverse     | Flips the direction of play, like the Uno card   |

All power-up rules are applied on the server. Full rules are in [docs/powerups.md](docs/powerups.md).

### 2. Multiplayer: Online rooms

Players sign in, create a room, and share a 6-character code. Friends join from their own devices, and everyone sees the game update in real time. `<PERSON B: add details, e.g. max 6 players, host starts the game>`

### 3. Competition: Match history

Every finished game is saved to the signed-in player's account. The history page shows past games, results, scores and stats such as wins and win rate. `<PERSON C: add details once built>`

## Backend

The game uses a real backend on [Convex](https://www.convex.dev/): a database, server functions and realtime updates.

**Key game logic runs on the server.** The dice are rolled in `convex/game.js`, not in the browser, so players cannot cheat by changing the page. Each action is checked on the server: the player must be signed in, in the room, and it must be their turn.

### API (Convex functions)

| Function               | Type     | What it does                                                                       |
| ---------------------- | -------- | ---------------------------------------------------------------------------------- |
| `rooms:createRoom`     | mutation | Validates the target score, creates a room with a unique code and adds the host    |
| `rooms:joinRoom`       | mutation | Adds a player to a lobby (max 6 players)                                           |
| `rooms:startGame`      | mutation | Host only, needs 2+ players                                                        |
| `rooms:getRoom`        | query    | Live room state and players                                                        |
| `game:roll`            | mutation | Rolls the die on the server, applies the rules, awards power-ups, checks for a win |
| `game:pass`            | mutation | Banks running points and ends the turn                                             |
| `game:activatePowerUp` | mutation | Uses a held power-up                                                               |
| `users:me`             | query    | The signed-in user                                                                 |
| `history:*`            | query    | `<PERSON C: list the match history functions>`                                     |

### Validation

- Target score must be a whole number between 25 and 500.
- Only the host can start a game, and only with 2 or more players.
- Only the player whose turn it is can roll, pass or use a power-up.
- A player cannot pass with 0 running points.
- Players can hold at most 2 power-ups.

### Database tables

- `users` and auth tables (Convex Auth, email and password)
- `rooms`: code, host, target score, status, current seat, direction, winner
- `roomPlayers`: player, seat, scores, held power-ups, active effects
- `turns`: a log of every roll, pass and power-up use

## Tech stack

- React 18, Vite, Tailwind CSS, React Router
- Convex (database, server functions, realtime) and Convex Auth
- Vercel (hosting)

## Run it locally

You need Node.js 18 or newer.

```bash
git clone https://github.com/urban13e3/greed_pig.git
cd greed_pig
npm install
```

Start the backend (log in to Convex when asked and create a project). Leave this terminal running:

```bash
npx convex dev
```

In a second terminal, set up sign-in on your dev backend (once):

```bash
npx @convex-dev/auth
```

Then start the app in the second terminal:

```bash
npm run dev
```

Open http://localhost:5173.

`npx convex dev` writes `VITE_CONVEX_URL` to `.env.local` for you. No other secrets are needed.

### Testing power-ups quickly

Waiting for a 6 is slow. On your **dev** backend only, you can turn on a testing tool:

```bash
npx convex env set ALLOW_DEV_TOOLS true
```

It is never enabled on production.

## Deployment

The frontend is on Vercel and the backend is on a production Convex deployment. Vercel's build command deploys both together:

```
npx convex deploy --cmd-url-env-var-name VITE_CONVEX_URL --cmd 'npm run build'
```

This needs a `CONVEX_DEPLOY_KEY` environment variable in Vercel (Production only). Every merge to `main` redeploys the site.

## Project structure

```
convex/        Backend: schema, auth, rooms, game rules, history
src/routes/    Pages
src/components/  Reusable UI (power-up tray, badges, direction arrow, toasts)
docs/          Design notes, including power-up rules
```

## Use of AI tools

We used AI assistants to help plan, write and debug parts of this project. Every member can explain the code they submitted.
