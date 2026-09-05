export interface StateCoordinates {
  lat: number;
  lng: number;
  zoom?: number;
}

export const STATE_COORDINATES: Record<string, StateCoordinates> = {
  "Jharkhand": { lat: 23.3441, lng: 85.3096, zoom: 8 },
  "Tamil Nadu": { lat: 11.1271, lng: 78.6569, zoom: 8 },
  "Maharashtra": { lat: 19.7515, lng: 75.7139, zoom: 7 },
  "Karnataka": { lat: 15.3173, lng: 75.7139, zoom: 7 },
  "Kerala": { lat: 10.8505, lng: 76.2711, zoom: 8 },
  "Delhi": { lat: 28.7041, lng: 77.1025, zoom: 11 },
  "Uttar Pradesh": { lat: 26.8467, lng: 80.9462, zoom: 7 },
  "Bihar": { lat: 25.0961, lng: 85.3131, zoom: 8 },
  "West Bengal": { lat: 22.9868, lng: 87.8550, zoom: 8 },
  "Andhra Pradesh": { lat: 15.9129, lng: 79.7400, zoom: 7 },
  "Telangana": { lat: 18.1124, lng: 79.0193, zoom: 8 },
  "Gujarat": { lat: 22.2587, lng: 71.1924, zoom: 7 },
  "Rajasthan": { lat: 27.0238, lng: 74.2179, zoom: 7 },
  "Madhya Pradesh": { lat: 22.9734, lng: 78.6569, zoom: 7 },
  "Odisha": { lat: 20.9517, lng: 85.0985, zoom: 8 },
  "Punjab": { lat: 31.1471, lng: 75.3412, zoom: 8 },
  "Haryana": { lat: 29.0588, lng: 76.0856, zoom: 8 },
  "Assam": { lat: 26.2006, lng: 92.9376, zoom: 8 },
  "Chhattisgarh": { lat: 21.2787, lng: 81.8661, zoom: 7 },
  "Himachal Pradesh": { lat: 31.1048, lng: 77.1734, zoom: 8 },
  "Uttarakhand": { lat: 30.0668, lng: 79.0193, zoom: 8 },
  "Goa": { lat: 15.2993, lng: 74.1240, zoom: 10 },
  "Jammu & Kashmir": { lat: 33.7782, lng: 76.5762, zoom: 8 },
  "Ladakh": { lat: 34.1526, lng: 77.5771, zoom: 8 },
  "Chandigarh": { lat: 30.7333, lng: 76.7794, zoom: 12 },
  "Tripura": { lat: 23.9408, lng: 91.9882, zoom: 9 },
  "Meghalaya": { lat: 25.4670, lng: 91.3662, zoom: 9 },
  "Manipur": { lat: 24.6637, lng: 93.9063, zoom: 9 },
  "Nagaland": { lat: 26.1584, lng: 94.5624, zoom: 9 },
  "Mizoram": { lat: 23.1645, lng: 92.9376, zoom: 9 },
  "Arunachal Pradesh": { lat: 28.2180, lng: 94.7278, zoom: 8 },
  "Sikkim": { lat: 27.5330, lng: 88.5122, zoom: 9 },
  "Puducherry": { lat: 11.9416, lng: 79.8083, zoom: 11 },
  "Andaman & Nicobar Islands": { lat: 11.7401, lng: 92.6586, zoom: 8 },
  "Dadra & Nagar Haveli and Daman & Diu": { lat: 20.4283, lng: 72.8397, zoom: 10 },
  "Lakshadweep": { lat: 10.5667, lng: 72.6417, zoom: 9 },
};

export const ALL_INDIAN_STATES: string[] = [
  "Jharkhand",
  "Tamil Nadu",
  "Maharashtra",
  "Karnataka",
  "Kerala",
  "Delhi",
  "Uttar Pradesh",
  "Bihar",
  "West Bengal",
  "Andhra Pradesh",
  "Telangana",
  "Gujarat",
  "Rajasthan",
  "Madhya Pradesh",
  "Odisha",
  "Punjab",
  "Haryana",
  "Assam",
  "Chhattisgarh",
  "Himachal Pradesh",
  "Uttarakhand",
  "Goa",
  "Jammu & Kashmir",
  "Ladakh",
  "Chandigarh",
  "Tripura",
  "Meghalaya",
  "Manipur",
  "Nagaland",
  "Mizoram",
  "Arunachal Pradesh",
  "Sikkim",
  "Puducherry",
  "Andaman & Nicobar Islands",
  "Dadra & Nagar Haveli and Daman & Diu",
  "Lakshadweep",
];

