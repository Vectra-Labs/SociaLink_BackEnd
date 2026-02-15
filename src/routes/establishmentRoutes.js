import express from "express";
import {
    searchWorkers,
    getWorkerById,
    getMyProfile,
    updateMyProfile,
    getEstablishmentNotifications,
    markEstablishmentNotificationAsRead,
    markAllEstablishmentNotificationsAsRead,
    getEstablishmentStats
} from "../controllers/establishmentController.js";
import { uploadImage } from "../middleware/uploadImageMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/workers", authMiddleware, roleMiddleware("ESTABLISHMENT"), searchWorkers);
router.get("/workers/:id", authMiddleware, roleMiddleware("ESTABLISHMENT"), getWorkerById);

// Profile
router.get("/profile", authMiddleware, roleMiddleware("ESTABLISHMENT"), getMyProfile);
router.put("/profile", authMiddleware, roleMiddleware("ESTABLISHMENT"), uploadImage.single("logo"), updateMyProfile);

// Notifications
router.get("/notifications", authMiddleware, roleMiddleware("ESTABLISHMENT"), getEstablishmentNotifications);
router.put("/notifications/:id/read", authMiddleware, roleMiddleware("ESTABLISHMENT"), markEstablishmentNotificationAsRead);
router.put("/notifications/read-all", authMiddleware, roleMiddleware("ESTABLISHMENT"), markAllEstablishmentNotificationsAsRead);

// Dashboard Stats
router.get("/stats", authMiddleware, roleMiddleware("ESTABLISHMENT"), getEstablishmentStats);

export default router;
