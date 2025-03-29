import express from "express"
import {uploadTemperatureData,getTemperatureAnalytics,changeTempState,getAllTempState} from '../controllers/temperatureController.js'
const router=express.Router();
import cors from "cors";

const allowAllOriginsPolicy = cors({
    origin: function(origin, callback) {
        callback(null, origin);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
})

router.post("/upload",allowAllOriginsPolicy,uploadTemperatureData)
router.get("/getAnalytics/:sensorNumber",getTemperatureAnalytics)
router.post("/changeState/:sensorNumber",allowAllOriginsPolicy,changeTempState)
router.get("/getState",allowAllOriginsPolicy,getAllTempState)

export default router;