export const STATE_DISTRICT_MAP: Record<string, string[]> = {
  "Jharkhand": [
    "Ranchi", "Dhanbad", "East Singhbhum", "Bokaro", "Palamu", "Hazaribagh",
    "Deoghar", "Dumka", "Giridih", "West Singhbhum", "Garhwa", "Chatra",
    "Gumla", "Lohardaga", "Simdega", "Latehar", "Koderma", "Ramgarh",
    "Godda", "Sahibganj", "Pakur", "Jamtara", "Khunti", "Seraikela Kharsawan"
  ],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli",
    "Tiruppur", "Erode", "Vellore", "Thoothukudi", "Dindigul", "Thanjavur",
    "Ranipet", "Virudhunagar", "Karur", "Nilgiris", "Kanchipuram", "Chengalpattu",
    "Tiruvallur", "Cuddalore", "Villupuram", "Kallakurichi", "Tiruvannamalai",
    "Dharmapuri", "Krishnagiri", "Namakkal", "Pudukkottai", "Sivaganga",
    "Ramanathapuram", "Theni", "Tenkasi", "Kanniyakumari", "Ariyalur",
    "Perambalur", "Tirupathur", "Mayiladuthurai", "Nagapattinam", "Tiruvarur"
  ],
  "Maharashtra": [
    "Mumbai City", "Mumbai Suburban", "Pune", "Nagpur", "Thane", "Nashik",
    "Chhatrapati Sambhajinagar", "Solapur", "Amravati", "Kolhapur", "Navi Mumbai",
    "Sangli", "Jalgaon", "Akola", "Latur", "Dhule", "Ahmednagar", "Chandrapur",
    "Parbhani", "Jalna", "Beed", "Raigad", "Ratnagiri", "Satara", "Sindhudurg",
    "Dharashiv", "Yavatmal", "Wardha", "Bhandara", "Gondia", "Gadchiroli",
    "Washim", "Hingoli", "Buldhana", "Nandurbar", "Palghar"
  ],
  "Karnataka": [
    "Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Hubballi-Dharwad", "Mangaluru",
    "Belagavi", "Ballari", "Kalaburagi", "Davanagere", "Shivamogga", "Tumakuru",
    "Udupi", "Hassan", "Vijayapura", "Bidar", "Raichur", "Bagalkot", "Mandya",
    "Chikkamagaluru", "Chitradurga", "Chamarajanagar", "Gadag", "Haveri",
    "Kolar", "Chikkaballapur", "Koppal", "Ramanagara", "Uttara Kannada",
    "Kodagu", "Yadgir", "Vijayanagara"
  ],
  "Kerala": [
    "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
    "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode",
    "Wayanad", "Kannur", "Kasaragod"
  ],
  "Delhi": [
    "New Delhi", "Central Delhi", "East Delhi", "North Delhi", "North East Delhi",
    "North West Delhi", "Shahdara", "South Delhi", "South East Delhi",
    "South West Delhi", "West Delhi"
  ],
  "Uttar Pradesh": [
    "Lucknow", "Kanpur Nagar", "Varanasi", "Agra", "Prayagraj", "Meerut",
    "Ghaziabad", "Gautam Buddha Nagar", "Bareilly", "Aligarh", "Moradabad",
    "Gorakhpur", "Saharanpur", "Jhansi", "Mathura", "Ayodhya", "Muzaffarnagar",
    "Firozabad", "Shahjahanpur", "Rampur", "Mirzapur", "Raebareli", "Sitapur",
    "Bulandshahr", "Hardoi", "Budaun", "Sambhal", "Amroha", "Hapur", "Kasganj",
    "Hathras", "Etah", "Mainpuri", "Etawah", "Auraiya", "Farrukhabad", "Kannauj",
    "Kanpur Dehat", "Jalaun", "Lalitpur", "Hamirpur", "Mahoba", "Banda",
    "Chitrakoot", "Fatehpur", "Pratapgarh", "Kaushambi", "Jaunpur", "Ghazipur",
    "Chandauli", "Ballia", "Mau", "Azamgarh", "Deoria", "Kushinagar",
    "Maharajganj", "Basti", "Sant Kabir Nagar", "Siddharthnagar", "Gonda",
    "Balrampur", "Shravasti", "Bahraich", "Lakhimpur Kheri", "Unnao", "Barabanki",
    "Sultanpur", "Amethi", "Ambedkar Nagar", "Sonbhadra", "Bhadohi", "Shamli", "Baghpat"
  ],
  "Bihar": [
    "Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia",
    "Begusarai", "Munger", "Nalanda", "Saran", "Vaishali", "Rohtas", "Samastipur",
    "Saharsa", "Katihar", "Madhubani", "Siwan", "East Champaran", "West Champaran",
    "Sitamarhi", "Gopalganj", "Khagaria", "Madhepura", "Supaul", "Kishanganj",
    "Araria", "Buxar", "Bhojpur", "Aurangabad", "Nawada", "Jamui", "Jehanabad",
    "Arwal", "Kaimur", "Lakhisarai", "Sheikhpura", "Banka", "Sheohar"
  ],
  "West Bengal": [
    "Kolkata", "Howrah", "North 24 Parganas", "South 24 Parganas", "Hooghly",
    "Paschim Medinipur", "Purba Medinipur", "Paschim Bardhaman", "Purba Bardhaman",
    "Nadia", "Murshidabad", "Birbhum", "Bankura", "Purulia", "Malda",
    "Uttar Dinajpur", "Dakshin Dinajpur", "Jalpaiguri", "Alipurduar",
    "Cooch Behar", "Darjeeling", "Kalimpong", "Jhargram"
  ],
  "Andhra Pradesh": [
    "Visakhapatnam", "NTR (Vijayawada)", "Guntur", "Tirupati", "Kurnool", "Kakinada",
    "Nellore", "East Godavari", "West Godavari", "YSR Kadapa", "Ananthapuramu",
    "Chittoor", "Eluru", "Prakasam", "Srikakulam", "Vizianagaram", "Nandyal",
    "Krishna", "Bapatla", "Palnadu", "Annamayya", "Sri Sathya Sai",
    "Dr. B.R. Ambedkar Konaseema", "Anakapalli", "Parvathipuram Manyam",
    "Alluri Sitharama Raju"
  ],
  "Telangana": [
    "Hyderabad", "Medchal-Malkajgiri", "Ranga Reddy", "Warangal", "Hanumakonda",
    "Nizamabad", "Karimnagar", "Khammam", "Peddapalli", "Mahabubnagar", "Nalgonda",
    "Adilabad", "Suryapet", "Siddipet", "Jagtial", "Mancherial", "Nirmal",
    "Kamareddy", "Bhadradri Kothagudem", "Wanaparthy", "Jogulamba Gadwal",
    "Nagarkurnool", "Sangareddy", "Medak", "Vikarabad", "Jangaon",
    "Jayashankar Bhupalpally", "Komaram Bheem Asifabad", "Mahabubabad",
    "Mulugu", "Narayanpet", "Rajanna Sircilla", "Yadadri Bhuvanagiri"
  ],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh",
    "Gandhinagar", "Anand", "Navsari", "Morbi", "Kheda", "Bharuch", "Mehsana",
    "Kutch", "Porbandar", "Valsad", "Surendranagar", "Patan", "Amreli",
    "Banaskantha", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka",
    "Gir Somnath", "Mahisagar", "Narmada", "Panchmahal", "Sabarkantha", "Tapi", "Aravalli"
  ],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara",
    "Alwar", "Bharatpur", "Sikar", "Pali", "Sri Ganganagar", "Barmer", "Chittorgarh",
    "Jhunjhunu", "Churu", "Banswara", "Dausa", "Nagaur", "Tonk", "Jaisalmer",
    "Hanumangarh", "Bundi", "Jhalawar", "Sawai Madhopur", "Dholpur", "Dungarpur",
    "Rajsamand", "Sirohi", "Pratapgarh", "Karauli", "Baran", "Jalore"
  ],
  "Madhya Pradesh": [
    "Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Rewa", "Satna",
    "Ratlam", "Chhindwara", "Dewas", "Shivpuri", "Vidisha", "Morena", "Bhind",
    "Khargone", "Khandwa", "Sehore", "Betul", "Balaghat", "Damoh", "Mandsaur",
    "Neemuch", "Narmadapuram", "Raisen", "Seoni", "Datia", "Chhatarpur", "Dhar",
    "Guna", "Harda", "Jhabua", "Katni", "Mandla", "Narsinghpur", "Panna",
    "Rajgarh", "Shajapur", "Sheopur", "Sidhi", "Singrauli", "Tikamgarh",
    "Umaria", "Dindori", "Burhanpur", "Alirajpur", "Anuppur", "Ashoknagar",
    "Barwani", "Agar Malwa", "Niwari"
  ],
  "Odisha": [
    "Khordha", "Cuttack", "Ganjam", "Sundargarh", "Sambalpur", "Puri", "Balasore",
    "Bhadrak", "Mayurbhanj", "Angul", "Jharsuguda", "Jajpur", "Kendrapara",
    "Jagatsinghpur", "Balangir", "Bargarh", "Rayagada", "Koraput", "Kalahandi",
    "Dhenkanal", "Kendujhar", "Malkangiri", "Nabarangpur", "Nuapada", "Kandhamal",
    "Boudh", "Deogarh", "Gajapati", "Subarnapur", "Nayagarh"
  ],
  "Punjab": [
    "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "SAS Nagar (Mohali)",
    "Hoshiarpur", "Pathankot", "Moga", "Gurdaspur", "Barnala", "Firozpur",
    "Kapurthala", "Sangrur", "Fazilka", "SBS Nagar", "Faridkot", "Mansa",
    "Tarn Taran", "Rupnagar", "Fatehgarh Sahib", "Malerkotla", "Sri Muktsar Sahib"
  ],
  "Haryana": [
    "Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak",
    "Hisar", "Karnal", "Sonipat", "Panchkula", "Bhiwani", "Sirsa", "Jhajjar",
    "Jind", "Kurukshetra", "Kaithal", "Rewari", "Palwal", "Nuh", "Charkhi Dadri",
    "Fatehabad", "Mahendragarh"
  ],
  "Assam": [
    "Kamrup Metropolitan (Guwahati)", "Dibrugarh", "Cachar (Silchar)", "Jorhat",
    "Nagaon", "Tinsukia", "Sonitpur (Tezpur)", "Bongaigaon", "Dhubri", "Barpeta",
    "Karimganj", "Sivasagar", "Goalpara", "Golaghat", "Lakhimpur", "Hailakandi",
    "Darrang", "Hojai", "Morigaon", "Nalbari", "Kokrajhar", "Baksa", "Udalguri",
    "Chirang", "Karbi Anglong", "Dhemaji", "Biswanath", "Charaideo", "Majuli",
    "South Salmara", "West Karbi Anglong"
  ],
  "Chhattisgarh": [
    "Raipur", "Bilaspur", "Durg", "Rajnandgaon", "Korba", "Raigarh", "Jagdalpur (Bastar)",
    "Ambikapur (Surguja)", "Dhamtari", "Mahasamund", "Janjgir-Champa", "Balod",
    "Bemetara", "Kabirdham", "Baloda Bazar", "Gariaband", "Kanker", "Kondagaon",
    "Dantewada", "Sukma", "Bijapur", "Narayanpur", "Koriya", "Surajpur",
    "Balrampur", "Jashpur", "Mungeli", "Gaurela-Pendra-Marwahi"
  ],
  "Himachal Pradesh": [
    "Shimla", "Kangra", "Mandi", "Solan", "Kullu", "Sirmaur", "Una", "Hamirpur",
    "Chamba", "Bilaspur", "Kinnaur", "Lahaul and Spiti"
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Nainital", "Udham Singh Nagar", "Pauri Garhwal",
    "Almora", "Tehri Garhwal", "Pithoragarh", "Chamoli", "Uttarkashi",
    "Bageshwar", "Champawat", "Rudraprayag"
  ],
  "Goa": [
    "North Goa", "South Goa"
  ],
  "Jammu & Kashmir": [
    "Srinagar", "Jammu", "Anantnag", "Baramulla", "Budgam", "Pulwama", "Kupwara",
    "Kathua", "Udhampur", "Rajouri", "Poonch", "Ganderbal", "Kulgam", "Doda",
    "Bandipora", "Samba", "Reasi", "Ramban", "Kishtwar", "Shopian"
  ],
  "Ladakh": [
    "Leh", "Kargil"
  ],
  "Chandigarh": [
    "Chandigarh"
  ],
  "Tripura": [
    "West Tripura (Agartala)", "Gomati", "South Tripura", "Dhalai", "North Tripura",
    "Unakoti", "Khowai", "Sepahijala"
  ],
  "Meghalaya": [
    "East Khasi Hills (Shillong)", "West Garo Hills (Tura)", "Ri Bhoi",
    "West Khasi Hills", "East Jaintia Hills", "West Jaintia Hills", "North Garo Hills",
    "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "East Garo Hills"
  ],
  "Manipur": [
    "Imphal West", "Imphal East", "Thoubal", "Bishnupur", "Churachandpur",
    "Kakching", "Senapati", "Ukhrul", "Chandel", "Tamenglong", "Kangpokpi",
    "Tengnoupal", "Jiribam", "Kamjong", "Noney", "Pherzawl"
  ],
  "Nagaland": [
    "Kohima", "Dimapur", "Chümoukedima", "Mokokchung", "Tuensang", "Mon",
    "Wokha", "Zünheboto", "Phek", "Kiphire", "Longleng", "Peren", "Niuland",
    "Noklak", "Shamator", "Tseminyü"
  ],
  "Mizoram": [
    "Aizawl", "Lunglei", "Champhai", "Kolasib", "Serchhip", "Lawngtlai",
    "Mamit", "Saiha", "Hnahthial", "Khawzawl", "Saitual"
  ],
  "Arunachal Pradesh": [
    "Papum Pare (Itanagar)", "Tawang", "West Kameng", "East Kameng", "Lower Subansiri",
    "Upper Subansiri", "West Siang", "East Siang", "Upper Siang", "Changlang",
    "Tirap", "Lohit", "Namsai", "Dibang Valley", "Lower Dibang Valley", "Anjaw",
    "Kurung Kumey", "Kra Daadi", "Siang", "Lower Siang", "Kamle", "Pakke Kessang"
  ],
  "Sikkim": [
    "Gangtok", "Namchi", "Gyalshing", "Mangan", "Pakyong", "Soreng"
  ],
  "Puducherry": [
    "Puducherry", "Karaikal", "Mahe", "Yanam"
  ],
  "Andaman & Nicobar Islands": [
    "South Andaman", "North and Middle Andaman", "Nicobar"
  ],
  "Dadra & Nagar Haveli and Daman & Diu": [
    "Daman", "Diu", "Dadra and Nagar Haveli"
  ],
  "Lakshadweep": [
    "Lakshadweep"
  ],
};

