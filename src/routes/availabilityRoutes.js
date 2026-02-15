import express from "express";
import { upsertAvailability, getWorkerAvailability, getMyAvailability } from "../controllers/availabilityController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Routes pour les travailleurs (Gérer leur propre calendrier)
router.post("/", authMiddleware, roleMiddleware("WORKER"), upsertAvailability);
router.get("/mine", authMiddleware, roleMiddleware("WORKER"), getMyAvailability);

// Route publique/étab (Consulter la disponibilité d'un travailleur)
router.get("/worker/:id", authMiddleware, getWorkerAvailability);

export default router;
