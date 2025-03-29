import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './db/db.js';
import dotenv from "dotenv"
import temperatureRoute from "./routes/temperatureRoute.js"
import humidityRoute from "./routes/humidityRoute.js"
import relayRouter from "./routes/relayRoute.js"
import authRouter from "./routes/authRoute.js"
import generalRouter from "./routes/generalRoute.js"
import plantRouter from "./routes/plantRoute.js"
import scrapeRouter from "./routes/scrapeRoute.js"
import reportRouter from "./routes/reportRoute.js"
dotenv.config()

const app = express();
connectDB();

app.set('trust proxy', 1);
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173","https://krishi-dhaara-hackcrux.vercel.app"],
  credentials: true
}));
app.options('*', cors()); 


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }))

app.use('/SensorData/temperature',temperatureRoute)
app.use('/SensorData/humidity',humidityRoute)
app.use('/SensorData/relay',relayRouter)
app.use('/SensorData',generalRouter)
app.use('/auth',authRouter)
app.use('/PlantPrediction',plantRouter)
app.use('/report',reportRouter)
app.use('/', scrapeRouter);

app.get('/', (req, res) => {
  res.send('Hello from Irrigation Node Backend!');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});