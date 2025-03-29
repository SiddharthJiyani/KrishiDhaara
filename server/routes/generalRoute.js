import express from "express"
import {getLatest,addSensorToList,getSensorList,getSensorStates,getInsights} from "../controllers/generalController.js"
const router=express.Router();


router.get("/getLatest",getLatest);
router.post("/addSensor/:sensorType",addSensorToList)
router.get('/getSensor/:sensorType',getSensorList)
router.get('/getSensorState',getSensorStates)
router.get('/getInsights',getInsights);

export default router;