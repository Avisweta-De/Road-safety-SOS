"""
main.py — FastAPI backend for RoadSoS v2.

Endpoints:
  POST /predict-severity  — ML severity prediction
  POST /report            — Save accident report
  POST /triage            — AI triage chat (Gemini + NLP intent)
  GET  /services          — Nearby emergency services (mock + Haversine)
  GET  /health            — Health check
"""

import os
import json
import math
import uuid
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from severity_model import predict_severity
from intent_classifier import classify_intent, get_accident_type_from_intent

app = FastAPI(title="RoadSoS API", version="2.0")

# ─── Static file serving (production) ───
FRONTEND_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Data directory ───
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
REPORTS_FILE = os.path.join(DATA_DIR, "reports.json")

# ─── Default Location: Lucknow ───
DEFAULT_LAT = 26.8467
DEFAULT_LNG = 80.9462


# ═══════════════════════════════════
# MODELS
# ═══════════════════════════════════

class SeverityInput(BaseModel):
    num_vehicles: int = 1
    vehicle_type: str = "Car"
    num_casualties: int = 0
    num_fatalities: int = 0
    weather: str = "Clear"
    road_type: str = "Urban Road"
    road_condition: str = "Dry"
    lighting: str = "Daylight"
    traffic_control: str = "Signs"
    speed_limit: int = 60
    driver_age: int = 30
    driver_gender: str = "Male"
    license_status: str = "Valid"
    alcohol: str = "No"
    location_type: str = "Straight Road"
    hour: int = 12


class ReportInput(BaseModel):
    location: str = ""
    lat: float = DEFAULT_LAT
    lng: float = DEFAULT_LNG
    date_time: str = ""
    num_injured: int = 0
    num_vehicles: int = 1
    accident_type: str = "collision"
    road_type: str = "Urban Road"
    weather: str = "Clear"
    unconscious_present: bool = False
    description: str = ""
    severity_result: Optional[dict] = None


class TriageInput(BaseModel):
    message: str
    history: list = []


# ═══════════════════════════════════
# HAVERSINE
# ═══════════════════════════════════

def haversine(lat1, lng1, lat2, lng2):
    """Calculate distance in km between two GPS coordinates."""
    R = 6371  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


# ═══════════════════════════════════
# MOCK SERVICES DATA — LUCKNOW
# ═══════════════════════════════════

MOCK_SERVICES = {
    "hospitals": [
        {"name": "Ram Manohar Lohia Hospital", "lat": 26.8588, "lng": 80.9406, "phone": "0522-2237629", "address": "Vibhuti Khand, Gomti Nagar", "open24": True, "rating": 4.3},
        {"name": "Balrampur Hospital", "lat": 26.8566, "lng": 80.9350, "phone": "0522-2611243", "address": "Kaiserbagh, Lucknow", "open24": True, "rating": 4.1},
        {"name": "KGMU Trauma Centre", "lat": 26.8403, "lng": 80.9348, "phone": "0522-2258880", "address": "Shah Mina Road, Chowk", "open24": True, "rating": 4.5},
        {"name": "Medanta Hospital", "lat": 26.8490, "lng": 80.9900, "phone": "0522-4505050", "address": "Shaheed Path, Gomti Nagar", "open24": True, "rating": 4.6},
        {"name": "SGPGI Emergency", "lat": 26.7271, "lng": 80.9462, "phone": "0522-2668004", "address": "Raebareli Road", "open24": True, "rating": 4.7},
    ],
    "police": [
        {"name": "Hazratganj Police Station", "lat": 26.8508, "lng": 80.9456, "phone": "0522-2204178", "address": "Hazratganj, Lucknow", "open24": True},
        {"name": "Sadar Bazar Police Station", "lat": 26.8585, "lng": 80.9505, "phone": "0522-2203361", "address": "Sadar, Lucknow Cantt", "open24": True},
        {"name": "Kaiserbagh Police Chowki", "lat": 26.8520, "lng": 80.9340, "phone": "0522-2620093", "address": "Kaiserbagh, Lucknow", "open24": True},
    ],
    "towing": [
        {"name": "UP Highway Rescue", "lat": 26.8550, "lng": 80.9520, "phone": "9415001234", "address": "Ashok Marg, Lucknow"},
        {"name": "Quick Rescue Towing", "lat": 26.8400, "lng": 80.9550, "phone": "9839001234", "address": "Aminabad, Lucknow"},
        {"name": "National Highway Helpline", "lat": 26.8600, "lng": 80.9600, "phone": "1033", "address": "NH-24, Lucknow"},
    ],
    "fire_stations": [
        {"name": "Lucknow Fire Station HQ", "lat": 26.8460, "lng": 80.9300, "phone": "0522-2208801", "address": "Nishatganj, Lucknow", "open24": True},
        {"name": "Aliganj Fire Station", "lat": 26.8820, "lng": 80.9350, "phone": "0522-2325101", "address": "Aliganj, Lucknow", "open24": True},
    ],
}


