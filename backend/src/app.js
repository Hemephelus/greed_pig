import express from "express";
import cors from "cors";
import gameRoutes from "./routes/game.routes.js";

import healthRoutes from "./routes/health.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

const origins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(cors({ origin: origins }));

app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api/game", gameRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
