import { Router } from "express";
import { asyncHandler } from "../utils/ApiError.js";
import { createGame } from "../controllers/game.controllers.js";

const router = Router();

router.post("/create", asyncHandler(createGame));

export default router;