# ═══════════════════════════════════
# MOCK TRIAGE RESPONSES
# ═══════════════════════════════════

MOCK_TRIAGE = {
    "HEAD": "🧠 **Head Injury First Aid:**\n\n1. **Keep the person still** — do NOT move the neck\n2. **Apply gentle pressure** with clean cloth if bleeding\n3. **Monitor consciousness** — ask name, date, what happened\n4. **Watch for danger signs**: vomiting, unequal pupils, seizures\n5. **Call 108 immediately** if any danger signs\n\n⚠️ Assume spinal injury with serious head trauma. Do NOT move the person.\n\n📞 **Ambulance: 108** | **Police: 100**",
    "BLEEDING": "🩸 **Bleeding Control:**\n\n1. **Apply firm, direct pressure** with a clean cloth\n2. **Elevate** the injured area above heart level\n3. **Do NOT remove** embedded objects\n4. **If blood soaks through**, add more layers — don't remove first\n5. **For severe bleeding**, apply tourniquet 2-3 inches above wound\n\n⚠️ If bleeding doesn't stop in 10 minutes, rush to hospital.\n\n📞 **Ambulance: 108** | **Police: 100**",
    "FRACTURE": "🦴 **Fracture First Aid:**\n\n1. **Do NOT move** the injured limb — immobilize it\n2. **Support** with padding (rolled clothing, cardboard)\n3. **Apply ice** wrapped in cloth to reduce swelling\n4. **Check circulation** below the fracture (pulse, colour)\n5. **Call 108** — do not transport yourself\n\n⚠️ Never try to straighten or reset a broken bone.\n\n📞 **Ambulance: 108** | **Police: 100**",
    "BURNS": "🔥 **Burns Treatment:**\n\n1. **Cool the burn** under running water for **20+ minutes**\n2. **Remove jewellery/clothing** near burn (unless stuck)\n3. **Cover loosely** with clean, non-stick dressing\n4. **Do NOT apply** ice, butter, toothpaste, or oils\n5. **Do NOT burst** blisters\n\n⚠️ If burn is larger than the palm, seek emergency help.\n\n📞 **Ambulance: 108** | **Fire: 101**",
    "UNCONSCIOUS": "🚨 **Unconscious Person:**\n\n1. **Check breathing** — look, listen, feel for 10 seconds\n2. **If breathing**: Place in **recovery position** (on side)\n3. **If NOT breathing**: Start **CPR immediately**\n   - 30 chest compressions (hard & fast, centre of chest)\n   - 2 rescue breaths\n4. **Call 108 NOW** — every second counts\n5. **Clear airway** — tilt head back, lift chin\n\n⚠️ Do NOT give food/water. Do NOT leave them alone.\n\n📞 **Ambulance: 108**",
    "SHOCK": "💫 **Shock Management:**\n\n1. **Lay the person down** — elevate legs 30cm\n2. **Keep them warm** with blankets/jackets\n3. **Loosen tight clothing** (belt, collar)\n4. **Do NOT give food/drink** if surgery might be needed\n5. **Monitor breathing** and keep talking to them\n\n⚠️ Shock can be life-threatening. Call 108 immediately.\n\n📞 **Ambulance: 108** | **Police: 100**",
    "SPINAL": "🔴 **Suspected Spinal Injury:**\n\n1. **Do NOT move the person** under any circumstances\n2. **Keep head, neck, and back aligned** — hold head still\n3. **Place rolled towels** on either side of head/neck\n4. **Call 108** and wait for professional help\n5. **Monitor breathing** — if CPR needed, do jaw thrust only\n\n⚠️ Moving a spinal injury patient can cause permanent paralysis.\n\n📞 **Ambulance: 108** | **Police: 100**",
    "UNKNOWN": "🚗 **General Accident First Aid:**\n\n1. **Ensure scene safety** — turn off engines, hazard lights on\n2. **Call 108** (ambulance) and **100** (police)\n3. **Do NOT move** injured persons unless in immediate danger\n4. **Control bleeding** with clean cloth and direct pressure\n5. **Keep injured people warm** and calm\n\nPlease describe specific injuries for targeted guidance.\n\n📞 **Ambulance: 108** | **Police: 100** | **Fire: 101**",
}


# ═══════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════

@app.get("/health")
def health_check():
    has_gemini = bool(os.environ.get("GEMINI_API_KEY"))
    model_exists = os.path.exists(os.path.join(DATA_DIR, "model.pkl"))
    return {
        "status": "ok",
        "version": "2.0",
        "gemini_available": has_gemini,
        "model_trained": model_exists,
        "default_location": {"lat": DEFAULT_LAT, "lng": DEFAULT_LNG, "city": "Lucknow"},
    }


