import mongoose, { SchemaType } from "mongoose";

const humidityDataSchema=new mongoose.Schema({
    timestamp:{type:Date,required:true},
    metadata:{
        sensorNumber:String,
        units:String
    },
    humidity:mongoose.Schema.Types.Double
}, { versionKey: false })

// humidityDataSchema.plugin(timeseriesPlugin, {
//     target: 'HumidityData',
//     dateField: 'timestamp',
//     resolutions: ['minute', 'day'],
//     key: {
//       sensorNumber: 1
//     },
//     data: {
//       humidity: {
//         source: 'humidity',
//         operations: ['sum', 'max', 'min'],
//         calculations: ['average']
//       }
//     }
//   });

const HumidityData = mongoose.model('HumidityData', humidityDataSchema);
export default HumidityData