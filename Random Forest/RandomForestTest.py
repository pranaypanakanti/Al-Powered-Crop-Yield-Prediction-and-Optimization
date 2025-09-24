import os
import argparse
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score


SELECTED_CROPS = [
    "wheat", "rice", "potato", "tea", "sugarcane", "pulses", "millets",
    "jute", "raagi", "red chillis", "turmeric", "ginger", "maize", "bajara"
]


DEFAULT_VALUES = {
    "Crop_Year": 2021, "Season": "Kharif", "State": "Unknown", "Area": 0,
    "Production": 0, "Annual_Rainfall": 0, "Fertilizer": 0, "Pesticide": 0,
    "Major_Soil": "Unknown", "Soil_pH": 7.0
}


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
        except Exception:
            return 7.0

    df["Soil_pH"] = df["Soil_pH"].apply(parse_ph).fillna(7.0)

    return df


def load_data(path):
    df = pd.read_csv(path)
    df["Crop"] = df["Crop"].astype(str).str.strip().str.lower()
    selected_crops_lower = [c.lower() for c in SELECTED_CROPS]
    df = df[df["Crop"].isin(selected_crops_lower)]

    df["State"] = df["State"].astype(str).str.strip().str.title()
    df["Season"] = df["Season"].astype(str).str.strip().str.title()

    df = enrich_with_soil(df)

    for col, val in DEFAULT_VALUES.items():
        if col not in df.columns:
            df[col] = val
        else:
            df[col] = df[col].fillna(val)

    return df


def infer_feature_lists(df):
    categorical = ["Crop", "Season", "State", "Major_Soil"]
    numerical = ["Crop_Year", "Area", "Production", "Annual_Rainfall", "Fertilizer",
                 "Pesticide", "Soil_pH"]
    return numerical, categorical


def build_pipeline(numerical_features, categorical_features):
    preprocessor = ColumnTransformer(transformers=[
        ("num", StandardScaler(), numerical_features),
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
    ])
    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    return pipeline


def train_and_save(df, model_path):
    numerical_features, categorical_features = infer_feature_lists(df)
    X = df.drop(columns=["Yield"])
    y = df["Yield"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    pipeline = build_pipeline(numerical_features, categorical_features)
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)

    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"✅ Evaluation Results:")
    print(f"RMSE: {rmse:.2f}")
    print(f"MAE: {mae:.2f}")
    print(f"R² Score: {r2:.3f}")

    artifact = {
        "model": pipeline,
        "features": list(X_train.columns),
        "selected_crops": SELECTED_CROPS
    }
    os.makedirs(os.path.dirname(model_path) or ".", exist_ok=True)
    joblib.dump(artifact, model_path)
    print(f"✅ Model saved at {model_path}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", required=True)
    parser.add_argument("--model", required=True)
    args = parser.parse_args()

    df = load_data(args.data)
    train_and_save(df, args.model)


if __name__ == "__main__":
    main()
