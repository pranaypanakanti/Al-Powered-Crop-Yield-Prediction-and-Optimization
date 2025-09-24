import argparse
import pandas as pd
import joblib
import numpy as np
import math


DEFAULT_AREA = 1.0  # default plot size in acres


def enrich_with_soil(df):
    soil_df = pd.read_excel("State_major_soils.xlsx")
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
        except:
            return 7.0

    df["Soil_pH"] = df["Soil_pH"].apply(parse_ph).fillna(7.0)
    return df


def load_model(model_path):
    artifact = joblib.load(model_path)
    return artifact["model"]


def prepare_input(state, area, crop):
    df = pd.DataFrame({
        "State": [state],
        "Area": [area],
        "Crop": [crop],
        "Crop_Year": [2021],
        "Season": ["Kharif"],
        "Production": [0],
        "Annual_Rainfall": [0],
        "Fertilizer": [0],
        "Pesticide": [0]
    })
    df = enrich_with_soil(df)
    return df


# MSP values dictionary, rounded up
MSP_VALUES = {
    "Wheat": 2425,
    "Rice": 2369,
    "Potato": 900,
    "Tea": 3300,
    "Sugarcane": 340,
    "Pulses": 8300,
    "Millets": 4330,
    "Jute": 5650,
    "Raagi": 4886,
    "Red Chillis": 8000,
    "Turmeric": 6000,
    "Ginger": 5000,
    "Maize": 2400,
    "Bajara": 2775
}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True, help="Path to trained model joblib file")
    parser.add_argument("--state", required=True, help="State name")
    parser.add_argument("--area", type=float, help="Size of plot in acres")
    parser.add_argument("--crop", help="Specific crop name (optional)")
    parser.add_argument("--top", type=int, default=5, help="Number of top crops to recommend")
    args = parser.parse_args()

    area = args.area if args.area else DEFAULT_AREA
    state = args.state
    crop = args.crop

    model = load_model(args.model)

    if crop:
        df_input = prepare_input(state, area, crop)
        predicted_yield = model.predict(df_input)[0]
        msp = MSP_VALUES.get(crop.title(), 0)
        print(f"✅ Predicted yield for {crop.title()} in {state.title()} ({area} acres): {predicted_yield:.2f}")
        print(f"💰 Estimated MSP for {crop.title()}: ₹{msp} per quintal")
    else:
        selected_crops = [
            "wheat", "rice", "potato", "tea", "sugarcane", "pulses", "millets",
            "jute", "raagi", "red chillis", "turmeric", "ginger", "maize", "bajara"
        ]
        predictions = {}
        for crop_name in selected_crops:
            df_input = prepare_input(state, area, crop_name)
            pred = model.predict(df_input)[0]
            predictions[crop_name.title()] = round(pred, 2)
        # Sort by predicted yield descending and take top N
        sorted_preds = dict(sorted(predictions.items(), key=lambda x: x[1], reverse=True)[:args.top])

        # Add MSP values to each crop
        combined = {}
        for crop_name, yield_val in sorted_preds.items():
            msp_val = MSP_VALUES.get(crop_name, 0)
            combined[crop_name] = {"predicted_yield": yield_val, "msp": msp_val}

        print(f"✅ Top {args.top} crop recommendations for {state.title()} ({area} acres) with MSP:")
        print(combined)


if __name__ == "__main__":
    main()
