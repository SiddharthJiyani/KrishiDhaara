import { firebase_db } from "../config/firebase.js"
import { ref, get, set, update } from "firebase/database";

export const changeRelayState = async (req, res) => {
    try {
        const { state } = req.body;
        const {sensorNumber} = req.params;

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

export const getRelayState = async (req,res) => {
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