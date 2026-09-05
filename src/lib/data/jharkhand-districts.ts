export interface DistrictInfo {
  name: string;
  state: string;
  lat: number;
  lng: number;
  primaryRisk: string;
  vulnerabilityIndex: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

export const JHARKHAND_DISTRICTS: DistrictInfo[] = [
  { name: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096, primaryRisk: "Urban Flash Flooding & Waste Drainage", vulnerabilityIndex: "HIGH" },
  { name: "Dhanbad", state: "Jharkhand", lat: 23.7957, lng: 86.4304, primaryRisk: "Underground Coal Fires & Mine Subsidence", vulnerabilityIndex: "CRITICAL" },
  { name: "East Singhbhum", state: "Jharkhand", lat: 22.8046, lng: 86.2029, primaryRisk: "Industrial Effluent & River Heavy Metal Runoff", vulnerabilityIndex: "HIGH" },
  { name: "Bokaro", state: "Jharkhand", lat: 23.6693, lng: 86.1511, primaryRisk: "Thermal Fly Ash & Air Pollution", vulnerabilityIndex: "MEDIUM" },
  { name: "Palamu", state: "Jharkhand", lat: 24.0416, lng: 84.0734, primaryRisk: "Acute Drought & Groundwater Fluoride Contamination", vulnerabilityIndex: "CRITICAL" },
  { name: "Hazaribagh", state: "Jharkhand", lat: 23.9925, lng: 85.3637, primaryRisk: "Forest Fires & Human-Elephant Wildlife Conflict", vulnerabilityIndex: "HIGH" },
  { name: "Deoghar", state: "Jharkhand", lat: 24.4826, lng: 86.6974, primaryRisk: "Religious Congregation Stampede & Flash Rain Runoff", vulnerabilityIndex: "HIGH" },
  { name: "Dumka", state: "Jharkhand", lat: 24.2676, lng: 87.2486, primaryRisk: "Rural Water Table Depletion & Soil Erosion", vulnerabilityIndex: "MEDIUM" },
  { name: "Giridih", state: "Jharkhand", lat: 24.1856, lng: 86.3072, primaryRisk: "Illegal Coal Pit Cave-ins & Mica Dust Toxicity", vulnerabilityIndex: "HIGH" },
  { name: "West Singhbhum", state: "Jharkhand", lat: 22.5638, lng: 85.8078, primaryRisk: "Iron Ore Siltation in Forest Catchments", vulnerabilityIndex: "MEDIUM" },
  { name: "Garhwa", state: "Jharkhand", lat: 24.1611, lng: 83.8052, primaryRisk: "Severe Summer Heat Waves & Water Shortage", vulnerabilityIndex: "HIGH" },
  { name: "Chatra", state: "Jharkhand", lat: 24.2114, lng: 84.8718, primaryRisk: "Lightning Strikes & Forest Degradation", vulnerabilityIndex: "HIGH" },
  { name: "Gumla", state: "Jharkhand", lat: 23.0427, lng: 84.5422, primaryRisk: "Bauxite Mine Wash-off & Seasonal Drought", vulnerabilityIndex: "MEDIUM" },
  { name: "Lohardaga", state: "Jharkhand", lat: 23.4357, lng: 84.6789, primaryRisk: "Bauxite Tailings Soil Leaching", vulnerabilityIndex: "MEDIUM" },
  { name: "Simdega", state: "Jharkhand", lat: 22.6146, lng: 84.5098, primaryRisk: "Monsoon Isolated Village Cutoffs & Flash Surges", vulnerabilityIndex: "MEDIUM" },
  { name: "Latehar", state: "Jharkhand", lat: 23.7438, lng: 84.4988, primaryRisk: "Steep Terrain Landslides & Forest Fire Outbreaks", vulnerabilityIndex: "HIGH" },
  { name: "Koderma", state: "Jharkhand", lat: 24.4674, lng: 85.5937, primaryRisk: "Old Mine Open Voids & Ground Instability", vulnerabilityIndex: "MEDIUM" },
  { name: "Ramgarh", state: "Jharkhand", lat: 23.6332, lng: 85.5149, primaryRisk: "Damodar River Industrial Siltation", vulnerabilityIndex: "HIGH" },
  { name: "Godda", state: "Jharkhand", lat: 24.8277, lng: 87.2144, primaryRisk: "Open-Cast Overburden Collapse Risks", vulnerabilityIndex: "MEDIUM" },
  { name: "Sahibganj", state: "Jharkhand", lat: 25.2425, lng: 87.6409, primaryRisk: "Ganga River Bank Erosion & Annual Monsoon Floods", vulnerabilityIndex: "CRITICAL" },
  { name: "Pakur", state: "Jharkhand", lat: 24.6344, lng: 87.8488, primaryRisk: "Stone Quarry Dust & Silicosis Hazard", vulnerabilityIndex: "HIGH" },
  { name: "Jamtara", state: "Jharkhand", lat: 23.9629, lng: 86.8016, primaryRisk: "Drought & Extreme Groundwater Arsenic", vulnerabilityIndex: "MEDIUM" },
  { name: "Khunti", state: "Jharkhand", lat: 23.0734, lng: 85.2796, primaryRisk: "Lac Crop Pest Outbreaks & Unseasonal Hailstorms", vulnerabilityIndex: "MEDIUM" },
  { name: "Seraikela Kharsawan", state: "Jharkhand", lat: 22.7006, lng: 85.9298, primaryRisk: "Flash Surges from Subarnarekha Tributaries", vulnerabilityIndex: "MEDIUM" },
];

export {
  ALL_INDIAN_STATES,
  STATE_DISTRICT_MAP,
  STATE_COORDINATES,
  getDistrictsForState,
  getStateCoordinates,
  normalizeStateName,
  normalizeDistrictName,
} from "./india-districts";


export const CATEGORIES = [
  "Disaster Management",
  "Water & Sanitation",
  "Mining & Geology",
  "Infrastructure & Transport",
  "Agriculture & Rural Development",
  "Environment & Forestry",
  "Public Health & Epidemic",
  "Energy & Power",
];

export const PREMIER_INSTITUTES = [
  {
    name: "Birla Institute of Technology, Mesra",
    code: "BIT-MESRA",
    district: "Ranchi",
    specialties: ["Remote Sensing & GIS", "Hydrology & Flood Modeling", "Drone Disaster Assessment", "AI/ML Systems"],
  },
  {
    name: "IIT (ISM) Dhanbad",
    code: "IIT-ISM",
    district: "Dhanbad",
    specialties: ["Mine Subsidence Monitoring", "Subterranean Coal Fires", "Seismic Geology", "Groundwater Geophysics"],
  },
  {
    name: "National Institute of Technology, Jamshedpur",
    code: "NIT-JSR",
    district: "East Singhbhum",
    specialties: ["Structural Hazard Mitigation", "Industrial Waste Treatment", "IoT Sensor Networks", "Smart Drainage"],
  },
  {
    name: "Birsa Agricultural University",
    code: "BAU-RANCHI",
    district: "Ranchi",
    specialties: ["Drought-Resistant Farming", "Forest Fire Ecology", "Soil Erosion Prevention", "Agri-Meteorology"],
  },
  {
    name: "AIIMS Deoghar",
    code: "AIIMS-DEO",
    district: "Deoghar",
    specialties: ["Epidemic Surveillance", "Disaster Emergency Triage", "Waterborne Disease Control", "Crowd Health Logistics"],
  },
  {
    name: "Ranchi University",
    code: "RU-RANCHI",
    district: "Ranchi",
    specialties: ["Societal Vulnerability Studies", "Community Disaster Preparedness", "Tribal Livelihood Resilience"],
  },
];
