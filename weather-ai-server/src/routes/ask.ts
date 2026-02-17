import { Router } from "express";
import { askAI } from "../controllers/ask.controller";

const router = Router();

router.post("/", askAI);

export default router;
