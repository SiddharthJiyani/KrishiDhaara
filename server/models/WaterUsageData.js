import mongoose from "mongoose";

const waterUsageSchema = new mongoose.Schema({
    relayNumber: {
      type: String,
      required: true,
      index: true
    },
    startTimestamp: {
      type: Number,
      required: true
    },
    endTimestamp: {
      type: Number,
      required: true
    },
    durationMinutes: {
      type: Number,
      required: true
    },
    waterUsageLiters: {
      type: Number,
      required: true
    },
    recordedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  }, { timestamps: false });

  const WaterUsageData = mongoose.model('waterusagedata', waterUsageSchema);

  export default WaterUsageData;