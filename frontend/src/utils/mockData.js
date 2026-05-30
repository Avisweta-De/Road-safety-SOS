/**
 * Mock data for Lucknow, UP — used when Google Places API or backend is unavailable.
 */

export const DEFAULT_LOCATION = {
  lat: 26.8467,
  lng: 80.9462,
  address: 'Hazratganj, Lucknow, UP',
};

export const LUCKNOW_SERVICES = {
  hospitals: [
    { name: 'Ram Manohar Lohia Hospital', lat: 26.8588, lng: 80.9406, phone: '0522-2237629', address: 'Vibhuti Khand, Gomti Nagar', open24: true, rating: 4.3 },
    { name: 'Balrampur Hospital', lat: 26.8566, lng: 80.9350, phone: '0522-2611243', address: 'Kaiserbagh, Lucknow', open24: true, rating: 4.1 },
    { name: 'KGMU Trauma Centre', lat: 26.8403, lng: 80.9348, phone: '0522-2258880', address: 'Shah Mina Road, Chowk', open24: true, rating: 4.5 },
    { name: 'Medanta Hospital', lat: 26.8490, lng: 80.9900, phone: '0522-4505050', address: 'Shaheed Path, Gomti Nagar', open24: true, rating: 4.6 },
    { name: 'SGPGI Emergency', lat: 26.7271, lng: 80.9462, phone: '0522-2668004', address: 'Raebareli Road', open24: true, rating: 4.7 },
  ],
  police: [
    { name: 'Hazratganj Police Station', lat: 26.8508, lng: 80.9456, phone: '0522-2204178', address: 'Hazratganj, Lucknow', open24: true },
    { name: 'Sadar Bazar Police Station', lat: 26.8585, lng: 80.9505, phone: '0522-2203361', address: 'Sadar, Lucknow Cantt', open24: true },
    { name: 'Kaiserbagh Police Chowki', lat: 26.8520, lng: 80.9340, phone: '0522-2620093', address: 'Kaiserbagh, Lucknow', open24: true },
  ],
  towing: [
    { name: 'UP Highway Rescue', lat: 26.8550, lng: 80.9520, phone: '9415001234', address: 'Ashok Marg, Lucknow' },
    { name: 'Quick Rescue Towing', lat: 26.8400, lng: 80.9550, phone: '9839001234', address: 'Aminabad, Lucknow' },
    { name: 'National Highway Helpline', lat: 26.8600, lng: 80.9600, phone: '1033', address: 'NH-24, Lucknow' },
  ],
  fire_stations: [
    { name: 'Lucknow Fire Station HQ', lat: 26.8460, lng: 80.9300, phone: '0522-2208801', address: 'Nishatganj, Lucknow', open24: true },
    { name: 'Aliganj Fire Station', lat: 26.8820, lng: 80.9350, phone: '0522-2325101', address: 'Aliganj, Lucknow', open24: true },
  ],
};

/** Mock triage responses keyed by NLP intent tag */
export const MOCK_TRIAGE = {
  HEAD: "🧠 **Head Injury First Aid:**\n\n1. **Keep the person still** — do NOT move the neck\n2. **Apply gentle pressure** with clean cloth if bleeding\n3. **Monitor consciousness** — ask name, date\n4. **Watch for danger signs**: vomiting, unequal pupils\n5. **Call 108 immediately**\n\n⚠️ Assume spinal injury with serious head trauma.\n\n📞 Ambulance: 108 | Police: 100",
  BLEEDING: "🩸 **Bleeding Control:**\n\n1. **Apply firm direct pressure** with clean cloth\n2. **Elevate** the area above heart level\n3. **Do NOT remove** embedded objects\n4. **Add more layers** if blood soaks through\n5. **For severe bleeding**, apply tourniquet above wound\n\n⚠️ Rush to hospital if bleeding doesn't stop in 10 min.\n\n📞 Ambulance: 108",
  FRACTURE: "🦴 **Fracture First Aid:**\n\n1. **Do NOT move** the injured limb\n2. **Support** with padding (rolled clothing)\n3. **Apply ice** wrapped in cloth\n4. **Check circulation** below fracture\n5. **Call 108** — don't transport yourself\n\n⚠️ Never straighten a broken bone.\n\n📞 Ambulance: 108",
  BURNS: "🔥 **Burns Treatment:**\n\n1. **Cool under running water** for 20+ minutes\n2. **Remove jewellery** near burn (unless stuck)\n3. **Cover loosely** with non-stick dressing\n4. **Do NOT apply** ice, butter, oils\n5. **Do NOT burst** blisters\n\n⚠️ If burn > palm size, call 108.\n\n📞 Ambulance: 108 | Fire: 101",
  UNCONSCIOUS: "🚨 **Unconscious Person:**\n\n1. **Check breathing** — 10 seconds\n2. **If breathing**: Recovery position (on side)\n3. **If NOT breathing**: Start CPR now\n   - 30 compressions, 2 breaths\n4. **Call 108 NOW**\n5. **Clear airway** — tilt head, lift chin\n\n⚠️ Do NOT give food/water.\n\n📞 Ambulance: 108",
  SHOCK: "💫 **Shock Management:**\n\n1. **Lay person down** — elevate legs 30cm\n2. **Keep warm** with blankets\n3. **Loosen tight clothing**\n4. **Do NOT give food/drink**\n5. **Monitor breathing**, keep talking\n\n⚠️ Shock is life-threatening. Call 108.\n\n📞 Ambulance: 108",
  SPINAL: "🔴 **Spinal Injury:**\n\n1. **Do NOT move** the person\n2. **Keep head-neck-back aligned**\n3. **Place rolled towels** beside head\n4. **Call 108** and wait for professionals\n5. **Monitor breathing**\n\n⚠️ Moving can cause permanent paralysis.\n\n📞 Ambulance: 108",
  UNKNOWN: "🚗 **General Accident First Aid:**\n\n1. **Ensure scene safety** — engines off, hazards on\n2. **Call 108** (ambulance) and **100** (police)\n3. **Do NOT move** injured unless in danger\n4. **Control bleeding** with clean cloth\n5. **Keep injured warm** and calm\n\nDescribe specific injuries for targeted guidance.\n\n📞 Ambulance: 108 | Police: 100 | Fire: 101",
};
