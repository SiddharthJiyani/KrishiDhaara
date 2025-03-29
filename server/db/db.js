import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB connected successfully');

    const humicollection = await mongoose.connection.db.listCollections({name: 'humiditydatas'}).toArray();
    if(humicollection.length===0) {
      await mongoose.connection.db.createCollection('humiditydatas',{
        timeseries: {
          timeField: 'timestamp',
          metaField: 'metadata',
          granularity: 'seconds'
        }
      });
    } 

    const tempcollection = await mongoose.connection.db.listCollections({name: 'temperaturedatas'}).toArray();
    if(tempcollection.length===0) {
      await mongoose.connection.db.createCollection('temperaturedatas',{
        timeseries: {
          timeField: 'timestamp',
          metaField: 'metadata',
          granularity: 'seconds'
        }
      });
    } 

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;