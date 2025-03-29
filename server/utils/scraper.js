import axios from "axios";
import * as cheerio from "cheerio";

/**

The type of data i want in return is 
    {
      "title": "Gorakhpur Kalanamak Rice: A Protein-Packed, Diabetic-Friendly Superfood for a Healthier Diet",
      "link": "https://krishijagran.com/agripedia/gorakhpur-kalanamak-rice-a-protein-packed-diabetic-friendly-superfood-for-a-healthier-diet/",
      "image": "https://kj1bcdn.b-cdn.net/media/102539/black-rice.jpg?width=120&format=webp",
      "category": "Crops & Cultivation", 
      "date": "March 22, 2025",
      "source": "Krishi Jagran" // constant
    }

    category - random from Crops & Cultivation, AgTech & Innovation, Sustainable Farming
    for date fabricate randomly 10 days near the current date

 */

// Function to generate a random date within ±10 days from today
const getRandomDate = () => {
  const today = new Date();
  const randomOffset = -(Math.floor(Math.random() * 11)); // Random from -10 to 0 days (past only)
  today.setDate(today.getDate() + randomOffset);
  return today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

// List of random categories
const categories = ["Crops & Cultivation", "AgTech & Innovation", "Sustainable Farming"];

const scrapeKrishiJagranNews = async () => {
  try {
    const url = "https://krishijagran.com/";
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const $ = cheerio.load(data);
    let news = [];

    // Scrape from <ul class="list-unstyled">
    $(".list-unstyled li.sec-2").each((index, element) => {
      let title = $(element).find("h2 a").text().trim();
      let link = "https://krishijagran.com" + $(element).find("h2 a").attr("href");
      let image = $(element).find(".img img").attr("src") || null;
      let category = categories[Math.floor(Math.random() * categories.length)]; // Random category
      let date = getRandomDate(); // Random fabricated date

      if (title && link) {
        news.push({ title, link, image, category, date, source: "Krishi Jagran" });
      }
    });

    // Scrape from <div class="home-top-l">
    $(".home-top-l .home-top-main-post, .home-top-l .main-post-item").each((index, element) => {
      let title = $(element).find("h1 a, h2 a").text().trim();
      let link = "https://krishijagran.com" + $(element).find("h1 a, h2 a").attr("href");
      let image = $(element).find("img").attr("src") || null;
      let category = categories[Math.floor(Math.random() * categories.length)];
      let date = getRandomDate();

      if (title && link) {
        news.push({ title, link, image, category, date, source: "Krishi Jagran" });
      }
    });

    // Scrape categories (Farm Mechanization, Blogs, Others, etc.)
    $(".home-cat .cat-flex").each((index, element) => {
      let categoryTitle = $(element).find(".cat-h a").text().trim();
      $(element).find("ul.list-unstyled li").each((i, liElement) => {
        let title = $(liElement).find("a").text().trim();
        let link = "https://krishijagran.com" + $(liElement).find("a").attr("href");
        let image = $(liElement).find("img").attr("src") || null;
        let category = categories[Math.floor(Math.random() * categories.length)];
        let date = getRandomDate();

        if (title && link) {
          news.push({ title, link, image, category, date, source: "Krishi Jagran" });
        }
      });
    });

    return { numArticles: news.length, news };
  } catch (error) {
    console.error("Error scraping news:", error);
    return { numArticles: 0, news: [] };
  }
};

export default scrapeKrishiJagranNews;
