import express from "express";
import { uploadImage } from "../middleware/uploadImageMiddleware.js";

import {updateWorkerProfile, addWorkerSpecialities,getWorkerSpecialities,removeWorkerSpeciality,submitWorkerProfile,getWorkerProfile,getWorkerNotifications} from "../controllers/workerController.js";

import {updateWorkerProfile, addWorkerSpecialities,getWorkerSpecialities,removeWorkerSpeciality} from "../controllers/workerController.js";

import { validate } from "../middleware/validateMiddleware.js";
import { updateWorkerProfileSchema ,addWorkerSpecialitiesSchema } from "../validators/authSchema.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";


const router = express.Router();


// Protection globale WORKER
router.use(authMiddleware, roleMiddleware("WORKER"));

router.put("/profile/update",uploadImage.single("photo"),validate(updateWorkerProfileSchema),updateWorkerProfile);
router.post( "/add/specialities",validate(addWorkerSpecialitiesSchema),addWorkerSpecialities);
router.get("/specialities",getWorkerSpecialities);
router.delete("/specialities/:id",removeWorkerSpeciality);
router.post("/submit",submitWorkerProfile);


router.put("/profile/update", authMiddleware,roleMiddleware("WORKER"),uploadImage.single("photo"),validate(updateWorkerProfileSchema),updateWorkerProfile);
router.post( "/add/specialities",authMiddleware,roleMiddleware("WORKER"),validate(addWorkerSpecialitiesSchema),addWorkerSpecialities);
router.get("/specialities",authMiddleware,roleMiddleware("WORKER"),getWorkerSpecialities);
router.delete("/specialities/:id",authMiddleware,roleMiddleware("WORKER"),removeWorkerSpeciality);

router.get("/profile",getWorkerProfile);


router.get("/notifications",getWorkerNotifications);




export default router;