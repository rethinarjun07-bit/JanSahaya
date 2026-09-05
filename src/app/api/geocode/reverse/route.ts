import { NextRequest, NextResponse } from "next/server";
import {
  ALL_INDIAN_STATES,
  STATE_COORDINATES,
  getDistrictsForState,
  normalizeStateName,
  normalizeDistrictName,
} from "@/lib/data/india-districts";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const ipMode = searchParams.get("ip") === "true";

  let lat = latParam ? parseFloat(latParam) : null;
  let lng = lngParam ? parseFloat(lngParam) : null;

  // 1. IP Geolocation Fallback if lat/lng not provided or ipMode requested
  if ((lat === null || isNaN(lat) || lng === null || isNaN(lng)) && ipMode) {
    try {
      // Fetch public IP info from ip-api or ipapi.co
      const ipRes = await fetch("https://ipapi.co/json/", {
        headers: { "User-Agent": "JanSahaya-Disaster-Mitigation/1.0" },
        signal: AbortSignal.timeout(3500),
      });

      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData && ipData.latitude && ipData.longitude) {
          lat = Number(ipData.latitude);
          lng = Number(ipData.longitude);
          const state = normalizeStateName(ipData.region || ipData.region_code || "");
          const district = normalizeDistrictName(ipData.city || "", state);
          const pincode = ipData.postal || "";
          const address = `${ipData.city || district}, ${state}${pincode ? " - " + pincode : ""}`;

          return NextResponse.json({
            success: true,
            source: "ip",
            lat,
            lng,
            state,
            district,
            pincode,
            address,
            displayName: address,
          });
        }
      }
    } catch (err) {
      console.warn("IP Geolocation error:", err);
    }
  }

  // If still no valid lat/lng, fallback to default Jharkhand
  if (lat === null || isNaN(lat) || lng === null || isNaN(lng)) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing or invalid latitude/longitude parameters",
        state: "Jharkhand",
        district: "Ranchi",
        lat: 23.3441,
        lng: 85.3096,
        pincode: "834001",
        address: "Ranchi, Jharkhand",
      },
      { status: 400 }
    );
  }

  // 2. High-Precision Reverse Geocoding using OpenStreetMap Nominatim
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const geoRes = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "JanSahaya-Disaster-Mitigation-SIH26043/1.0 (contact: disaster-cell@jansahaya.gov.in)",
        "Accept-Language": "en",
      },
      signal: AbortSignal.timeout(4000),
    });

    if (geoRes.ok) {
      const data = await geoRes.json();
      if (data && data.address) {
        const rawState = data.address.state || data.address.province || data.address.territory || "";
        const state = normalizeStateName(rawState);

        const rawDistrict =
          data.address.county ||
          data.address.state_district ||
          data.address.city_district ||
          data.address.district ||
          data.address.city ||
          data.address.town ||
          data.address.municipality ||
          "";

        const district = normalizeDistrictName(rawDistrict, state);
        const pincode = data.address.postcode || "";

        // Build clean human-friendly address string
        const parts: string[] = [];
        if (data.address.amenity) parts.push(data.address.amenity);
        if (data.address.road) parts.push(data.address.road);
        if (data.address.suburb && !parts.includes(data.address.suburb)) parts.push(data.address.suburb);
        if (data.address.neighbourhood && !parts.includes(data.address.neighbourhood)) parts.push(data.address.neighbourhood);
        if (data.address.city && !parts.includes(data.address.city)) parts.push(data.address.city);
        else if (district && !parts.includes(district)) parts.push(district);

        if (state && !parts.includes(state)) parts.push(state);
        if (pincode) parts.push(pincode);

        const cleanAddress = parts.join(", ") || data.display_name;

        return NextResponse.json({
          success: true,
          source: "nominatim",
          lat,
          lng,
          state,
          district,
          pincode,
          address: cleanAddress,
          displayName: data.display_name,
        });
      }
    }
  } catch (err) {
    console.warn("Nominatim reverse geocode warning:", err);
  }

  // 3. Fallback: Mathematical Nearest State & District calculation based on coordinates
  let bestState = "Jharkhand";
  let minStateDist = Infinity;

  for (const [sName, sCoords] of Object.entries(STATE_COORDINATES)) {
    const d = Math.hypot(sCoords.lat - lat, sCoords.lng - lng);
    if (d < minStateDist) {
      minStateDist = d;
      bestState = sName;
    }
  }

  const districts = getDistrictsForState(bestState);
  const defaultDistrict = districts[0] || "Headquarters";

  return NextResponse.json({
    success: true,
    source: "centroid-fallback",
    lat,
    lng,
    state: bestState,
    district: defaultDistrict,
    pincode: "",
    address: `Location near ${defaultDistrict}, ${bestState} (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    displayName: `${defaultDistrict}, ${bestState}`,
  });
}
