"""
severity_model.py — Load trained model and predict accident severity.
"""

import os
import numpy as np
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "data", "model.pkl")

# Load model on import
_model_data = None


def _load_model():
    global _model_data
    if _model_data is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found at {MODEL_PATH}. Run train_model.py first."
            )
        _model_data = joblib.load(MODEL_PATH)
    return _model_data


def encode_feature(encoders, col_name, value):
    """Safely encode a categorical feature value."""
    le = encoders.get(col_name)
    if le is None:
        return 0
    try:
        return le.transform([str(value)])[0]
    except ValueError:
        # Unknown category — use the most common class (index 0)
        return 0


def predict_severity(features: dict) -> dict:
    """
    Predict accident severity from input features.

    Args:
        features: dict with keys:
            - num_vehicles (int)
            - vehicle_type (str): Car/Truck/Bus/Two-Wheeler/Cycle/Pedestrian/Auto-Rickshaw
            - num_casualties (int)
            - num_fatalities (int)
            - weather (str): Clear/Rain/Fog/Hazy/Stormy
            - road_type (str): National Highway/State Highway/Urban Road/Village Road
            - road_condition (str): Dry/Wet/Damaged/Under Construction
            - lighting (str): Daylight/Dark/Dawn/Dusk
            - traffic_control (str): Signals/Signs/Police Checkpost/None
            - speed_limit (int)
            - driver_age (int)
            - driver_gender (str): Male/Female
            - license_status (str): Valid/Expired/None
            - alcohol (str): Yes/No
            - location_type (str): Straight Road/Curve/Intersection/Bridge
            - hour (int): 0-23

    Returns:
        dict with: severity, confidence, recommended_action, severity_level (0-2)
    """
    data = _load_model()
    model = data["model"]
    encoders = data["encoders"]

    # Build feature vector
    feature_vector = np.array(
        [
            int(features.get("num_vehicles", 1)),
            encode_feature(encoders, "Vehicle Type Involved", features.get("vehicle_type", "Car")),
            int(features.get("num_casualties", 0)),
            int(features.get("num_fatalities", 0)),
            encode_feature(encoders, "Weather Conditions", features.get("weather", "Clear")),
            encode_feature(encoders, "Road Type", features.get("road_type", "Urban Road")),
            encode_feature(encoders, "Road Condition", features.get("road_condition", "Dry")),
            encode_feature(encoders, "Lighting Conditions", features.get("lighting", "Daylight")),
            encode_feature(encoders, "Traffic Control Presence", features.get("traffic_control", "Signs")),
            int(features.get("speed_limit", 60)),
            int(features.get("driver_age", 30)),
            encode_feature(encoders, "Driver Gender", features.get("driver_gender", "Male")),
            encode_feature(encoders, "Driver License Status", features.get("license_status", "Valid")),
            encode_feature(encoders, "Alcohol Involvement", features.get("alcohol", "No")),
            encode_feature(encoders, "Accident Location Details", features.get("location_type", "Straight Road")),
            int(features.get("hour", 12)),
        ]
    ).reshape(1, -1)

    # Predict
    prediction = model.predict(feature_vector)[0]
    probabilities = model.predict_proba(feature_vector)[0]
    confidence = float(np.max(probabilities))

    # Map to severity labels
    severity_map = {0: "CRITICAL", 1: "LOW", 2: "MODERATE"}
    target_encoder = encoders.get("target")
    if target_encoder:
        classes = list(target_encoder.classes_)
        # Map: Fatal→CRITICAL, Minor→LOW, Serious→MODERATE
        label_map = {"Fatal": "CRITICAL", "Minor": "LOW", "Serious": "MODERATE"}
        predicted_class = classes[prediction] if prediction < len(classes) else "Unknown"
        severity = label_map.get(predicted_class, "MODERATE")
    else:
        severity = severity_map.get(prediction, "MODERATE")

    # Recommended action
    action_map = {
        "CRITICAL": "🚨 Call 108 IMMEDIATELY. Multiple fatalities/casualties detected. Rush to nearest trauma centre.",
        "MODERATE": "⚠️ Seek immediate medical attention. Visit nearest hospital. Call 108 if condition worsens.",
        "LOW": "✅ File a police report (call 100). Visit a doctor for check-up. Document the scene.",
    }

    return {
        "severity": severity,
        "confidence": round(confidence, 3),
        "recommended_action": action_map.get(severity, action_map["MODERATE"]),
        "severity_level": {"LOW": 0, "MODERATE": 1, "CRITICAL": 2}.get(severity, 1),
        "probabilities": {
            cls: round(float(p), 3)
            for cls, p in zip(
                target_encoder.classes_ if target_encoder else ["Fatal", "Minor", "Serious"],
                probabilities,
            )
        },
    }
