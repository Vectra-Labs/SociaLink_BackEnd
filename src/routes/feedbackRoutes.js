import express from "express";
import { createFeedback, getWorkerFeedbacks } from "../controllers/feedbackController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// POST /api/feedbacks (Establishment creates feedback)
router.post("/", authMiddleware, roleMiddleware("ESTABLISHMENT"), createFeedback);

// GET /api/feedbacks/worker/:id (Public or protected retrieval of worker feedbacks)
router.get("/worker/:id", getWorkerFeedbacks);

export default router;
