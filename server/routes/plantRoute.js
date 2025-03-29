import express from "express"
const router=express.Router();
import {getPlantDiseaseStats} from "../controllers/generalController.js";

router.get("/getDiseaseStats",getPlantDiseaseStats);

export default router;