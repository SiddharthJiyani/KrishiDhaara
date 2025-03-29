import HumidityData from "../models/HumidityData.js";
import { firebase_db } from "../config/firebase.js";
import { ref, get, set, update } from "firebase/database";
import moment from "moment";

export const uploadHumidityData = async (req, res) => {
  try {
    const { sensorNumber, units, humidity } = req.body;

    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
    const istDate = new Date(now.getTime() + istOffset);

    const newHumidityData = new HumidityData({
      timestamp: istDate,
      metadata: { sensorNumber, units },
      humidity,
    });

    await newHumidityData.save();

    return res
      .status(201)
      .send({ success: true, message: "Humidity data uploaded successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};


export const getHumidityAnalytics = async (req, res) => {
  try {
    const { startStamp, endStamp, interval } = req.query;
    const { sensorNumber } = req.params;

    if (!startStamp || !endStamp || !interval) {
      return res.status(400).send({
        success: false,
        message: "Missing required parameters: startStamp, endStamp, or interval",
      });
    }

    let dateFormat;
    switch (interval) {
      case "year":
        dateFormat = "%Y";
        break;
      case "month":
        dateFormat = "%Y-%m";
        break;
      case "day":
        dateFormat = "%Y-%m-%d";
        break;
      default:
        return res.status(400).send({
          success: false,
          message: "Interval should be year, month, or day",
        });
    }

    const [sy, sm, sd] = startStamp.split("-").map(Number);
    const [ey, em, ed] = endStamp.split("-").map(Number);
    let startDate = new Date(sy, sm - 1, sd);
    let endDate = new Date(ey, em - 1, ed);

    const aggregate_pipeline = [
      {
        $match: {
          timestamp: {
            $gte: startDate,
            $lte: endDate,
          },
          "metadata.sensorNumber": sensorNumber,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$timestamp" } },
          totalDocuments: { $sum: 1 },
          avgHumidity: { $avg: "$humidity" },
          minHumidity: { $min: "$humidity" },
          maxHumidity: { $max: "$humidity" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ];

    let result = await HumidityData.aggregate(aggregate_pipeline);

    // if (interval === "day") {
    //   result = result.map(entry => ({
    //     time: moment(entry._id, "YYYY-MM-DD").format("DD-MM-YYYY"), 
    //     value: entry.avgHumidity, 
    //   }));
    // }

    return res.status(200).send({ success: true, message: result });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false, message: "Internal server error" });
  }
};


export const changeHumiState = async (req, res) => {
  try {
    const { sensorNumber } = req.params;
    const { state } = req.body;

    const sensorRef = ref(firebase_db, `humidity-sensors/${sensorNumber}`);
    const snapshot = await get(sensorRef);

    if (!snapshot.exists()) {
      await set(sensorRef, { state });
      return res.status(200).send({
        success: true,
        message: `Sensor ${sensorNumber} created with state ${state}`,
      });
    } else {
      await update(sensorRef, { state });
      return res.status(200).send({
        success: true,
        message: `Sensor ${sensorNumber} changed to state ${state}`,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

export const getAllHumiState = async (req, res) => {
  try {
    const sensorRef = ref(firebase_db, `humidity-sensors`);
    const snapshot = await get(sensorRef);

    if (!snapshot.exists()) {
      return res.status(400).send({
        success: false,
        message: `Sensors does not exist`,
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
          states: sensorsArray,
        },
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};
