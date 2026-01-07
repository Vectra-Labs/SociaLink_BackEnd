import express from "express";
import { uploadDiploma } from "../controllers/diplomaController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { uploadPdf } from "../middleware/uploadPdfMiddleware.js";

const router = express.Router();

router.post("/add",authMiddleware,roleMiddleware("WORKER"),uploadPdf.single("file"),uploadDiploma);

export default router;
