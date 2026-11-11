import { Router } from "express";
import { asyncHandler } from "../utils/ApiError.js";
import { createGame, getGame } from "../controllers/game.controllers.js";

const router = Router();

router.post("/create", asyncHandler(createGame));
router.get("/:game_id", asyncHandler(getGame));

export default router;
