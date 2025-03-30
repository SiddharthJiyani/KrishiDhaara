import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Groq from "groq-sdk";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const groq = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });

const CropRecommendationForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    moisture: "",
    temperature: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [validation, setValidation] = useState({
      isValid: true,
      requiresReview: false,
      warnings: {}
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setRecommendation("");

    try {
      // Validate inputs
      const values = Object.values(formData);
      if (values.some((val) => val === "" || isNaN(val))) {
        throw new Error(t("diseasePage.cropRecommendation.fillAllFields"));
      }

      setIsLoading(true);

      const prompt = `As an expert agronomist, follow these strict guidelines:
          1. Recommend ONLY crops suitable for these parameters:
            - Nitrogen: ${formData.nitrogen}ppm (ideal: 20-100ppm)
            - Phosphorus: ${formData.phosphorus}ppm (ideal: 15-60ppm)
            - Potassium: ${formData.potassium}ppm (ideal: 100-250ppm)
            - Soil Moisture: ${formData.moisture}% (ideal: 40-70%)
            - Temperature: ${formData.temperature}°C (ideal: 15-35°C)

          2. Safety rules:
            - Never recommend crops requiring >5°C different temperature
            - Avoid suggesting chemically intensive solutions
            - Flag parameters outside ideal ranges

          Format response in markdown with these exact sections:
          # Crop Recommendation Analysis
          ## Suitable Crop Options (max 3)
          ## Soil Health Assessment
          ## Risk Factors
          ## Sustainable Practices`;

      const response = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content:
              "You are an expert agricultural assistant. Provide detailed crop recommendations with technical analysis. Always use markdown formatting.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      
      if (!response?.choices?.[0]?.message?.content) {
        throw new Error(t("diseasePage.cropRecommendation.invalidResponse"));
      }

      const content = response.choices[0].message.content;

      const validateResponse = (content) => {
        const requiredSections = [
          'Suitable Crop Options',
          'Soil Health Assessment',
          'Risk Factors',
          'Sustainable Practices'
        ];

        const warnings = {
          experimental: /experimental|untested/i.test(content),
          riskyCrops: /risk of|not recommended/i.test(content),
          missingData: requiredSections.some(section => !content.includes(section))
        };

        return {
          isValid: !warnings.experimental && !warnings.riskyCrops,
          requiresReview: warnings.experimental || warnings.riskyCrops,
          warnings
        };
      };

      const validation = validateResponse(content);
      setValidation(validation);

      
      // Set the recommendation state directly
      setRecommendation(content);
      
    } catch (error) {
      setError(
        error.message || t("diseasePage.cropRecommendation.failedRecommendation")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
  };

  // Get placeholder text based on field name
  const getPlaceholder = (field) => {
    const fieldLabel = t(`diseasePage.cropRecommendation.${field}`);
    let unit = "";
    
    if (field === "moisture") {
      unit = t("diseasePage.cropRecommendation.percent");
    } else if (field === "temperature") {
      unit = t("diseasePage.cropRecommendation.celsius");
    } else {
      unit = t("diseasePage.cropRecommendation.ppm");
    }
    
    return `${fieldLabel} (${unit})`;
  };

  return (
    <div className="mb-8 p-6 bg-[#09090b] border border-[#27272a] rounded-xl shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {Object.keys(formData).map((key) => (
            <input
              key={key}
              type="number"
              name={key}
              value={formData[key]}
              onChange={handleInputChange}
              placeholder={getPlaceholder(key)}
              className="p-3 bg-[#1c1c20] rounded-lg focus:ring-2 focus:ring-green-500 border-none"
              min="0"
              step="0.1"
            />
          ))}
        </div>

        {error && (
          <div className="text-red-400 p-3 bg-red-900/20 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 relative">
          {isLoading && (
            <span className="absolute left-4 top-3">
              <span className="animate-spin">🔄</span>
            </span>
          )}
          {isLoading ? t("diseasePage.cropRecommendation.analyzing") : t("diseasePage.cropRecommendation.submitButton")}
        </button>
      </form>

      {/* Separate the recommendation section from the form */}
      {recommendation && (
        <div className={`mt-6 p-6 rounded-xl shadow-lg border ${
          validation.requiresReview 
            ? 'border-amber-500 bg-amber-500/10'
            : 'border-green-500 bg-[#1c1c20]'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xl font-bold text-green-400">
              {t("diseasePage.cropRecommendation.recommendationResult")}
            </h3>
            {validation.requiresReview && (
              <span className="px-2 py-1 text-sm bg-amber-500/20 text-amber-300 rounded-full">
                {t("diseasePage.cropRecommendation.expertReview")}
              </span>
            )}
          </div>
          
          {validation.warnings.missingData && (
            <div className="mb-4 p-3 bg-red-500/20 rounded-lg">
              ⚠️ {t("diseasePage.cropRecommendation.incompleteAnalysis")}
            </div>
          )}

          <div className="prose prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {recommendation}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropRecommendationForm;