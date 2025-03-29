import express from "express"
import {getRelayState,changeRelayState} from '../controllers/relayController.js'
const router=express.Router();
import cors from "cors"

const allowAllOriginsPolicy = cors({
    origin: function(origin, callback) {
        callback(null, origin);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
})


router.post("/changeState/:sensorNumber",allowAllOriginsPolicy,changeRelayState)
router.get("/getState/",allowAllOriginsPolicy,getRelayState)

export default router;