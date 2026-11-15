import { Router } from "express";
import { supabase } from "../config/supabase.js";
import { ApiError, asyncHandler } from "../utils/ApiError.js"

const router = Router();

router.get(
  "/health",
  asyncHandler(async (req, res) => {
    // ask Supabase to count rows in each table
    const tables = ["game_sessions", "players", "player_powerups"];
    const counts = {};

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });

      if (error) {
        throw new ApiError(
          503,
          "DATABASE_UNAVAILABLE",
          `Could not reach table "${table}": ${error.message}`
        );
      }
      counts[table] = count;
    }

    res.json({ success: true, server: "ok", database: "connected", rows: counts });
  })
);

export default router;
