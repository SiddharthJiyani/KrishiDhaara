from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch
import torchvision.models as models
import torchvision.transforms as transforms
import io
import google.generativeai as genai
import json
import pyrebase
import firebase_admin
from firebase_admin import credentials, db

# Initialize FastAPI
app = FastAPI()

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cred = credentials.Certificate("firebase_config.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://smartirrigation-1f48f-default-rtdb.asia-southeast1.firebasedatabase.app/' 
})
stats_ref = db.reference("plant-disease-prediction_stats")

# Load the trained model
MODEL_PATH = "./plant_disease_classification_model_resnet50.pth"
model = models.resnet50(weights=None)
model.fc = torch.nn.Linear(model.fc.in_features, 38)
model.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device("cpu")))
model.eval()

# Define disease classes
CLASS_NAMES = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy', 'Grape___Black_rot',
    'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 'Peach___healthy',
    'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 'Potato___Early_blight',
    'Potato___Late_blight', 'Potato___healthy', 'Raspberry___healthy', 'Soybean___healthy',
    'Squash___Powdery_mildew', 'Strawberry___Leaf_scorch', 'Strawberry___healthy',
    'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight',
    'Tomato___Leaf_Mold', 'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]

# Initialize Google Gemini AI
import os;
os.getenv["GOOGLE_API_KEY"]
genai.configure(api_key="GOOGLE_API_KEY")
gemini_model = genai.GenerativeModel("gemini-2.0-flash")

# Define image transformation
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])


async def get_disease_treatment(disease_name):
    """Generate AI response for disease treatment using Google Gemini AI."""
    
    prompt = f"Create a structured, easy-to-read guide on treating and preventing {disease_name} in plants. Format it with clear headings and subheadings so it prints well. Use bullet points for practical implementation, keeping explanations brief and jargon-free. Include relevant emojis for readability.Sections: Prevention Tips, Organic/Natural Remedies, Chemical Treatments, Cultural, Practices. At the end, include: Disclaimer: Always consult with local agricultural experts or extension services for the most appropriate and up-to-date recommendations for your region. Regulations and best practices can vary. Keep it concise, practical, and farmer-friendly—avoid unnecessary technical details"
    
    try:
        response = gemini_model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"AI response not available: {str(e)}"


@app.get("/")
async def root():
    return {"message": "Plant Disease Prediction API is running!"}


@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        # Read the image file
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))

        # Preprocess the image
        image = transform(image).unsqueeze(0)  # Add batch dimension

        # Make prediction
        with torch.no_grad():
            outputs = model(image)
            _, predicted = torch.max(outputs, 1)
            predicted_class = CLASS_NAMES[predicted.item()]


        stats = stats_ref.get() or {"total_count": 0, "healthy_count": 0, "unhealthy_count": 0}
        stats["total_count"] += 1
        if "healthy" in predicted_class.lower():
            stats["healthy_count"] += 1
        else:
            stats["unhealthy_count"] += 1
            
        stats_ref.set(stats)

        # Get AI-generated cure from Google Gemini AI
        treatment = await get_disease_treatment(predicted_class)
        # treatment = "AI response not available"

        return JSONResponse(content={"predicted_disease": predicted_class, "cure": treatment})

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
