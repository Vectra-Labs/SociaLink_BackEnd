import express from "express";
import {acceptApplication, rejectApplication } from "../controllers/applicationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();


router.patch("/applications/:id/accept",authMiddleware,roleMiddleware("ESTABLISHMENT"),acceptApplication);

router.patch("/applications/:id/reject",authMiddleware,roleMiddleware("ESTABLISHMENT"),rejectApplication);
