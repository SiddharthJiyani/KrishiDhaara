import { firebase_db } from "../config/firebase.js"
import { ref, get, set, update } from "firebase/database";
import WaterUsageData from "../models/WaterUsageData.js";

export const changeRelayState = async (req, res) => {
    try {
        const { state } = req.body;
        const { sensorNumber } = req.params;

        const sensorRef = ref(firebase_db, `relay-sensors/${sensorNumber}`);
        const snapshot = await get(sensorRef);

        if (!snapshot.exists()) {
            await set(sensorRef, { state });
            return res.status(200).send({
                success: true,
                message: `Sensor created with state ${state}`
            });
        } else {
            await update(sensorRef, { state });
            return res.status(200).send({
                success: true,
                message: `Sensor ${sensorNumber} changed to state ${state}`
            });
        }

    } catch (error) {
        console.log(error)
        return res.status(500).send({ "success": false, "message": "Internal server error" });
    }
}

export const getRelayState = async (req, res) => {
    try {

        const sensorRef = ref(firebase_db, `relay-sensors`);
        const snapshot = await get(sensorRef);

        if (!snapshot.exists()) {
            return res.status(400).send({
                success: false,
                message: `Sensor ${sensorNumber} does not exist`
            });
        } else {
            const sensorData = snapshot.val();

            const sensorsArray = Object.keys(sensorData).map((sensorId) => ({
                sensorNumber: sensorId,
                state: sensorData[sensorId].state,
            }));

            return res.status(200).send({
                success: true,
                message: {
                    states: sensorsArray
                }
            });
        }

    } catch (error) {
        console.log(error)
        return res.status(500).send({ "success": false, "message": "Internal server error" });
    }
}

export const getWaterUsage = async (req, res) => {
    try {
        const { sensorNumber } = req.params;
        let { startStamp, endStamp } = req.query;

        let filter = {};

        if (sensorNumber && sensorNumber !== 'all') {
            filter.relayNumber = sensorNumber;
        }

        if (startStamp || endStamp) {
            // Convert date strings to Unix timestamps
            if (startStamp) {
                // Convert YYYY-MM-DD to Unix timestamp
                const startDate = new Date(startStamp);
                startStamp = Math.floor(startDate.getTime() / 1000);
                filter.startTimestamp = { $gte: startStamp };
                console.log(`Start date ${startStamp} converted to timestamp: ${startStamp}`);
            }

            if (endStamp) {
                // Convert YYYY-MM-DD to Unix timestamp
                const endDate = new Date(endStamp);
                // Set to end of day for inclusive results
                endDate.setHours(23, 59, 59, 999);
                endStamp = Math.floor(endDate.getTime() / 1000);
                filter.endTimestamp = { $lte: endStamp };
                console.log(`End date ${endStamp} converted to timestamp: ${endStamp}`);
            }
        }

        // Fetch data with pagination
        const result = await WaterUsageData.find(filter)
            .sort({ recordedAt: -1 })
            .exec();

        // console.log(result)
        const formattedResult = result.map(record => {
            const item = record.toObject();
            
            // Format startTimestamp
            if (item.startTimestamp) {
                const startDate = new Date(item.startTimestamp * 1000);
                const startYear = startDate.getFullYear();
                const startMonth = String(startDate.getMonth() + 1).padStart(2, '0');
                const startDay = String(startDate.getDate()).padStart(2, '0');
                const startHours = String(startDate.getHours()).padStart(2, '0');
                const startMinutes = String(startDate.getMinutes()).padStart(2, '0');
                
                item.startTimestamp = `${startYear}-${startMonth}-${startDay}T${startHours}:${startMinutes}`;
            }
            
            // Format endTimestamp
            if (item.endTimestamp) {
                const endDate = new Date(item.endTimestamp * 1000);
                const endYear = endDate.getFullYear();
                const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
                const endDay = String(endDate.getDate()).padStart(2, '0');
                const endHours = String(endDate.getHours()).padStart(2, '0');
                const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
                
                item.endTimestamp = `${endYear}-${endMonth}-${endDay}T${endHours}:${endMinutes}`;
            }
            
            // recordedAt is already in ISO format
            return item;
        });

        return res.status(200).send({
            success: true,
            message: formattedResult
        });

    } catch (error) {
        console.log(error)
        return res.status(500).send({ "success": false, "message": "Internal server error" });
    }
}