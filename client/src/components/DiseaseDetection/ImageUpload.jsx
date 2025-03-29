"use client";

import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Upload, Camera, Loader2 } from "lucide-react";
import axios from "axios";

export default function ImageUpload({ onPrediction , onCure}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // from env
  const PREDICTION_API = import.meta.env.VITE_PREDICTION_API; 

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select or capture an image.");
      return;
    }
  
    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
  
    try {
      const response = await axios.post(`${PREDICTION_API}/predict/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      const { predicted_disease, cure } = response.data;
  
      // Pass both disease prediction and cure information to parent component
      onPrediction(predicted_disease );
      onCure(cure);
  
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during prediction.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Card className="mb-6 bg-gray-900/50 border-gray-800">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div>
            <div className="flex space-x-2 mb-4">
              <Button
                variant="outline"
                className="flex-1 bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-700 hover:text-green-400"
                onClick={() => document.getElementById("file-upload")?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-700 hover:text-green-400"
                onClick={() =>
                  document.getElementById("camera-capture")?.click()
                }>
                <Camera className="mr-2 h-4 w-4" />
                Use Camera
              </Button>
            </div>

            <form onSubmit={handleSubmit}>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                id="camera-capture"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                className={`border-2 border-dashed rounded-lg p-6 mb-4 flex flex-col items-center justify-center min-h-[240px] transition-colors ${
                  dragActive
                    ? "border-green-400 bg-green-400/5"
                    : "border-gray-700 hover:border-gray-600"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}>
                {preview ? (
                  <img
                    src={preview || "/placeholder.svg"}
                    alt="Preview"
                    className="max-h-[200px] rounded-md object-contain"
                  />
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-gray-500 mb-2" />
                    <p className="text-sm text-gray-400 text-center">
                      Drag and drop an image file, or click to browse
                    </p>
                  </>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-black font-medium cursor-pointer"
                disabled={!selectedFile || loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Plant"
                )}
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
