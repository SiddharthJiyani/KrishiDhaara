import express from "express"
import {uploadHumidityData, getHumidityAnalytics, changeHumiState,getAllHumiState} from '../controllers/humidityController.js'
const router=express.Router();
import cors from "cors";

// const allowAllOriginsPolicy = cors({
//     origin:"*",
//     methods:['GET','POST',"PUT","PATCH"],
//     credentials:true
// })

const allowAllOriginsPolicy = cors({
    origin: function(origin, callback) {
        callback(null, origin);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
})

router.post("/upload",allowAllOriginsPolicy,uploadHumidityData)
router.get("/getAnalytics/:sensorNumber",getHumidityAnalytics)
router.post("/changeState/:sensorNumber",allowAllOriginsPolicy,changeHumiState)
router.get("/getState",allowAllOriginsPolicy,getAllHumiState)

export default router;