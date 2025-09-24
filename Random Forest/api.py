# api.py
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List

# --- Configuration & Model Loading ---

MODEL_PATH = "crop_yield_model.joblib"
SOIL_DATA_PATH = "State_major_soils.xlsx"

MSP_VALUES = {
    "Paddy": 2040, "Jowar": 2970, "Bajra": 2350, "Maize": 1962, "Ragi": 3578,
    "Tur": 6600, "Moong": 7755, "Urad": 6600, "Groundnut": 5850, "Soyabean": 4300,
    "Sunflower": 6400, "Nigerseed": 7287, "Sesamum": 7830, "Cotton": 6080,
    "Wheat": 2125, "Barley": 1735, "Gram": 5335, "Lentil": 6000,
    "Rapeseed & Mustard": 5450, "Safflower": 5650, "Jute": 5050, "Copra": 10860,
    "Sugarcane": 315,
    # Adding aliases for common names used in the model
    "Rice": 2040, "Pulses": 6600, "Millets": 2970, "Potato": 1600,
    "Tea": 170, "Red Chillis": 15000, "Turmeric": 8500, "Ginger": 7000,
}

try:
    artifact = joblib.load(MODEL_PATH)
    model = artifact["model"]
except FileNotFoundError:
    print(f"Error: Model file not found at '{MODEL_PATH}'. Ensure it's in the same directory.")
    model = None

app = FastAPI(
    title="Crop Yield Prediction API",
    description="API for predicting crop yield and recommending top crops.",
    version="1.0.0"
)

# --- Pydantic Models for Request and Response ---

class PredictionRequest(BaseModel):
    state: str = Field(..., example="Andhra Pradesh")
    area: float = Field(..., example=1.5, description="Area in acres")
    crop: str = Field(..., example="Rice")

# MODIFICATION: Added a specific response model for the /predict endpoint
class PredictionResponse(BaseModel):
    predicted_yield: float
    msp: int

class RecommendationRequest(BaseModel):
    state: str = Field(..., example="Maharashtra")
    area: float = Field(..., example=5.0, description="Area in acres")
    top_n: int = Field(5, example=5)

# --- Helper Functions ---

def enrich_with_soil(df: pd.DataFrame) -> pd.DataFrame:
    try:
        soil_df = pd.read_excel(SOIL_DATA_PATH)
        soil_df.rename(columns={
            "State/UT": "State",
            "Major Soil Type": "Major_Soil",
            "Soil pH Range": "Soil_pH"
        }, inplace=True)
        soil_df["State"] = soil_df["State"].astype(str).str.strip().str.title()
        df["State"] = df["State"].astype(str).str.strip().str.title()
        df = df.merge(soil_df, on="State", how="left")
        df["Major_Soil"] = df["Major_Soil"].fillna("Unknown")

        def parse_ph(ph_range):
            try:
                parts = str(ph_range).replace("–", "-").split("-")
                nums = [float(p.strip()) for p in parts]
                return np.mean(nums)
            except (ValueError, TypeError):
                return 7.0

        df["Soil_pH"] = df["Soil_pH"].apply(parse_ph).fillna(7.0)
        return df
    except FileNotFoundError:
        print(f"Warning: Soil data file not found at '{SOIL_DATA_PATH}'. Using default values.")
        df["Major_Soil"] = "Unknown"
        df["Soil_pH"] = 7.0
        return df

def prepare_input(state: str, area: float, crop: str) -> pd.DataFrame:
    df = pd.DataFrame({
        "State": [state], "Area": [area], "Crop": [crop], "Crop_Year": [2021],
        "Season": ["Kharif"], "Production": [0], "Annual_Rainfall": [0],
        "Fertilizer": [0], "Pesticide": [0]
    })
    return enrich_with_soil(df)

# --- API Endpoints ---

@app.on_event("startup")
async def startup_event():
    if model is None:
        raise RuntimeError(f"Could not load model from {MODEL_PATH}")

@app.get("/", summary="Check API Status")
def read_root():
    return {"status": "ok", "message": "Crop Yield Prediction API is running!"}

# MODIFICATION: Changed the output format for the /predict endpoint
@app.post("/predict", response_model=PredictionResponse, summary="Predict yield and MSP for a single crop")
def predict_yield(request: PredictionRequest) -> PredictionResponse:
    df_input = prepare_input(request.state, request.area, request.crop)
    predicted_yield = model.predict(df_input)[0]
    
    msp = MSP_VALUES.get(request.crop.title(), 0)
    
    return PredictionResponse(
        predicted_yield=round(predicted_yield, 2),
        msp=msp
    )

@app.post("/recommend", summary="Recommend top N crops with MSP")
def recommend_crops(request: RecommendationRequest) -> List[dict]:
    selected_crops = [
        "wheat", "rice", "potato", "tea", "sugarcane", "pulses", "millets",
        "jute", "raagi", "red chillis", "turmeric", "ginger", "maize", "bajara"
    ]
    predictions = []
    for crop in selected_crops:
        df_input = prepare_input(request.state, request.area, crop)
        pred = model.predict(df_input)[0]
        crop_title = crop.title()
        msp = MSP_VALUES.get(crop_title, 0)
        predictions.append({
            "crop": crop_title,
            "predicted_yield": round(pred, 2),
            "msp": msp
        })
    
    predictions.sort(key=lambda x: x["predicted_yield"], reverse=True)
    
    top_recommendations = predictions[:request.top_n]
    
    return top_recommendations

# To run this file: uvicorn api:app --reload

