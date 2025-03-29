import  scrapeKrishiJagranNews  from "../utils/scraper.js";

export const getScrapedNews = async (_, res) => {
  const newsData = await scrapeKrishiJagranNews();
  res.json(newsData);
};
