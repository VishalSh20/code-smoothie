import { Router } from "express";
import {makeSubmission,getSubmissionStatus, makeBatchedSubmissions} from "../controllers/submission.controller.js"
const router = Router();
router.post("/", makeSubmission);
router.post("/batch", makeBatchedSubmissions);
router.get("/", getSubmissionStatus);
export default router;