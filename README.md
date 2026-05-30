# RoadSoS v2 — Emergency Road Accident Response Tool 🚨

A production-ready, mobile-first emergency response web app for India. Built with React + Tailwind CSS, Python FastAPI, scikit-learn ML severity classifier, Gemini AI triage chatbot, and Leaflet.js maps.

**Default location:** Lucknow, Uttar Pradesh (26.8467°N, 80.9462°E)

## ✨ Features

| # | Feature | Tech |
|---|---------|------|
| 1 | 📍 **Live GPS + Map** | Leaflet.js + Nominatim reverse geocoding |
| 2 | 🏥 **Nearby Services** | Haversine-sorted hospitals, police, towing, fire |
| 3 | 📞 **One-Tap SOS** | 5 buttons: 108, 100, 101, 1073, 1091 |
| 4 | 🤖 **AI Severity Classifier** | Random Forest on 3000-row India accident CSV |
| 5 | 💬 **AI Triage Chatbot** | Gemini 1.5 Flash + NLP intent detection |
| 6 | 📝 **Accident Report** | Auto-fill + severity prediction + photo upload |
| 7 | 📤 **Share Location** | WhatsApp / SMS / Copy with Google Maps link |
| 8 | 🎮 **Demo Mode** | Full functionality without any API keys |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS v3 |
| Maps | Leaflet.js + OpenStreetMap (free, no key) |
| Backend | Python FastAPI + Uvicorn |
| ML Model | scikit-learn Random Forest (trained on real CSV) |
| NLP | Keyword intent classifier (7 injury types) |
| AI Chat | Gemini 1.5 Flash API (with mock fallback) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+

### 1. Install & Train Model

```bash
# Install Python dependencies
cd backend
pip install -r requirements.txt

# Train the severity model
cd ..
python backend/train_model.py
# → Creates data/model.pkl
```

### 2. Start Backend

```bash
cd backend
python main.py
# → FastAPI running on http://localhost:8000
```

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
# → React app on http://localhost:5173
```

### Optional: Gemini AI (live mode)

```bash
set GEMINI_API_KEY=your_key_here
python backend/main.py
```

## 📁 Project Structure

```
d:\Unstop\
├── frontend/
│   ├── src/
│   │   ├── components/  (8 components)
│   │   ├── hooks/       (useGeolocation)
│   │   ├── utils/       (haversine, mockData)
│   │   ├── App.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
├── backend/
│   ├── main.py           (FastAPI server)
│   ├── severity_model.py (prediction)
│   ├── train_model.py    (training pipeline)
│   ├── intent_classifier.py (NLP)
│   └── requirements.txt
├── data/
│   ├── accident_prediction_india.csv
│   └── model.pkl (generated)
└── README.md
```

## 🎮 Demo Mode

Works fully without API keys:
- **GPS** → Lucknow fallback (26.8467, 80.9462)
- **Services** → Lucknow hospitals, police, towing
- **Chat** → Keyword-matched first-aid responses
- **Severity** → Real ML model (always works)

## 📊 ML Model

- **Algorithm:** Random Forest (100 trees, max_depth=15)
- **Dataset:** 3001 rows from Kaggle India Road Accident CSV
- **Features:** 16 (vehicles, casualties, weather, road type, etc.)
- **Target:** Severity (Fatal → CRITICAL, Serious → MODERATE, Minor → LOW)

## 📄 License

MIT
