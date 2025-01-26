import { Router } from "express";
import getStatuses from "../controllers/status.controllers.js";

const router = Router();
router.get("/", getStatuses);
export default router;
