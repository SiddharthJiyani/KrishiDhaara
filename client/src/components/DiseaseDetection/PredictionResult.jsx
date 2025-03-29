import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Info } from "lucide-react";

const PredictionResult = ({ predictedDisease, cure }) => {
  if (!predictedDisease) return null;

  const customComponents = {
    h1: ({ node, ...props }) => (
      <h1 className="text-3xl font-bold my-4" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-2xl font-semibold my-3" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-xl font-medium my-2" {...props} />
    ),
    h4: ({ node, ...props }) => (
      <h4 className="text-lg font-medium my-2" {...props} />
    ),
    p: ({ node, ...props }) => <p className="my-2" {...props} />,
    li: ({ node, ...props }) => <li className="ml-6 list-disc" {...props} />,
    code: ({ node, inline, className, children, ...props }) => {
      if (inline) {
        return (
          <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
            {children}
          </code>
        );
      }
      return (
        <pre className="bg-gray-900 text-white p-4 rounded overflow-auto my-2">
          <code {...props}>{children}</code>
        </pre>
      );
    },
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="border-l-4 border-gray-300 pl-4 italic my-2"
        {...props}
      />
    ),
  };

  return (
    <Card className="mb-6 border-0 shadow-lg animate-fadeIn">
      <CardHeader className="pb-2 bg-green-500/20 text-green-400 rounded-sm my-2 ">
        <CardTitle className="flex items-center text-xl">
          <Info className="mr-2 h-5 w-5" />
          Prediction Result
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-gray-900/50 p-6">
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-400">
              Detected Disease
            </h3>
            <p className="text-2xl font-bold text-white">{predictedDisease}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400">
              AI-Generated Cure
            </h3>
            {/* Wrap the markdown with a container that provides indentation */}
            <div className="prose prose-sm dark:prose-invert max-w-none pl-4 bg-gray-700 p-4 rounded-lg">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={customComponents}>
                {cure}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictionResult;
