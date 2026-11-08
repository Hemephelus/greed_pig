import "dotenv/config";
import express from "express";
import cors from "cors";
import gamesRouter from "./routes/games.js";
import { GameError } from "./logic/game.js";

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "10kb" }));

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/games", gamesRouter);

app.use((req, res) => res.status(404).json({ error: "Not found." }));

// Central error handler: known game errors keep their message, anything else is hidden.
app.use((err, req, res, next) => {
  if (err instanceof GameError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "Invalid request body." });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Greedy Pig server running on port ${PORT}`));
