import express from "express"
const router = express.Router();
import { getScrapedNews } from "../controllers/scrapeController.js";

router.get("/api/news", getScrapedNews);

export default router;