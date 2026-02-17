import { Router } from "express";
import { getForecast } from "../controllers/forecast.controller";

const router = Router();
router.get("/", getForecast);
export default router;
