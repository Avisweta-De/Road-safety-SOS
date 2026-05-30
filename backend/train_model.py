"""
train_model.py — Train a Random Forest classifier on the India Road Accident dataset.

Reads: data/accident_prediction_india.csv
Saves: data/model.pkl (trained model + encoders)
"""

import os
import sys
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
import joblib

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
CSV_PATH = os.path.join(DATA_DIR, "accident_prediction_india.csv")
MODEL_PATH = os.path.join(DATA_DIR, "model.pkl")


def extract_hour(time_str):
    """Extract hour from time string like '1:46' or '21:30'."""
    try:
        parts = str(time_str).split(":")
        return int(parts[0])
    except (ValueError, IndexError):
        return 12  # default to noon


def train():
    print("=" * 60)
    print("  RoadSoS — Accident Severity Model Training")
    print("=" * 60)

    # Load dataset
    print(f"\n📂 Loading dataset: {CSV_PATH}")
    df = pd.read_csv(CSV_PATH)
    print(f"   Rows: {len(df)}, Columns: {len(df.columns)}")
    print(f"   Columns: {list(df.columns)}")

    # --- Feature Engineering ---
    print("\n⚙️  Feature engineering...")

    # Extract hour from Time of Day
    df["Hour"] = df["Time of Day"].apply(extract_hour)

    # Select features for the model
    feature_columns = [
        "Number of Vehicles Involved",
        "Vehicle Type Involved",
        "Number of Casualties",
        "Number of Fatalities",
        "Weather Conditions",
        "Road Type",
        "Road Condition",
        "Lighting Conditions",
        "Traffic Control Presence",
        "Speed Limit (km/h)",
        "Driver Age",
        "Driver Gender",
        "Driver License Status",
        "Alcohol Involvement",
        "Accident Location Details",
        "Hour",
    ]

    target_column = "Accident Severity"

    # Check for missing values
    print(f"\n   Missing values per feature:")
    for col in feature_columns + [target_column]:
        missing = df[col].isna().sum()
        if missing > 0:
            print(f"     {col}: {missing}")

    # Drop rows with missing target
    df = df.dropna(subset=[target_column])

    # Fill missing feature values
    for col in feature_columns:
        if df[col].dtype == "object":
            df[col] = df[col].fillna("Unknown")
        else:
            df[col] = df[col].fillna(df[col].median())

    # --- Encode categorical features ---
    print("\n🔢 Encoding categorical features...")
    encoders = {}
    categorical_cols = [
        "Vehicle Type Involved",
        "Weather Conditions",
        "Road Type",
        "Road Condition",
        "Lighting Conditions",
        "Traffic Control Presence",
        "Driver Gender",
        "Driver License Status",
        "Alcohol Involvement",
        "Accident Location Details",
    ]

    for col in categorical_cols:
        le = LabelEncoder()
        df[col + "_enc"] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
        print(f"   {col}: {list(le.classes_)}")

    # Encode target
    severity_encoder = LabelEncoder()
    df["Severity_enc"] = severity_encoder.fit_transform(df[target_column])
    encoders["target"] = severity_encoder
    print(f"\n   Target classes: {list(severity_encoder.classes_)}")
    print(f"   Distribution:")
    for cls in severity_encoder.classes_:
        count = (df[target_column] == cls).sum()
        print(f"     {cls}: {count} ({count/len(df)*100:.1f}%)")

    # --- Prepare X and y ---
    encoded_feature_cols = [
        "Number of Vehicles Involved",
        "Vehicle Type Involved_enc",
        "Number of Casualties",
        "Number of Fatalities",
        "Weather Conditions_enc",
        "Road Type_enc",
        "Road Condition_enc",
        "Lighting Conditions_enc",
        "Traffic Control Presence_enc",
        "Speed Limit (km/h)",
        "Driver Age",
        "Driver Gender_enc",
        "Driver License Status_enc",
        "Alcohol Involvement_enc",
        "Accident Location Details_enc",
        "Hour",
    ]

    X = df[encoded_feature_cols].values
    y = df["Severity_enc"].values

    # Feature names for later reference
    feature_names = [
        "num_vehicles",
        "vehicle_type",
        "num_casualties",
        "num_fatalities",
        "weather",
        "road_type",
        "road_condition",
        "lighting",
        "traffic_control",
        "speed_limit",
        "driver_age",
        "driver_gender",
        "license_status",
        "alcohol",
        "location_type",
        "hour",
    ]

    # --- Train / Test Split ---
    print("\n📊 Splitting data (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"   Train: {len(X_train)}, Test: {len(X_test)}")

    # --- Train Random Forest ---
    print("\n🌲 Training Random Forest Classifier...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    # --- Evaluate ---
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    print(f"\n✅ Model Accuracy: {accuracy:.4f} ({accuracy*100:.1f}%)")
    print(f"\n📋 Classification Report:")
    print(
        classification_report(
            y_test, y_pred, target_names=severity_encoder.classes_
        )
    )

    # Feature importance
    importances = model.feature_importances_
    importance_pairs = sorted(
        zip(feature_names, importances), key=lambda x: x[1], reverse=True
    )
    print("📊 Feature Importance (top 8):")
    for name, imp in importance_pairs[:8]:
        bar = "█" * int(imp * 50)
        print(f"   {name:20s} {imp:.4f} {bar}")

    # --- Save Model ---
    print(f"\n💾 Saving model to: {MODEL_PATH}")
    model_data = {
        "model": model,
        "encoders": encoders,
        "feature_names": feature_names,
        "encoded_feature_cols": encoded_feature_cols,
        "accuracy": accuracy,
    }
    joblib.dump(model_data, MODEL_PATH)
    print(f"   Model size: {os.path.getsize(MODEL_PATH) / 1024:.1f} KB")

    print("\n" + "=" * 60)
    print("  ✅ Training complete!")
    print("=" * 60)

    return model_data


if __name__ == "__main__":
    train()
