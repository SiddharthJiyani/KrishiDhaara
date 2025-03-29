import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Button } from "../ui/button";
import { Leaf, Search } from "lucide-react";
import { useState } from "react";

// Importing plant images
import Raspberry___healthy from "../../assets/plants_image/Raspberry___healthy.JPG";
import Apple___Apple_scab from "../../assets/plants_image/Apple___Apple_scab.JPG";
import Apple___Black_rot from "../../assets/plants_image/Apple___Black_rot.JPG";
import Apple___Cedar_apple_rust from "../../assets/plants_image/Apple___Cedar_apple_rust.JPG";
import Apple___healthy from "../../assets/plants_image/Apple___healthy.JPG";
import Blueberry___healthy from "../../assets/plants_image/Blueberry___healthy.JPG";
import Cherry____healthy from "../../assets/plants_image/Cherry____healthy.JPG";
import Cherry____Powdery_mildew from "../../assets/plants_image/Cherry____Powdery_mildew.JPG";
import Corn____Common_rust_ from "../../assets/plants_image/Corn____Common_rust_.JPG";
import Corn__Northern_Leaf_Blight from "../../assets/plants_image/Corn____Northern_Leaf_Blight.JPG";
import Corn__fall_armyworm from "../../assets/plants_image/Corn___fall_armyworm.JPG";
import Grape__Black_rot from "../../assets/plants_image/Grape___Black_rot.JPG";
import Orange__Haunglongbing_Citrus_greening from "../../assets/plants_image/Orange___Haunglongbing.JPG";
import Peach__healthy from "../../assets/plants_image/Peach___healthy.JPG";

// Plant health data
const plantHealth = [
  "Raspberry__healthy",
  "Apple___Apple_scab",
  "Apple___Black_rot",
  "Apple___Cedar_apple_rust",
  "Apple___healthy",
  "Blueberry___healthy",
  "Cherry____healthy",
  "Cherry____Powdery_mildew",
  "Corn____Cercospora_leaf_spot Gray_leaf_spot",
  "Corn____Common_rust_",
  "Corn____Northern_Leaf_Blight",
  "Corn___fall_armyworm",
  "Grape___Black_rot",
  "Orange___Haunglongbing_(Citrus_greening)",
  "Peach___healthy"
];

