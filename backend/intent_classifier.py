"""
intent_classifier.py — NLP-based injury type detection from user messages.

Uses keyword matching to classify injury descriptions into categories.
"""

import re
from typing import Tuple

# Intent definitions with keywords and priority
INTENT_KEYWORDS = {
    "HEAD": {
        "keywords": [
            "head", "skull", "brain", "concussion", "dizzy", "dizziness",
            "hit head", "head injury", "head trauma", "forehead", "temple",
            "vomiting after hit", "unconscious after head",
        ],
        "emoji": "🧠",
        "color": "#8B5CF6",
        "first_aid_focus": "head trauma",
    },
    "BLEEDING": {
        "keywords": [
            "bleed", "bleeding", "blood", "cut", "wound", "gash", "slash",
            "laceration", "deep cut", "profuse bleeding", "blood loss",
            "hemorrhage", "haemorrhage",
        ],
        "emoji": "🩸",
        "color": "#DC2626",
        "first_aid_focus": "wound care",
    },
    "FRACTURE": {
        "keywords": [
            "broken", "fracture", "fractured", "bone", "snap", "crack",
            "twisted", "dislocated", "dislocation", "swollen limb",
            "can't move arm", "can't move leg", "bent wrong",
        ],
        "emoji": "🦴",
        "color": "#F59E0B",
        "first_aid_focus": "fracture immobilization",
    },
    "BURNS": {
        "keywords": [
            "burn", "burns", "fire", "flame", "scald", "scalded", "hot",
            "chemical burn", "acid", "petrol fire", "fuel leak fire",
            "vehicle fire", "explosion", "blister",
        ],
        "emoji": "🔥",
        "color": "#EA580C",
        "first_aid_focus": "burn treatment",
    },
    "UNCONSCIOUS": {
        "keywords": [
            "unconscious", "not breathing", "fainted", "collapsed",
            "unresponsive", "not moving", "no pulse", "cardiac",
            "heart stopped", "cpr", "not waking", "passed out",
            "no response",
        ],
        "emoji": "🚨",
        "color": "#991B1B",
        "first_aid_focus": "CPR and airway",
    },
    "SHOCK": {
        "keywords": [
            "shock", "pale", "cold skin", "sweating", "confused",
            "rapid breathing", "weak pulse", "shaking", "trembling",
            "disoriented", "can't speak", "panicking",
        ],
        "emoji": "💫",
        "color": "#7C3AED",
        "first_aid_focus": "shock management",
    },
    "SPINAL": {
        "keywords": [
            "spine", "spinal", "neck", "back injury", "paralyzed",
            "can't feel legs", "can't move", "tingling", "numbness",
            "vertebra", "spinal cord", "whiplash",
        ],
        "emoji": "🔴",
        "color": "#B91C1C",
        "first_aid_focus": "spinal immobilization",
    },
}


def classify_intent(message: str) -> Tuple[str, dict]:
    """
    Classify the injury intent from a user message.

    Args:
        message: User's description of the accident/injury

    Returns:
        Tuple of (intent_tag, intent_info_dict)
        intent_tag: HEAD / BLEEDING / FRACTURE / BURNS / UNCONSCIOUS / SHOCK / SPINAL / UNKNOWN
        intent_info: dict with emoji, color, first_aid_focus, confidence, matched_keywords
    """
    message_lower = message.lower()

    best_intent = "UNKNOWN"
    best_score = 0
    best_matches = []

    for intent, info in INTENT_KEYWORDS.items():
        matches = []
        for kw in info["keywords"]:
            # Use word boundary matching for short keywords
            if len(kw.split()) == 1:
                pattern = r"\b" + re.escape(kw) + r"\b"
                if re.search(pattern, message_lower):
                    matches.append(kw)
            else:
                # Multi-word: simple substring match
                if kw in message_lower:
                    matches.append(kw)

        score = len(matches)
        if score > best_score:
            best_score = score
            best_intent = intent
            best_matches = matches

    if best_intent == "UNKNOWN" or best_score == 0:
        return "UNKNOWN", {
            "emoji": "❓",
            "color": "#6B7280",
            "first_aid_focus": "general first aid",
            "confidence": 0.0,
            "matched_keywords": [],
        }

    info = INTENT_KEYWORDS[best_intent]
    confidence = min(1.0, best_score * 0.3 + 0.4)  # Scale: 1 match=0.7, 2=1.0

    return best_intent, {
        "emoji": info["emoji"],
        "color": info["color"],
        "first_aid_focus": info["first_aid_focus"],
        "confidence": round(confidence, 2),
        "matched_keywords": best_matches,
    }


def get_accident_type_from_intent(intent: str) -> str:
    """Map NLP intent to accident report form type."""
    mapping = {
        "HEAD": "collision",
        "BLEEDING": "collision",
        "FRACTURE": "rollover",
        "BURNS": "vehicle-fire",
        "UNCONSCIOUS": "collision",
        "SHOCK": "collision",
        "SPINAL": "rollover",
        "UNKNOWN": "other",
    }
    return mapping.get(intent, "other")