@app.post("/predict-severity")
def predict_severity_endpoint(data: SeverityInput):
    try:
        result = predict_severity(data.model_dump())
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/report")
def submit_report(data: ReportInput):
    try:
        # Generate report ID
        report_id = f"RS-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

        report = {
            "id": report_id,
            "timestamp": datetime.now().isoformat(),
            **data.model_dump(),
        }

        # Load existing reports
        reports = []
        if os.path.exists(REPORTS_FILE):
            with open(REPORTS_FILE, "r") as f:
                reports = json.load(f)

        reports.append(report)

        # Save
        with open(REPORTS_FILE, "w") as f:
            json.dump(reports, f, indent=2)

        return {"success": True, "report_id": report_id, "message": "Report submitted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report error: {str(e)}")


@app.post("/triage")
async def triage_chat(data: TriageInput):
    # Step 1: NLP intent classification
    intent_tag, intent_info = classify_intent(data.message)

    # Step 2: Generate response (Gemini or mock)
    api_key = os.environ.get("GEMINI_API_KEY")
    response_text = ""
    source = "mock"

    if api_key:
        try:
            import google.generativeai as genai

            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")

            system_prompt = (
                "You are RoadSoS, an Indian road accident emergency first-aid assistant. "
                "When a user describes an accident or injury, you must: "
                "1) Identify the injury type (head trauma / fracture / bleeding / burns / unconscious / shock / spinal) "
                "2) Give 3-5 clear, numbered first-aid steps in simple English "
                "3) Always end with the relevant helpline (108 for ambulance, 100 for police) "
                "4) Keep responses under 120 words. Never give medical diagnoses. "
                "Always advise calling emergency services."
            )

            # Build chat
            chat = model.start_chat(
                history=[
                    {"role": "user", "parts": [system_prompt]},
                    {"role": "model", "parts": ["I understand. I'm RoadSoS, ready to provide emergency first-aid guidance for road accidents in India."]},
                ]
                + [
                    {"role": h.get("role", "user"), "parts": [h.get("content", "")]}
                    for h in data.history[-10:]  # Last 10 messages
                ]
            )

            result = chat.send_message(data.message)
            response_text = result.text
            source = "gemini"

        except Exception as e:
            print(f"Gemini API error: {e}")
            response_text = MOCK_TRIAGE.get(intent_tag, MOCK_TRIAGE["UNKNOWN"])
            source = "mock_fallback"
    else:
        response_text = MOCK_TRIAGE.get(intent_tag, MOCK_TRIAGE["UNKNOWN"])

    return {
        "response": response_text,
        "intent": {
            "tag": intent_tag,
            "emoji": intent_info["emoji"],
            "color": intent_info["color"],
            "confidence": intent_info["confidence"],
            "matched_keywords": intent_info["matched_keywords"],
            "first_aid_focus": intent_info["first_aid_focus"],
        },
        "suggested_accident_type": get_accident_type_from_intent(intent_tag),
        "source": source,
    }


@app.get("/services")
def get_nearby_services(lat: float = DEFAULT_LAT, lng: float = DEFAULT_LNG):
    """Return nearby emergency services sorted by Haversine distance."""
    result = {}

    for category, services in MOCK_SERVICES.items():
        sorted_services = []
        for svc in services:
            dist = haversine(lat, lng, svc["lat"], svc["lng"])
            sorted_services.append({
                **svc,
                "distance_km": dist,
                "distance_label": f"{dist} km" if dist >= 1 else f"{int(dist * 1000)} m",
            })

        # Sort by distance and take top 3
        sorted_services.sort(key=lambda x: x["distance_km"])
        result[category] = sorted_services[:3]

    return result


# ═══════════════════════════════════
# STATIC FILE SERVING (Production)
# ═══════════════════════════════════

# Serve built React frontend if dist/ exists
if os.path.isdir(FRONTEND_DIR):
    # Mount assets directory
    assets_dir = os.path.join(FRONTEND_DIR, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Serve favicon and other static files
    @app.get("/favicon.svg")
    async def favicon():
        fav = os.path.join(FRONTEND_DIR, "favicon.svg")
        if os.path.exists(fav):
            return FileResponse(fav, media_type="image/svg+xml")
        raise HTTPException(404)

    # SPA catch-all — must be LAST route
    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        # Skip API routes
        if full_path.startswith(("predict-severity", "report", "triage", "services", "health")):
            raise HTTPException(404)
        index = os.path.join(FRONTEND_DIR, "index.html")
        if os.path.exists(index):
            return FileResponse(index, media_type="text/html")
        raise HTTPException(404, "Frontend not built. Run: cd frontend && npm run build")


# ═══════════════════════════════════
# RUN
# ═══════════════════════════════════

if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    print(f"\n🚨 RoadSoS FastAPI Backend v2.0")
    print(f"   Port:   {port}")
    print(f"   Gemini: {'🟢 Available' if os.environ.get('GEMINI_API_KEY') else '🟡 Mock mode'}")
    print(f"   Model:  {'🟢 Loaded' if os.path.exists(os.path.join(DATA_DIR, 'model.pkl')) else '🔴 Not trained'}")
    print(f"   Static: {'🟢 Serving' if os.path.isdir(FRONTEND_DIR) else '🔴 Not built'}\n")

    uvicorn.run(app, host="0.0.0.0", port=port)

