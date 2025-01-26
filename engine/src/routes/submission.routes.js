import { Router } from "express";
import {makeSubmission} from "../controllers/submission.controller.js"
const router = Router();
router.post("/", makeSubmission);
export default router;