import express from "express";
import cors from "cors";
import gameRoutes from "./routes/game.routes.js";
import testRoutes from "./routes/test.routes.js";

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

// Test-only routes for the power-up tests. Local use ONLY:
// set ENABLE_TEST_ROUTES=true in backend/.env 
if (process.env.ENABLE_TEST_ROUTES === "true") {
  app.use("/api/test", testRoutes);
  console.warn("WARNING: test routes are ON (ENABLE_TEST_ROUTES=true). Never enable this on the deployed server.");
}

app.use(notFound);
app.use(errorHandler);

export default app;
