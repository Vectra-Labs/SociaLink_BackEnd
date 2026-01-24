import express from "express";
import {createMission,getMyEstablishmentMissions,getMissionApplications,applyToMission } from "../controllers/missionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/missions",authMiddleware,roleMiddleware("ESTABLISHMENT"),createMission);

router.get("/establishments/missions",authMiddleware,roleMiddleware("ESTABLISHMENT"),getMyEstablishmentMissions);

router.get("/missions/:id/applications",authMiddleware,roleMiddleware("ESTABLISHMENT"),getMissionApplications);

router.post("/missions/:id/apply",authMiddleware,roleMiddleware("WORKER"),applyToMission);

export default router;