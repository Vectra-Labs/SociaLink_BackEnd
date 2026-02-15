import express from "express";
import { acceptApplication, rejectApplication, markAsCompletedByWorker, confirmCompletion } from "../controllers/applicationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();


router.patch("/:id/accept", authMiddleware, roleMiddleware("ESTABLISHMENT"), acceptApplication);

router.patch("/:id/reject", authMiddleware, roleMiddleware("ESTABLISHMENT"), rejectApplication);

router.patch("/:id/worker-complete", authMiddleware, roleMiddleware("WORKER"), markAsCompletedByWorker);

router.patch("/:id/confirm-complete", authMiddleware, roleMiddleware("ESTABLISHMENT"), confirmCompletion);

export default router;
