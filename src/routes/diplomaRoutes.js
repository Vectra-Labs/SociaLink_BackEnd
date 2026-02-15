import express from "express";
import { uploadDiploma, deleteDiploma, downloadDiploma } from "../controllers/diplomaController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { uploadPdf } from "../middleware/uploadPdfMiddleware.js";

const router = express.Router();

router.post("/add", authMiddleware, roleMiddleware("WORKER"), uploadPdf.single("file"), uploadDiploma);
router.delete("/:id", authMiddleware, roleMiddleware("WORKER"), deleteDiploma);
router.get("/:id/download", authMiddleware, downloadDiploma); // Open to authenticated users (controller handles check)

export default router;