export default function DiseaseLibrary() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mapping plant names to image imports
  const plantImages = {
    "Raspberry": Raspberry___healthy,
    "Apple Scab": Apple___Apple_scab,
    "Black Rot": Apple___Black_rot,
    "Cedar Apple Rust": Apple___Cedar_apple_rust,
    "Apple Healthy": Apple___healthy,
    "Blueberry": Blueberry___healthy,
    "Cherry Healthy": Cherry____healthy,
    "Powdery Mildew": Cherry____Powdery_mildew,
    "Common Rust": Corn____Common_rust_,
    "Northern Leaf Blight": Corn__Northern_Leaf_Blight,
    "Fall Armyworm": Corn__fall_armyworm,
    "Grape Black Rot": Grape__Black_rot,
    "Orange Huanglongbing": Orange__Haunglongbing_Citrus_greening,
    "Peach Healthy": Peach__healthy,
  };

  const plantData = [
    {
      name: "Apple",
      diseases: [
        {
          id: "apple-scab",
          name: "Apple Scab",
          description: "Olive-green to brown spots on leaves and fruit. Infected leaves may drop prematurely.",
          image: Apple___Apple_scab,
        },
        {
          id: "apple-black-rot",
          name: "Black Rot",
          description: "Circular lesions on leaves with purple margins and brown centers.",
          image: Apple___Black_rot,
        },
        {
          id: "cedar-apple-rust",
          name: "Cedar Apple Rust",
          description: "Orange spots on leaves and fruit with small black dots in the center.",
          image: Apple___Cedar_apple_rust,
        },
        {
          id: "apple-healthy",
          name: "Healthy",
          description: "Healthy apple leaves and fruit with no signs of disease.",
          image: Apple___healthy,
        },
      ],
    },
    {
      name: "Blueberry",
      diseases: [
        {
          id: "blueberry-healthy",
          name: "Healthy",
          description: "Healthy blueberry leaves and fruit with no signs of disease.",
          image: Blueberry___healthy,
        },
      ],
    },
    {
      name: "Cherry",
      diseases: [
        {
          id: "cherry-healthy",
          name: "Healthy",
          description: "Healthy cherry leaves and fruit with no signs of disease.",
          image: Cherry____healthy,
        },
        {
          id: "cherry-powdery-mildew",
          name: "Powdery Mildew",
          description: "White powdery growth on leaves and fruit. Can lead to distorted growth.",
          image: Cherry____Powdery_mildew,
        },
      ],
    },
    {
      name: "Corn",
      diseases: [
        {
          id: "corn-healthy",
          name: "Healthy",
          description: "Healthy corn plants with no signs of disease.",
          image: Peach__healthy,
        },
        {
          id: "corn-common-rust",
          name: "Common Rust",
          description: "Brown, circular lesions on the leaves, often with yellow halos.",
          image: Corn____Common_rust_,
        },
        {
          id: "corn-northern-leaf-blight",
          name: "Northern Leaf Blight",
          description: "Long, grayish-green lesions on the leaves with dark edges.",
          image: Corn__Northern_Leaf_Blight,
        },
        {
          id: "corn-fall-armyworm",
          name: "Fall Armyworm",
          description: "Damage to leaves and kernels from caterpillar feeding, leading to holes and premature browning.",
          image: Apple___healthy,
        },
      ],
    },
    {
      name: "Grape",
      diseases: [
        {
          id: "grape-black-rot",
          name: "Black Rot",
          description: "Dark brown or black lesions on leaves and fruit, leading to fruit shriveling.",
          image: Grape__Black_rot,
        },
      ],
    },
    {
      name: "Orange",
      diseases: [
        {
          id: "orange-healthy",
          name: "Healthy",
          description: "Healthy orange trees with no signs of disease.",
          image: Apple___Apple_scab, // Assuming Peach_healthy image is used for Orange healthy
        },
        {
          id: "orange-haunglongbing",
          name: "Haunglongbing (Citrus Greening)",
          description: "Yellowing of leaves and fruit, poor fruit quality.",
          image: Orange__Haunglongbing_Citrus_greening,
        },
      ],
    },
    {
      name: "Peach",
      diseases: [
        {
          id: "peach-healthy",
          name: "Healthy",
          description: "Healthy peach leaves and fruit with no signs of disease.",
          image: Peach__healthy,
        },
      ],
    },
    {
      name: "Raspberry",
      diseases: [
        {
          id: "raspberry-healthy",
          name: "Healthy",
          description: "Healthy raspberry leaves and fruit with no signs of disease.",
          image: Raspberry___healthy,
        },
      ],
    },
  ];
  

  const filteredDiseases = plantData.flatMap((plant) =>
    plant.diseases
      .filter((disease) =>
        disease.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((disease) => ({ ...disease, plant: plant.name }))
  );

  return (
    <Card className="bg-gray-900/50 border-gray-800 max-w-md mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-white flex items-center">
          <Leaf className="mr-2 h-5 w-5 text-green-400" />
          Plant Disease Library
        </CardTitle>
        <CardDescription>Find diseases by plant name or disease name</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search for a plant or disease..."
            className="w-full px-3 py-2 bg-zinc-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
        </div>
        <div className="max-h-screen overflow-y-auto space-y-4">
          {filteredDiseases.length > 0 ? (
            filteredDiseases.map((disease) => (
              <div key={disease.id} className="border border-[#414142] bg-[#121215] rounded-lg p-4 m-3 ">
                <div className="flex items-start space-x-3">
                  <div className="bg-zinc-700 rounded-md w-12 h-12 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={disease.image}
                      alt={disease.name}
                      className=" rounded-sm"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{disease.name}</h3>
                    <p className="text-xs text-gray-400 mb-1">{disease.plant}</p>
                    <p className="text-xs text-gray-500">{disease.description}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm text-center">No diseases found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
