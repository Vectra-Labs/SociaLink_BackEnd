import express from "express";
import { getAdminNotifications,getWorkersUnderReview ,approveWorker,rejectWorker,markNotificationAsRead,markAllNotificationsAsRead,
    getWorkerById
} from "../controllers/adminController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Protection globale ADMIN
router.use(authMiddleware, roleMiddleware("ADMIN"));

router.get("/notifications",getAdminNotifications);
router.get("/workers", getWorkersUnderReview);
router.get("/workers/:id", getWorkerById);

router.patch("/workers/:id/approve", approveWorker);
router.patch("/workers/:id/reject", rejectWorker);
router.patch("/notifications/:id/read", markNotificationAsRead);
router.patch("/notifications/read-all", markAllNotificationsAsRead);


export default router;
