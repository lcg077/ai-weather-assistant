import { Router } from "express";
import {
  createRequest,
  listRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  exportRequests,
  clearAll,
} from "../controllers/requests.controller";

const router = Router();

router.post("/", createRequest);
router.get("/", listRequests);
router.get("/export", exportRequests);
router.get("/:id", getRequestById);
router.put("/:id", updateRequest);
router.delete("/:id", deleteRequest);
router.delete("/", clearAll);

export default router;
