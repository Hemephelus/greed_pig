import { Router } from "express";
import { asyncHandler } from "../utils/ApiError.js";
import { bankScore, createGame, getGame, rollDice, usePowerup } from "../controllers/game.controllers.js";

const router = Router();

//GET
router.get("/:game_id", asyncHandler(getGame));

//POST
router.post("/create", asyncHandler(createGame));
router.post("/roll", asyncHandler(rollDice));
router.post("/bank", asyncHandler(bankScore));
router.post("/powerup/use", asyncHandler(usePowerup));

export default router;
