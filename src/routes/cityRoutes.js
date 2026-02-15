import express from "express";
import { getCitiesByRegion,getAllCities } from "../controllers/cityController.js";


const router = express.Router();

router.get("/region/:regionId", getCitiesByRegion);

router.get("/cities", getAllCities);

export default router;
