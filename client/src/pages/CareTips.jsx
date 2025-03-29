import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Cloud,
  Leaf,
  BookOpen,
  BarChart2,
  ArrowLeft,
  Droplet,
  Calendar,
  Thermometer,
  Sun,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "../components/ui/Input";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import "../i18n";

export default function CareTips() {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Define care tips with icons but get content from translations
  const careTipsIcons = {
    watering: <Droplet className="h-8 w-8 text-blue-500" />,
    sunlight: <Sun className="h-8 w-8 text-yellow-500" />,
    soil: <Leaf className="h-8 w-8 text-green-500" />,
    seasonal: <Calendar className="h-8 w-8 text-purple-500" />,
    climate: <Thermometer className="h-8 w-8 text-red-500" />,
  };

  const filterTips = () => {
    const categories = Object.keys(careTipsIcons);
    if (activeCategory === "all") {
      return categories;
    }
    return categories.filter((key) => key === activeCategory);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredTips = filterTips().filter(category => {
    const title = t(`careTips.tips.${category}.title`);
    const description = t(`careTips.tips.${category}.description`);
    const tips = [];
    
    // Get all tips for this category
    for (let i = 0; i < 5; i++) {
      tips.push(t(`careTips.tips.${category}.tips.${i}`));
    }
    
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tips.some(tip => tip.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Function to toggle language
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <ArrowLeft className="h-5 w-5" />
            <span>{t("careTips.backToDashboard")}</span>
          </Link>

        </div>

        <h1 className="text-3xl font-bold text-green-500">{t("careTips.title")}</h1>
        <p className="text-muted-foreground">
          {t("careTips.subtitle")}
        </p>

        <div className="flex flex-col gap-4 sm:flex-row mb-8 mt-6">
          <Input
            type="text"
            placeholder={t("careTips.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Tabs defaultValue="all">
            <TabsList className="bg-gray-100 text-slate-400 dark:bg-[#27272a] cursor-pointer">
              <TabsTrigger
                value="all"
                onClick={() => setActiveCategory("all")}
                className={
                  activeCategory === "all" ? "bg-white dark:bg-gray-100" : ""
                }>
                {t("careTips.categories.all")}
              </TabsTrigger>
              {Object.keys(careTipsIcons).map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  onClick={() => setActiveCategory(category)}
                  className={
                    activeCategory === category
                      ? "bg-white dark:bg-gray-100"
                      : ""
                  }>
                  {t(`careTips.categories.${category}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTips.map((category) => (
            <Card key={category} className="fade-in">
              <CardHeader>
                <div className="mb-2">{careTipsIcons[category]}</div>
                <CardTitle>{t(`careTips.tips.${category}.title`)}</CardTitle>
                <CardDescription>{t(`careTips.tips.${category}.description`)}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2" />
                      <span className="text-sm">{t(`careTips.tips.${category}.tips.${index}`)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <style>{`
        .fade-in {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}