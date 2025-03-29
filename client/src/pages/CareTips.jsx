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
import { Input } from "../components/ui/Input";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const careTips = {
  watering: {
    icon: <Droplet className="h-8 w-8 text-blue-500" />,
    title: "Proper Watering Techniques",
    description:
      "Learn how to water your plants effectively to promote healthy growth.",
    tips: [
      "Water deeply and less frequently to encourage deep root growth",
      "Water at the base of plants to avoid wetting the foliage",
      "Water in the early morning to reduce evaporation",
      "Use a moisture meter to determine when plants need water",
      "Adjust watering frequency based on season, temperature, and humidity",
    ],
  },
  sunlight: {
    icon: <Sun className="h-8 w-8 text-yellow-500" />,
    title: "Optimizing Sunlight Exposure",
    description:
      "Understand the light requirements for different types of plants.",
    tips: [
      "Most vegetables need at least 6 hours of direct sunlight daily",
      "Rotate potted plants regularly for even growth",
      "Use shade cloth during intense summer heat",
      "South-facing windows provide the most light for indoor plants",
      "Consider supplemental grow lights for indoor plants during winter",
    ],
  },
  soil: {
    icon: <Leaf className="h-8 w-8 text-green-500" />,
    title: "Soil Health Management",
    description: "Maintain nutrient-rich soil for optimal plant growth.",
    tips: [
      "Test soil pH and nutrient levels annually",
      "Add organic matter like compost to improve soil structure",
      "Use mulch to conserve moisture and suppress weeds",
      "Rotate crops to prevent soil depletion",
      "Avoid compacting soil around plant roots",
    ],
  },
  seasonal: {
    icon: <Calendar className="h-8 w-8 text-purple-500" />,
    title: "Seasonal Care Guidelines",
    description: "Adjust your gardening practices with the changing seasons.",
    tips: [
      "Prepare plants for winter by reducing fertilization in late summer",
      "Protect sensitive plants from frost with covers or bring them indoors",
      "Increase watering during hot summer months",
      "Prune most plants during their dormant season",
      "Apply fertilizer at the beginning of the growing season",
    ],
  },
  climate: {
    icon: <Thermometer className="h-8 w-8 text-red-500" />,
    title: "Climate Adaptation Strategies",
    description: "Help your plants thrive in challenging climate conditions.",
    tips: [
      "Group plants with similar water and light needs together",
      "Create microclimates using structures, trees, or other plants",
      "Use raised beds for better drainage in wet climates",
      "Install drip irrigation for water conservation in dry climates",
      "Choose native plants adapted to your local climate",
    ],
  },
};

export default function CareTips() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filterTips = () => {
    if (activeCategory === "all") {
      return Object.entries(careTips);
    }
    return Object.entries(careTips).filter(([key]) => key === activeCategory);
  };

    React.useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  const filteredTips = filterTips().filter(
    ([_, content]) =>
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.tips.some((tip) =>
        tip.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-green-500">Plant Care Tips</h1>
        <p className="text-muted-foreground">
          Expert advice for maintaining healthy plants and optimal growth
        </p>

        <div className="flex flex-col gap-4 sm:flex-row mb-8">
          <Input
            type="text"
            placeholder="Search for tips..."
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
                All
              </TabsTrigger>
              {Object.keys(careTips).map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  onClick={() => setActiveCategory(category)}
                  className={
                    activeCategory === category
                      ? "bg-white dark:bg-gray-100"
                      : ""
                  }>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTips.map(([key, content]) => (
            <Card key={key} className="fade-in">
              <CardHeader>
                <div className="mb-2">{content.icon}</div>
                <CardTitle>{content.title}</CardTitle>
                <CardDescription>{content.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {content.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      <span className="text-sm">{tip}</span>
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
