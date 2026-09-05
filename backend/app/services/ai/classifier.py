import re
from typing import Dict, List, Any

CRITICAL_KEYWORDS = [
    "trapped", "casualty", "casualties", "collapse", "collapsed", "breach", "breached",
    "flash flood", "toxic gas", "explosion", "underground fire", "landslide", "drowning",
    "death", "deaths", "chlorine leak", "subterranean fire", "crushed", "evacuation",
    "phasa", "fansa", "aag", "mritu", "baadh"
]

HIGH_KEYWORDS = [
    "subsidence", "sinkhole", "epidemic", "outbreak", "arsenic", "fluoride", "contamination",
    "contaminated", "drought", "starvation", "severe water crisis", "dam overflow", "embankment crack",
    "forest fire", "stampede", "wildlife attack", "elephant conflict", "lightning deaths",
    "zehreela", "sukhha", "bimari"
]

MEDIUM_KEYWORDS = [
    "waterlogging", "drainage", "culvert", "pothole", "potholes", "overflow", "bridge crack",
    "fly ash", "industrial effluent", "garbage dumping", "crop pest", "power outage", "siltation",
    "pani jamav", "sadak tuti", "kachra"
]

TAG_RULES = [
    {"tag": "Flood & Drainage", "terms": ["flood", "flooding", "waterlogging", "drainage", "submerged", "dam", "baadh"]},
    {"tag": "Mine Safety & Fire", "terms": ["coal", "mine", "mining", "subsidence", "underground fire", "methane", "blast", "koyla", "khadaan"]},
    {"tag": "Water Quality & Drought", "terms": ["fluoride", "arsenic", "drought", "borewell", "groundwater", "drinking water", "peene ka pani"]},
    {"tag": "River Erosion & Silt", "terms": ["erosion", "embankment", "riverbank", "siltation", "ganga", "subarnarekha", "damodar"]},
    {"tag": "Forest & Wildlife", "terms": ["forest fire", "wildfire", "elephant", "habitat", "timber", "sanctuary", "jungle"]},
    {"tag": "Public Health", "terms": ["epidemic", "dengue", "cholera", "malaria", "silicosis", "hospital", "toxic", "bimari"]},
    {"tag": "Infrastructure", "terms": ["bridge", "road", "culvert", "crack", "highway", "flyover", "sadak", "pul"]},
    {"tag": "Industrial Waste", "terms": ["fly ash", "effluent", "slurry", "chemical runoff", "smog", "pollution", "karkhana"]},
]

UNIVERSITIES = [
    {
        "name": "IIT (ISM) Dhanbad",
        "code": "IIT-ISM",
        "domain": "Mining, Underground Fires, Geotechnical Hazards, Rock Mechanics",
        "rationale": "Designated National Centre of Excellence in Mining Engineering & Disaster Mitigation"
    },
    {
        "name": "Birla Institute of Technology (BIT) Mesra",
        "code": "BIT-MESRA",
        "domain": "Remote Sensing, GIS, Drone Mapping, Water Resources & Environmental Engg",
        "rationale": "State leader in GIS mapping, satellite imagery, and hydrological modeling"
    },
    {
        "name": "NIT Jamshedpur",
        "code": "NIT-JSR",
        "domain": "Structural Engineering, Industrial Waste Management & River Embankments",
        "rationale": "Premier expertise in heavy civil engineering and industrial corridor pollution"
    },
    {
        "name": "Birsa Agricultural University (BAU) Ranchi",
        "code": "BAU-RANCHI",
        "domain": "Agricultural Drought, Soil Moisture Analytics & Rural Livelihoods",
        "rationale": "Apex agricultural research university in Jharkhand for drought & crop resilience"
    },
    {
        "name": "Rajendra Institute of Medical Sciences (RIMS) Ranchi",
        "code": "RIMS-RANCHI",
        "domain": "Epidemic Surveillance, Public Health Emergencies & Toxic Water Poisoning",
        "rationale": "State nodal medical research institute for epidemic outbreaks & toxicology"
    },
]

def classify_challenge(title: str, description: str) -> Dict[str, Any]:
    combined = f"{title} {description}".lower()

    # 1. Tags
    tags: List[str] = []
    for rule in TAG_RULES:
        if any(term in combined for term in rule["terms"]):
            tags.append(rule["tag"])
    if not tags:
        tags.append("Societal Infrastructure")

    # 2. Urgency & Severity
    crit_matches = [k for k in CRITICAL_KEYWORDS if k in combined]
    high_matches = [k for k in HIGH_KEYWORDS if k in combined]
    med_matches = [k for k in MEDIUM_KEYWORDS if k in combined]

    if crit_matches:
        severity = "CRITICAL"
        urgency = min(100, 85 + len(crit_matches) * 4)
        is_disaster = True
    elif high_matches:
        severity = "HIGH"
        urgency = min(84, 65 + len(high_matches) * 5)
        is_disaster = True
    elif med_matches:
        severity = "MEDIUM"
        urgency = min(64, 40 + len(med_matches) * 4)
        is_disaster = False
    else:
        severity = "LOW"
        urgency = 30
        is_disaster = False

    # 3. Predict Category
    predicted_category = "Disaster Management"
    if any(k in combined for k in ["coal", "mine", "mining", "subsidence", "koyla", "khadaan"]):
        predicted_category = "Mining & Geology"
    elif any(k in combined for k in ["water", "fluoride", "arsenic", "borewell", "drought", "drinking water"]):
        predicted_category = "Water & Sanitation"
    elif any(k in combined for k in ["crop", "farming", "rural", "soil", "kisan", "kheti"]):
        predicted_category = "Agriculture & Rural Development"
    elif any(k in combined for k in ["forest", "elephant", "wildfire", "jungle"]):
        predicted_category = "Environment & Forestry"
    elif any(k in combined for k in ["road", "bridge", "culvert", "sadak", "pul"]):
        predicted_category = "Infrastructure & Transport"
    elif any(k in combined for k in ["disease", "fever", "health", "poison", "hospital", "bimari"]):
        predicted_category = "Public Health & Epidemic"

    # 4. University Recommendation
    recommended_uni = UNIVERSITIES[1]  # Default BIT Mesra
    if predicted_category == "Mining & Geology":
        recommended_uni = UNIVERSITIES[0]  # IIT-ISM
    elif predicted_category in ["Water & Sanitation", "Disaster Management"]:
        recommended_uni = UNIVERSITIES[1]  # BIT Mesra
    elif predicted_category == "Infrastructure & Transport":
        recommended_uni = UNIVERSITIES[2]  # NIT Jamshedpur
    elif predicted_category == "Agriculture & Rural Development":
        recommended_uni = UNIVERSITIES[3]  # BAU Ranchi
    elif predicted_category == "Public Health & Epidemic":
        recommended_uni = UNIVERSITIES[4]  # RIMS Ranchi

    return {
        "predictedCategory": predicted_category,
        "severity": severity,
        "urgencyScore": urgency,
        "tags": tags,
        "isDisasterEmergency": is_disaster,
        "recommendedUniversity": recommended_uni,
    }