/**
 * Returns list of districts for a given state name.
 * If state not found, returns empty list or fallback to Jharkhand.
 */
export function getDistrictsForState(stateName: string): string[] {
  if (!stateName) return STATE_DISTRICT_MAP["Jharkhand"];

  // Exact match
  if (STATE_DISTRICT_MAP[stateName]) {
    return STATE_DISTRICT_MAP[stateName];
  }

  // Case-insensitive match or partial match
  const lower = stateName.toLowerCase().trim();
  for (const [key, list] of Object.entries(STATE_DISTRICT_MAP)) {
    if (key.toLowerCase() === lower || key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) {
      return list;
    }
  }

  return STATE_DISTRICT_MAP["Jharkhand"];
}

/**
 * Returns default center coordinates for a given state.
 */
export function getStateCoordinates(stateName: string): StateCoordinates {
  if (!stateName) return STATE_COORDINATES["Jharkhand"];

  if (STATE_COORDINATES[stateName]) {
    return STATE_COORDINATES[stateName];
  }

  const lower = stateName.toLowerCase().trim();
  for (const [key, coords] of Object.entries(STATE_COORDINATES)) {
    if (key.toLowerCase() === lower || key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) {
      return coords;
    }
  }

  return STATE_COORDINATES["Jharkhand"];
}

