import express from "express";
import { getAllSpecialities } from "../controllers/specialityController.js";

const router = express.Router();

router.get("/", getAllSpecialities);

export default router;
