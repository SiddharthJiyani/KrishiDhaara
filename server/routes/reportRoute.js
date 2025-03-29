import express from "express"
import {getReport} from "../controllers/generalController.js"
const router=express.Router();

router.get("/getReport",getReport);

export default router;