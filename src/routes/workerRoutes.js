import express from "express";
import { uploadImage } from "../middleware/uploadImageMiddleware.js";
import {updateWorkerProfile, addWorkerSpecialities,getWorkerSpecialities} from "../controllers/workerController.js";
import { validate } from "../middleware/validateMiddleware.js";
import { updateWorkerProfileSchema ,addWorkerSpecialitiesSchema } from "../validators/authSchema.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";


const router = express.Router();


router.put("/profile/update", authMiddleware,roleMiddleware("WORKER"),uploadImage.single("photo"),validate(updateWorkerProfileSchema),updateWorkerProfile);

router.post( "/add/specialities",authMiddleware,roleMiddleware("WORKER"),validate(addWorkerSpecialitiesSchema),addWorkerSpecialities);

router.get("/specialities",authMiddleware,roleMiddleware("WORKER"),getWorkerSpecialities);

export default router;