/**
 * Normalizes any detected state string (e.g. from reverse geocoding)
 * to one of the canonical names in ALL_INDIAN_STATES.
 */
export function normalizeStateName(rawState: string): string {
  if (!rawState) return "Jharkhand";
  const lower = rawState.toLowerCase().trim();

  // Common aliases
  if (lower.includes("tamil") || lower.includes("madras")) return "Tamil Nadu";
  if (lower.includes("maharashtra") || lower.includes("bombay")) return "Maharashtra";
  if (lower.includes("karnataka") || lower.includes("mysore")) return "Karnataka";
  if (lower.includes("kerala")) return "Kerala";
  if (lower.includes("delhi")) return "Delhi";
  if (lower.includes("jharkhand")) return "Jharkhand";
  if (lower.includes("uttar pradesh") || lower.includes("up")) return "Uttar Pradesh";
  if (lower.includes("bihar")) return "Bihar";
  if (lower.includes("west bengal") || lower.includes("bengal")) return "West Bengal";
  if (lower.includes("andhra")) return "Andhra Pradesh";
  if (lower.includes("telangana")) return "Telangana";
  if (lower.includes("gujarat")) return "Gujarat";
  if (lower.includes("rajasthan")) return "Rajasthan";
  if (lower.includes("madhya pradesh") || lower.includes("mp")) return "Madhya Pradesh";
  if (lower.includes("odisha") || lower.includes("orissa")) return "Odisha";
  if (lower.includes("punjab")) return "Punjab";
  if (lower.includes("haryana")) return "Haryana";
  if (lower.includes("assam")) return "Assam";
  if (lower.includes("chhattisgarh")) return "Chhattisgarh";
  if (lower.includes("himachal")) return "Himachal Pradesh";
  if (lower.includes("uttarakhand") || lower.includes("uttaranchal")) return "Uttarakhand";
  if (lower.includes("goa")) return "Goa";
  if (lower.includes("jammu") || lower.includes("kashmir")) return "Jammu & Kashmir";
  if (lower.includes("ladakh")) return "Ladakh";
  if (lower.includes("chandigarh")) return "Chandigarh";
  if (lower.includes("puducherry") || lower.includes("pondicherry")) return "Puducherry";
  if (lower.includes("tripura")) return "Tripura";
  if (lower.includes("meghalaya")) return "Meghalaya";
  if (lower.includes("manipur")) return "Manipur";
  if (lower.includes("nagaland")) return "Nagaland";
  if (lower.includes("mizoram")) return "Mizoram";
  if (lower.includes("arunachal")) return "Arunachal Pradesh";
  if (lower.includes("sikkim")) return "Sikkim";

  for (const s of ALL_INDIAN_STATES) {
    if (s.toLowerCase() === lower || lower.includes(s.toLowerCase())) {
      return s;
    }
  }

  return rawState;
}

/**
 * Normalizes a district string against a state's district list.
 */
export function normalizeDistrictName(rawDistrict: string, stateName: string): string {
  if (!rawDistrict) return getDistrictsForState(stateName)[0] || "";
  const list = getDistrictsForState(stateName);
  const lower = rawDistrict.toLowerCase().replace(/\s*district\s*/i, "").trim();

  for (const d of list) {
    const dLower = d.toLowerCase();
    if (dLower === lower || dLower.includes(lower) || lower.includes(dLower)) {
      return d;
    }
  }

  return rawDistrict.replace(/\s*district\s*/i, "").trim();
}

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
