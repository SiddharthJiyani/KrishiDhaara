import mongoose from "mongoose";

const sensorListSchema = new mongoose.Schema({
    sensortype: String,
    sensors:[String]
});

const SensorList = mongoose.model("SensorList",sensorListSchema);
export default SensorList;