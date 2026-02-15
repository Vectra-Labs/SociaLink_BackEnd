import express from "express";
import { uploadImage } from "../middleware/uploadImageMiddleware.js";

import {
    updateWorkerProfile, addWorkerSpecialities, getWorkerSpecialities, removeWorkerSpeciality, submitWorkerProfile, getWorkerProfile, getWorkerNotifications, markWorkerNotificationAsRead,
    markAllWorkerNotificationsAsRead, getMyMissions, downloadCV
} from "../controllers/workerController.js";


import { validate } from "../middleware/validateMiddleware.js";
import { updateWorkerProfileSchema, addWorkerSpecialitiesSchema } from "../validators/authSchema.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";


const router = express.Router();


// Routes partagées (CV) - Accessibles auth (Worker, Admin, Establishment)
router.get("/cv/download/:workerId", authMiddleware, downloadCV);
router.get("/cv/download", authMiddleware, downloadCV);

// Protection globale WORKER
router.use(authMiddleware, roleMiddleware("WORKER"));

// Supporte à la fois la photo et le CV
router.put("/profile/update", uploadImage.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'cv', maxCount: 1 }
]), validate(updateWorkerProfileSchema), updateWorkerProfile);

router.post("/add/specialities", validate(addWorkerSpecialitiesSchema), addWorkerSpecialities);
router.get("/specialities", getWorkerSpecialities);
router.delete("/specialities/:id", removeWorkerSpeciality);
router.post("/submit", submitWorkerProfile);




router.get("/profile", getWorkerProfile);
router.get("/applications", getMyMissions);

router.get("/notifications", getWorkerNotifications);

router.patch("/notifications/:id/read", markWorkerNotificationAsRead);
router.patch("/notifications/read-all", markAllWorkerNotificationsAsRead);






export default router;