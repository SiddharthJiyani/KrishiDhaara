import mongoose, { SchemaType } from "mongoose";

const temperatureDataSchema=new mongoose.Schema({
    timestamp:{type:Date,required:true},
    metadata:{
        sensorNumber:String,
        units:String
    },
    temperature:mongoose.Schema.Types.Double
}, { versionKey: false })

// temperatureDataSchema.plugin(timeseriesPlugin, {
//     target: 'TemperatureData',
//     dateField: 'timestamp',
//     resolutions: ['minute', 'day'],
//     key: {
//       sensorNumber: 1
//     },
//     data: {
//       temperature: {
//         source: 'temperature',
//         operations: ['sum', 'max', 'min'],
//         calculations: ['average']
//       }
//     }
//   });

const TemperatureData = mongoose.model('TemperatureData', temperatureDataSchema);
export default TemperatureData