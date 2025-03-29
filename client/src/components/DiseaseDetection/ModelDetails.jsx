import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Brain, Zap, Database } from "lucide-react";

export default function ModelDetails() {
  const { t } = useTranslation();
  
  return (
    <Card className="mb-6 bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-white flex items-center">
          <span className="mr-2">{t("diseasePage.modelDetails.title")}</span>
        </CardTitle>
        <CardDescription>{t("diseasePage.modelDetails.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div className="flex items-start space-x-3">
            <div className="bg-green-500/10 p-2 rounded-lg">
              <Brain className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">{t("diseasePage.modelDetails.aiPowered")}</h3>
              <p className="text-xs text-gray-400">{t("diseasePage.modelDetails.aiPoweredDesc")}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-green-500/10 p-2 rounded-lg">
              <Zap className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">{t("diseasePage.modelDetails.fastResults")}</h3>
              <p className="text-xs text-gray-400">{t("diseasePage.modelDetails.fastResultsDesc")}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-green-500/10 p-2 rounded-lg">
              <Database className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">{t("diseasePage.modelDetails.extensiveDb")}</h3>
              <p className="text-xs text-gray-400">{t("diseasePage.modelDetails.extensiveDbDesc")}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}