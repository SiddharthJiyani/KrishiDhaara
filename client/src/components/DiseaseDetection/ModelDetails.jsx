import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Brain, Zap, Database } from "lucide-react"

export default function ModelDetails() {
  return (
    <Card className="mb-6 bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-white flex items-center">
          <span className="mr-2">Analyze Plant Health</span>
        </CardTitle>
        <CardDescription>Upload or take a photo of your plant to detect diseases</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div className="flex items-start space-x-3">
            <div className="bg-green-500/10 p-2 rounded-lg">
              <Brain className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">AI-Powered</h3>
              <p className="text-xs text-gray-400">Advanced neural networks for accurate detection</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-green-500/10 p-2 rounded-lg">
              <Zap className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">Fast Results</h3>
              <p className="text-xs text-gray-400">Get disease identification in seconds</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-green-500/10 p-2 rounded-lg">
              <Database className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">Extensive Database</h3>
              <p className="text-xs text-gray-400">Trained on 85,000+ plant disease images</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

