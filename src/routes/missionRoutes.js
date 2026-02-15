import express from "express";
import {createMission,getMyEstablishmentMissions,getMissionApplications,applyToMission,getPublicMissions } from "../controllers/missionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

import { createMissionSchema } from "../validators/authSchema.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.post("/missions",authMiddleware,roleMiddleware("ESTABLISHMENT"),validate(createMissionSchema),createMission);
router.get("/establishments/missions",authMiddleware,roleMiddleware("ESTABLISHMENT"),getMyEstablishmentMissions);

router.get("/missions/:id/applications",authMiddleware,roleMiddleware("ESTABLISHMENT"),getMissionApplications);

router.post("/missions/:id/apply",authMiddleware,roleMiddleware("WORKER"),applyToMission);

router.get(
  "/missions",
  authMiddleware,
  roleMiddleware("WORKER"),
  getPublicMissions
);

export default router;