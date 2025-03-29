import React, { useState, useEffect, use } from "react";
import {
  Search,
  ArrowRight,
  ChevronRight,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/Input";
import axios from "axios";
import { motion } from "framer-motion";

// Function to modify image URL with appropriate width
const getOptimizedImageUrl = (url, width) => {
  if (!url) return "/placeholder.svg";
  
  // Check if the URL already has width parameter
  if (url.includes("width=")) {
    // Replace the width parameter with the new width
    return url.replace(/width=\d+/, `width=${width}`);
  } 
  
  // If URL has query parameters, append width
  if (url.includes("?")) {
    return `${url}&width=${width}`;
  }
  
  // If URL doesn't have query parameters, add width
  return `${url}?width=${width}`;
};

// Main Component
function NewsPage() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [newsData, setNewsData] = useState({ news: [] }); // Initialize with empty news array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const articlesPerPage = 6;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Define image widths for different contexts
  const imageWidths = {
    featured: 800,    // Featured article (large)
    card: 400,        // News card in grid
    thumbnail: 100    // Small thumbnail in latest updates
  };

  const fetchNews = async () => {
    setLoading(true);
    try {
      //  using axios
      const response = await axios.get(
        // "http://localhost:3000/api/news"
        `${BACKEND_URL}/api/news`,
        // {withCredentials: true}
      );
      const data = await response.data;
      setNewsData(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching news:", error);
      setError("Failed to load news data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMounted(true);
  }, []);

  // Safely access news data with fallbacks
  const news = newsData?.news || [];

  // Randomly select a featured article from the top 10
  const featuredArticle = news.length > 0 
    ? news.slice(0, Math.min(10, news.length))[
        Math.floor(Math.random() * Math.min(10, news.length))
      ]
    : null;

  const latestUpdates = news
    .filter(article => article !== featuredArticle)
    .slice(0, 3);

  const filteredArticles = news.filter((article) => {
    if (searchQuery) {
      return article.title.toLowerCase().includes(searchQuery.toLowerCase());
    }

    if (activeTab === "all") {
      return true;
    }

    return article.category?.includes(activeTab);
  });

  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * articlesPerPage,
    currentPage * articlesPerPage
  );

  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  const handleTabChange = (value) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  if (!mounted) return null;


  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black text-white"
    >
      <div className="relative pb-16 pt-16">
        <div className="absolute brightness-50 inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center"></div>
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative container mx-auto px-4"
        >
          <div className="max-w-3xl">
            <motion.h1 
              initial={{ y: -20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-4 text-4xl font-bold text-white"
            >
              Agricultural News & Insights
            </motion.h1>
            <motion.p 
              initial={{ y: -20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-8 text-lg text-gray-300"
            >
              Stay informed with the latest developments, innovations, and best
              practices in agriculture and sustainable farming
            </motion.p>

            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                type="text"
                placeholder="Search for news articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 pl-10 text-white placeholder:text-gray-400 focus:bg-white/20"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>

      <main className="container mx-auto px-4 py-12">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center items-center py-20"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </motion.div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-10"
          >
            <div className="text-red-500 mb-4">{error}</div>
            <Button onClick={fetchNews}>Retry</Button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid gap-12 md:grid-cols-3"
          >
            <div className="md:col-span-2">
              {featuredArticle && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="mb-12"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <h2 className="text-xl font-bold">Featured Article</h2>
                  </div>

                  <motion.div 
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden rounded-lg border border-gray-800 bg-[#121215]"
                  >
                    <div className="relative h-64 w-full">
                      <img
                        src={getOptimizedImageUrl(featuredArticle.image, imageWidths.featured)}
                        alt={featuredArticle.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="p-6">
                      <div className="mb-2">
                        <span className="inline-block rounded bg-green-500 px-2 py-1 text-xs font-semibold uppercase text-black">
                          Featured
                        </span>
                      </div>

                      <h3 className="mb-4 text-2xl font-bold">
                        {featuredArticle.title}
                      </h3>

                      <div className="mb-4 flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{featuredArticle.date}</span>
                        </div>
                        <div>•</div>
                        <div>{featuredArticle.source}</div>
                      </div>

                      <p className="mb-6 text-gray-300">
                        Discover the health benefits of Gorakhpur Kalanamak Rice,
                        a protein-rich superfood that's ideal for diabetic
                        patients and health-conscious individuals.
                      </p>

                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={featuredArticle.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-green-600">
                        Read Full Article
                        <ExternalLink className="h-4 w-4" />
                      </motion.a>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="mb-6 flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <h2 className="text-xl font-bold">Agricultural News</h2>
                </div>

                <Tabs defaultValue="all" className="mb-8">
                  <TabsList className="bg-zinc-100 text-slate-400 dark:bg-[#27272a]">
                    <TabsTrigger
                      value="all"
                      onClick={() => handleTabChange("all")}>
                      All News
                    </TabsTrigger>
                    <TabsTrigger
                      value="Crops & Cultivation"
                      onClick={() => handleTabChange("Crops & Cultivation")}>
                      Crops & Cultivation
                    </TabsTrigger>
                    <TabsTrigger
                      value="AgTech & Innovation"
                      onClick={() => handleTabChange("AgTech & Innovation")}>
                      AgTech & Innovation
                    </TabsTrigger>
                    <TabsTrigger
                      value="Sustainable Farming"
                      onClick={() => handleTabChange("Sustainable Farming")}>
                      Sustainable Farming
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {paginatedArticles.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {paginatedArticles.map((article, index) => (
                      <motion.div
                        key={index}
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ 
                          duration: 0.5, 
                          delay: 0.1 * Math.min(index, 5) 
                        }}
                        whileHover={{ y: -5 }}
                        className="overflow-hidden rounded-lg border border-gray-800 bg-[#121215]">
                        <div className="relative h-40 w-full">
                          <img
                            src={getOptimizedImageUrl(article.image, imageWidths.card)}
                            alt={article.title}
                            className="h-full w-full object-cover"
                            loading="lazy" // Add lazy loading for performance
                          />
                        </div>

                        <div className="p-4">
                          <div className="mb-4 flex items-center gap-2 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            <span>{article.date}</span>
                            <span>•</span>
                            <span>{article.source}</span>
                          </div>

                          <h3 className="mb-4 text-lg font-bold">
                            {article.title}
                          </h3>

                          <motion.a
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium text-green-500 hover:text-green-400">
                            Read Article
                            <ArrowRight className="h-3 w-3" />
                          </motion.a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-10 text-gray-400"
                  >
                    No articles found for the selected criteria.
                  </motion.div>
                )}

                {totalPages > 1 && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-8 flex items-center justify-center gap-2"
                  >
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}>
                        Previous
                      </Button>
                    </motion.div>

                    <span className="text-sm text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>

                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}>
                        Next
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="mb-6 flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <h2 className="text-xl font-bold">Latest Updates</h2>
              </div>

              <div className="space-y-6">
                {latestUpdates.length > 0 ? (
                  latestUpdates.map((article, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ x: 20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      whileHover={{ x: 5 }}
                      className="flex gap-4"
                    >
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                        <img
                          src={getOptimizedImageUrl(article.image, imageWidths.thumbnail)}
                          alt={article.title}
                          className="h-full w-full object-cover"
                          loading="lazy" // Add lazy loading for performance
                        />
                      </div>

                      <div>
                        <h3 className="mb-1 font-medium">{article.title}</h3>
                        <div className="mb-2 text-xs text-gray-400">
                          {article.date}
                        </div>
                        <motion.a
                          whileHover={{ x: 3 }}
                          transition={{ duration: 0.2 }}
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-green-500 hover:text-green-400">
                          Read More
                          <ChevronRight className="h-3 w-3" />
                        </motion.a>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-6 text-gray-400"
                  >
                    No updates available.
                  </motion.div>
                )}
              </div>

              <motion.div 
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 w-full"
              >
                <Button variant="outline" className="w-full">
                  <a
                    href="/news"
                    className="flex w-full items-center justify-center gap-2">
                    View All News
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </main>

    </motion.div>
  );
}

export default NewsPage;