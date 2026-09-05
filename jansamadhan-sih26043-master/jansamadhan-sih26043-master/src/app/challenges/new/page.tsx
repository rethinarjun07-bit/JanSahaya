"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Mic,
  MapPin,
  Sparkles,
  Upload,
  AlertTriangle,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Navigation,
  Camera,
  Video,
  Music,
  Trash2,
  Plus,
  Play,
  Square,
  Volume2,
  Layers,
  FileVideo,
  Image as ImageIcon,
  Check,
  Flame,
  Radio,
  Loader2,
} from "lucide-react";
import {
  CATEGORIES,
  ALL_INDIAN_STATES,
  getDistrictsForState,
  getStateCoordinates,
  normalizeStateName,
  normalizeDistrictName,
} from "@/lib/data/india-districts";
import { VoiceInputModal } from "@/components/voice-input-modal";
import { useLanguage } from "@/components/language-provider";
import { DuplicateAlert } from "@/components/duplicate-alert";
import { DuplicateWarningModal } from "@/components/duplicate-warning-modal";
import { DuplicateCandidate } from "@/lib/nlp/tfidf";
import { classifyChallenge } from "@/lib/nlp/classifier";
import { triggerConfetti } from "@/components/celebration-effects";
import { sound } from "@/lib/sound";
import type { LeafletMapProps } from "@/components/leaflet-map";

const LeafletMap = dynamic<LeafletMapProps>(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[360px] bg-slate-100 rounded-2xl flex flex-col items-center justify-center animate-pulse text-slate-400 font-semibold text-xs border border-slate-200 gap-2">
      <Layers className="w-6 h-6 text-gov-navy animate-bounce" />
      <span>Loading JanSahaya Interactive GIS Map Engine...</span>
    </div>
  ),
});

// Sample field evidence presets for instant 1-click test fill
const SAMPLE_DISASTER_PHOTOS = [
  {
    name: "Submerged Roadway & Choked Culvert",
    url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80",
    badge: "Flood",
  },
  {
    name: "Hill Slope Fracture & Road Landslide",
    url: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&auto=format&fit=crop&q=80",
    badge: "Landslide",
  },
  {
    name: "Mining Subsidence & Asphalt Collapse",
    url: "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&auto=format&fit=crop&q=80",
    badge: "Subsidence",
  },
];

const SAMPLE_DRONE_VIDEO = {
  name: "Govt UAV Emergency Corridor Sweep (.mp4)",
  url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
};

const SAMPLE_AUDIO_MEMO = {
  name: "Citizen SOS Distress Voice Dispatch (.mp3)",
  url: "https://actions.google.com/sounds/v1/water/rain_heavy.ogg",
};

export default function NewChallengePage() {
  const router = useRouter();
  const { t, language } = useLanguage();

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Disaster Management");
  const [state, setState] = useState("Jharkhand");
  const [district, setDistrict] = useState("Ranchi");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(23.3441);
  const [longitude, setLongitude] = useState(85.3096);
  const [pincode, setPincode] = useState("834001");

  // Multimedia States
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [voiceTranscript, setVoiceTranscript] = useState<string>("");
  const [recordingAudio, setRecordingAudio] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Wizard state (4 steps)
  const [step, setStep] = useState(1);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [duplicateCandidates, setDuplicateCandidates] = useState<DuplicateCandidate[]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [bypassedWarning, setBypassedWarning] = useState(false);
  const [isSupportingExisting, setIsSupportingExisting] = useState(false);

  // Audio timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recordingAudio) {
      interval = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recordingAudio]);

  const handleSupportExisting = async (challengeId: string) => {
    setIsSupportingExisting(true);
    try {
      await fetch(`/api/challenges/${challengeId}/upvote`, { method: "POST" });
      sound.playCelebration();
      triggerConfetti();
      router.push(`/challenges/${challengeId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSupportingExisting(false);
    }
  };

  const handleSubmitAnywayFromModal = () => {
    setBypassedWarning(true);
    setWarningModalOpen(false);
    setStep(2);
    sound.playClick();
  };

  // Location Detection & Feedback States
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [locationDetectedNotice, setLocationDetectedNotice] = useState<string | null>(null);

  // Dynamic district list based on currently selected State
  const availableDistricts = useMemo(() => {
    return getDistrictsForState(state);
  }, [state]);

  // When user selects a new State
  const handleStateChange = (newState: string) => {
    setState(newState);
    const districts = getDistrictsForState(newState);
    const defaultDistrict = districts[0] || "";
    setDistrict(defaultDistrict);

    const coords = getStateCoordinates(newState);
    setLatitude(coords.lat);
    setLongitude(coords.lng);
    setAddress(`${defaultDistrict}, ${newState}`);
    sound.playClick();
  };

  // When user selects a new District
  const handleDistrictChange = (distName: string) => {
    setDistrict(distName);
    setAddress(`${distName}, ${state}`);
    sound.playClick();
  };

  // Helper to populate form fields from reverse geocoding result
  const applyGeocodedData = (data: {
    lat: number;
    lng: number;
    state: string;
    district: string;
    pincode?: string;
    address: string;
  }) => {
    const rawLat = Number(data.lat);
    const rawLng = Number(data.lng);
    const lat = Number.isFinite(rawLat) ? Number(rawLat.toFixed(4)) : 23.3441;
    const lng = Number.isFinite(rawLng) ? Number(rawLng.toFixed(4)) : 85.3096;
    setLatitude(lat);
    setLongitude(lng);

    if (data.state) {
      setState(data.state);
    }
    if (data.district) {
      setDistrict(data.district);
    }
    if (data.pincode) {
      setPincode(data.pincode);
    }
    if (data.address) {
      setAddress(data.address);
    }

    const label = `${data.district || "District"}, ${data.state || "State"}${data.pincode ? ` (${data.pincode})` : ""}`;
    setLocationDetectedNotice(`✅ Location Found: ${label}`);
    sound.playCelebration();
    triggerConfetti();
    setTimeout(() => setLocationDetectedNotice(null), 8000);
  };

  // Map Click to drop pin & reverse geocode
  const handleMapLocationSelect = async (coords: { lat: number; lng: number }) => {
    sound.playClick();
    const rawLat = Number(coords?.lat);
    const rawLng = Number(coords?.lng);
    const lat = Number.isFinite(rawLat) ? Number(rawLat.toFixed(4)) : 23.3441;
    const lng = Number.isFinite(rawLng) ? Number(rawLng.toFixed(4)) : 85.3096;

    setLatitude(lat);
    setLongitude(lng);
    setIsReverseGeocoding(true);

    try {
      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          applyGeocodedData(data);
          return;
        }
      }
    } catch (err) {
      console.warn("Map reverse geocode failed:", err);
    } finally {
      setIsReverseGeocoding(false);
    }

    setAddress(`Geotag Coordinate (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
  };

  // Real-time Debounced Duplicate Check
  useEffect(() => {
    if (!title || title.trim().length < 6) {
      setDuplicateCandidates([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingDuplicates(true);
      try {
        const res = await fetch("/api/duplicate-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            district,
            category,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setDuplicateCandidates(data.candidates || []);
          if (data.candidates && data.candidates.length > 0 && data.candidates[0].similarityPercentage > 75) {
            sound.playAlert();
          }
        }
      } catch (err) {
        console.error("Duplicate check error:", err);
      } finally {
        setIsCheckingDuplicates(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [title, description, district, category]);

  // Live NLP classification preview
  const liveClassification = classifyChallenge(title, description);

  const [voiceLanguage, setVoiceLanguage] = useState<string>("en");

  const handleVoiceTranscript = (transcript: string, language?: string) => {
    if (language) setVoiceLanguage(language);
    setVoiceTranscript((prev) => (prev ? `${prev}\n${transcript}` : transcript));
    setDescription((prev) => (prev ? `${prev}\n${transcript}` : transcript));
    if (!title) {
      if (language === "ur") {
        setTitle("عوامی مسئلہ: اراضی کا دھنسنا اور نکاسی کا بحران");
      } else if (language === "hi") {
        setTitle("जनसमस्या: जलभराव एवं नाला अवरोध रिपोर्ट");
      }
    }
  };

  // Auto-Detect GPS & Fill Form Correctly
  const handleDetectGPS = async () => {
    sound.playClick();
    setIsDetectingLocation(true);
    setLocationDetectedNotice(null);

    const getPosition = (highAccuracy: boolean, timeoutMs: number): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          return reject(new Error("Geolocation is not supported by your browser"));
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: highAccuracy,
          timeout: timeoutMs,
          maximumAge: 60000,
        });
      });
    };

    let detectedCoords: { lat: number; lng: number } | null = null;

    try {
      // 1. Try High Accuracy (GPS hardware) with 5s timeout
      const pos = await getPosition(true, 5000);
      detectedCoords = {
        lat: Number(pos.coords.latitude.toFixed(4)),
        lng: Number(pos.coords.longitude.toFixed(4)),
      };
    } catch {
      try {
        // 2. Fallback to standard accuracy (Wi-Fi/cellular triangulation, fast on desktop/laptop)
        const pos = await getPosition(false, 6000);
        detectedCoords = {
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4)),
        };
      } catch {
        console.warn("Browser GPS unavailable or timed out; falling back to IP geolocation...");
      }
    }

    try {
      // 3. Resolve location details via /api/geocode/reverse
      const url = detectedCoords
        ? `/api/geocode/reverse?lat=${detectedCoords.lat}&lng=${detectedCoords.lng}`
        : `/api/geocode/reverse?ip=true`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          applyGeocodedData(data);
          return;
        }
      }
      throw new Error("Location service unavailable");
    } catch (err) {
      console.error("Auto location detection error:", err);
      if (detectedCoords) {
        setLatitude(detectedCoords.lat);
        setLongitude(detectedCoords.lng);
        setAddress(`Captured GPS Position (${detectedCoords.lat}, ${detectedCoords.lng})`);
        setLocationDetectedNotice(`📍 Coordinates Captured: (${detectedCoords.lat}, ${detectedCoords.lng})`);
      } else {
        alert("Could not automatically retrieve your location. Please choose your State and District from the dropdown or click on the map.");
      }
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Photo handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    sound.playClick();

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    sound.playClick();
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSamplePhoto = (url: string) => {
    sound.playClick();
    if (!photos.includes(url)) {
      setPhotos((prev) => [...prev, url]);
    }
  };

  // Video handlers
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    sound.playClick();
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setVideoUrl(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Audio recording handlers
  const startAudioRecording = async () => {
    sound.playClick();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setAudioUrl(reader.result as string);
          sound.playCelebration();
        };
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecordingAudio(true);
      setRecordingTime(0);
    } catch (err) {
      console.error("Mic error:", err);
      alert("Microphone permission was denied or is not supported. You can upload an audio memo file instead.");
    }
  };

  const stopAudioRecording = () => {
    sound.playClick();
    if (mediaRecorderRef.current && recordingAudio) {
      mediaRecorderRef.current.stop();
      setRecordingAudio(false);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    sound.playClick();
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setAudioUrl(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setSubmitting(true);
    setError("");

    if (!title.trim() || title.trim().length < 3) {
      setError("Title must be at least 3 characters long.");
      sound.playAlert();
      setSubmitting(false);
      setStep(1);
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setError("Description must be at least 10 characters long.");
      sound.playAlert();
      setSubmitting(false);
      setStep(1);
      return;
    }

    const resolvedAddress = address.trim() || `${district}, ${state}`;

    try {
      const combinedMediaUrls = [...photos, ...(videoUrl ? [videoUrl] : [])];

      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category: category || liveClassification.predictedCategory,
          severity: liveClassification.severity,
          latitude: Number(latitude) || 23.3441,
          longitude: Number(longitude) || 85.3096,
          address: resolvedAddress,
          district: district.trim() || "Ranchi",
          state: state.trim() || "Jharkhand",
          pincode: pincode ? pincode.trim() : null,
          mediaUrls: combinedMediaUrls,
          audioUrl: audioUrl || null,
          voiceTranscript: voiceTranscript || null,
          aiTags: liveClassification.tags,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        let errorMsg = data.error || "Failed to register challenge";
        if (data.details?.fieldErrors) {
          const fieldMsgs = Object.entries(data.details.fieldErrors)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
            .join("; ");
          if (fieldMsgs) {
            errorMsg = `Validation failed - ${fieldMsgs}`;
          }
        }
        throw new Error(errorMsg);
      }

      triggerConfetti();
      router.push(`/challenges/${data.challenge.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error submitting challenge");
      sound.playAlert();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/challenges"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-gov-navy transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
          </Link>
          <span className="text-xs font-bold text-slate-400">Step {step} of 4</span>
        </div>

        {/* Wizard Progress Bar */}
        <div className="w-full h-2 bg-slate-200 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gov-navy via-gov-navyLight to-gov-saffron transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
          <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gov-saffron bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                  Citizen & Field Ground Intake
                </span>
                <span className="text-xs font-semibold text-slate-400">&bull;</span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Disaster Mitigation Cell (SIH26043)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
                {t("newChallengeHeading")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t("newChallengeSubheading")}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className={`px-3 py-1.5 rounded-xl font-bold transition-all ${step === 1 ? "bg-gov-navy text-white shadow-sm" : "bg-slate-100 text-slate-600"}`}>
                {t("wizardStep1")}
              </span>
              <span className={`px-3 py-1.5 rounded-xl font-bold transition-all ${step === 2 ? "bg-gov-navy text-white shadow-sm" : "bg-slate-100 text-slate-600"}`}>
                {t("wizardStep2")}
              </span>
              <span className={`px-3 py-1.5 rounded-xl font-bold transition-all ${step === 3 ? "bg-gov-navy text-white shadow-sm" : "bg-slate-100 text-slate-600"}`}>
                {t("wizardStep3")}
              </span>
              <span className={`px-3 py-1.5 rounded-xl font-bold transition-all ${step === 4 ? "bg-gov-navy text-white shadow-sm" : "bg-slate-100 text-slate-600"}`}>
                {t("wizardStep4")}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold mb-6">
              {error}
            </div>
          )}

          {/* Real-time duplicate alert banner */}
          <DuplicateAlert candidates={duplicateCandidates} />

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: Basic Information & Voice Dictation */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{t("problemTitleLabel")}</span>
                      <span className="text-red-500 font-bold">*</span>
                    </label>
                    {isCheckingDuplicates && (
                      <span className="text-[11px] text-amber-600 animate-pulse font-medium">
                        Running TF-IDF duplicate scan...
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("problemTitlePlaceholder")}
                    className="w-full text-xs sm:text-sm p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none placeholder:text-slate-400 font-medium"
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Be specific with landmarks, nature of damage, and affected areas.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{t("problemDescLabel")}</span>
                      <span className="text-red-500 font-bold">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setVoiceModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-100 text-gov-saffron hover:bg-orange-200 text-xs font-bold transition-colors shadow-xs active:scale-95"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{t("voiceDictate")} (EN / हिन्दी / اردو)</span>
                    </button>
                  </div>
                  <textarea
                    required
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("problemDescPlaceholder")}
                    className="w-full text-xs sm:text-sm p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none resize-none placeholder:text-slate-400 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                    {t("sectorLabel")}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none bg-white text-slate-800 font-medium"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* STEP 2: Interactive GIS Map & Geotag Location */}
            {step === 2 && (
              <div className="space-y-4">
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="font-bold text-blue-950">Interactive GIS Map Pinning & Auto-Detect</div>
                    <div className="text-slate-600 text-[11px]">
                      Click anywhere on the map or tap Auto-Detect to automatically populate State, District, and Landmark.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isDetectingLocation}
                  onClick={handleDetectGPS}
                  className="px-3.5 py-2 bg-gov-navy hover:bg-gov-navyLight disabled:bg-slate-400 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
                >
                  {isDetectingLocation ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      <span>Detecting Location...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t("gpsAutoDetect")}</span>
                    </>
                  )}
                </button>
              </div>

              {locationDetectedNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{locationDetectedNotice}</span>
                </div>
              )}

              {isReverseGeocoding && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-medium flex items-center gap-2 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600 shrink-0" />
                  <span>Pin dropped! Fetching place address, district and state...</span>
                </div>
              )}

              {/* Embedded Interactive Leaflet Map */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                <LeafletMap
                  challenges={[]}
                  selectedLocation={
                    Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))
                      ? { lat: Number(latitude), lng: Number(longitude) }
                      : { lat: 23.3441, lng: 85.3096 }
                  }
                  onLocationSelect={handleMapLocationSelect}
                  interactiveSelect={true}
                  center={[
                    Number.isFinite(Number(latitude)) ? Number(latitude) : 23.3441,
                    Number.isFinite(Number(longitude)) ? Number(longitude) : 85.3096,
                  ]}
                  zoom={10}
                  height="380px"
                  showAdvancedTools={false}
                />
              </div>

              {/* Location Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                  <select
                    value={state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none bg-white text-slate-800 font-medium"
                  >
                    {ALL_INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    District ({availableDistricts.length} in {state})
                  </label>
                  <select
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none bg-white text-slate-800 font-medium"
                  >
                    {availableDistricts.map((d) => (
                      <option key={d} value={d}>
                        {d} ({state})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specific Location / Landmark
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={
                    state === "Tamil Nadu"
                      ? "e.g., Near Marina Beach, Anna Salai, Chennai"
                      : `e.g., Landmark or Street in ${district}, ${state}`
                  }
                  className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={Number.isFinite(latitude) ? latitude : ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setLatitude(Number.isFinite(val) ? val : 23.3441);
                    }}
                    className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={Number.isFinite(longitude) ? longitude : ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setLongitude(Number.isFinite(val) ? val : 85.3096);
                    }}
                    className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={pincode || ""}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="834001"
                    className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
            )}

            {/* STEP 3: Multimedia Disaster Evidence (Photos, Video, Audio) */}
            {step === 3 && (
              <div className="space-y-6">
                {/* 1. PHOTO EVIDENCE SECTION */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-orange-100 text-gov-saffron">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Photo Evidence Gallery ({photos.length})
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Upload high-resolution field photos or select sample incident captures.
                        </p>
                      </div>
                    </div>

                    <label className="cursor-pointer px-3.5 py-1.5 bg-gov-navy hover:bg-gov-navyLight text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photos</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* 1-Click Sample Photo Presets */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-600 block mb-2">
                      1-Click Sample Disaster Photos (For rapid demonstration):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {SAMPLE_DISASTER_PHOTOS.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddSamplePhoto(sample.url)}
                          className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                            photos.includes(sample.url)
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span>{sample.name}</span>
                          {photos.includes(sample.url) ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Plus className="w-3 h-3 text-slate-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Photos Grid Preview */}
                  {photos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {photos.map((photo, index) => (
                        <div
                          key={index}
                          className="group relative rounded-xl overflow-hidden border border-slate-200 shadow-sm aspect-video bg-black/5"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                            <span className="text-[10px] text-white font-mono font-bold">
                              Photo #{index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(index)}
                              className="p-1 rounded-lg bg-red-600/90 hover:bg-red-700 text-white transition-colors"
                              title="Delete photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white font-mono">
                            #{index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                      <span>No photos attached yet. Click &ldquo;Upload Photos&rdquo; or pick a sample above.</span>
                    </div>
                  )}
                </div>

                {/* 2. VIDEO EVIDENCE SECTION */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Video Evidence (Drone / Mobile Sweep)
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Attach an on-site video capture (.mp4, .webm) or link to aerial survey footage.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setVideoUrl(SAMPLE_DRONE_VIDEO.url);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-all"
                      >
                        + 1-Click Drone Video
                      </button>

                      <label className="cursor-pointer px-3.5 py-1.5 bg-gov-navy hover:bg-gov-navyLight text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Video</span>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Video URL Input */}
                  <div>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="Or paste video link: https://.../incident.mp4"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-gov-navy focus:outline-none font-mono"
                    />
                  </div>

                  {/* Live HTML5 Video Player Preview */}
                  {videoUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-black shadow-md">
                      <video
                        src={videoUrl}
                        controls
                        className="w-full max-h-[300px] object-contain bg-black"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setVideoUrl("");
                        }}
                        className="absolute top-3 right-3 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Video</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
                      <FileVideo className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                      <span>No video attached. Upload or click &ldquo;+ 1-Click Drone Video&rdquo; to preview.</span>
                    </div>
                  )}
                </div>

                {/* 3. AUDIO / VOICE MEMO SECTION */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                        <Music className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Voice Audio Memo & Distress Recording
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Record live emergency audio from your microphone or upload a voice dispatch.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setAudioUrl(SAMPLE_AUDIO_MEMO.url);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all"
                      >
                        + 1-Click Voice Memo
                      </button>

                      <label className="cursor-pointer px-3.5 py-1.5 bg-gov-navy hover:bg-gov-navyLight text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Audio</span>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Mic Recording Controls */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      {recordingAudio ? (
                        <div className="relative flex items-center justify-center">
                          <span className="w-4 h-4 rounded-full bg-red-600 animate-ping absolute" />
                          <span className="w-3.5 h-3.5 rounded-full bg-red-600 relative" />
                        </div>
                      ) : (
                        <Mic className="w-5 h-5 text-slate-400" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          {recordingAudio ? "Recording live incident dispatch..." : "Microphone Audio Recorder"}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {recordingAudio
                            ? `00:${recordingTime < 10 ? `0${recordingTime}` : recordingTime} / 01:00`
                            : "Click record to capture live ground voice testimony"}
                        </div>
                      </div>
                    </div>

                    {recordingAudio ? (
                      <button
                        type="button"
                        onClick={stopAudioRecording}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop Recording</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startAudioRecording}
                        className="px-4 py-2 bg-gov-saffron hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Start Recording</span>
                      </button>
                    )}
                  </div>

                  {/* Live HTML5 Audio Player Preview */}
                  {audioUrl ? (
                    <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3 flex-1 min-w-[260px]">
                        <Volume2 className="w-5 h-5 text-emerald-700 shrink-0" />
                        <audio src={audioUrl} controls className="w-full h-10" />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setAudioUrl("");
                        }}
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Audio</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* STEP 4: AI Classification & Final Verification */}
            {step === 4 && (
              <div className="space-y-5">
                {/* AI Problem Segregation Insight Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-gov-navy text-white shadow-md">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> AI Problem Segregation & Triage Preview
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-slate-200">
                      NLP Model: Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                      <span className="block text-[10px] text-slate-400 uppercase">Severity</span>
                      <span className="font-bold text-amber-300 text-sm">
                        {liveClassification.severity}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                      <span className="block text-[10px] text-slate-400 uppercase">Urgency Score</span>
                      <span className="font-bold text-white text-sm">
                        {liveClassification.urgencyScore} / 100
                      </span>
                    </div>

                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 col-span-2">
                      <span className="block text-[10px] text-slate-400 uppercase">Target Institute</span>
                      <span className="font-bold text-blue-200 text-xs line-clamp-1">
                        {liveClassification.recommendedUniversity.name}
                      </span>
                    </div>
                  </div>

                  {liveClassification.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10 text-[11px]">
                      <span className="text-slate-400 mr-1">Auto-Detected Tags:</span>
                      {liveClassification.tags.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-white/10 text-amber-200 font-medium">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary Check */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5">
                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Title:</span>
                    <span className="font-bold text-slate-900 text-right max-w-xs">{title}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Jurisdiction:</span>
                    <span className="font-bold text-slate-800">{district}, {state}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">GPS Coordinates:</span>
                    <span className="font-mono text-slate-700">{latitude}, {longitude}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500 font-medium">Media Attached:</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-bold">
                        📷 {photos.length} Photo{photos.length !== 1 ? "s" : ""}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-bold ${videoUrl ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-500"}`}>
                        🎥 {videoUrl ? "Video Attached" : "No Video"}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-bold ${audioUrl ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-500"}`}>
                        🎙️ {audioUrl ? "Audio Memo" : "No Audio"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation / Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setStep(step - 1);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  &larr; Previous Step
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 1) {
                      if (!title.trim() || !description.trim()) {
                        setError("Please provide a title and detailed description before proceeding.");
                        sound.playAlert();
                        return;
                      }
                      if (title.trim().length < 3) {
                        setError("Title must be at least 3 characters long.");
                        sound.playAlert();
                        return;
                      }
                      if (description.trim().length < 10) {
                        setError("Description must be at least 10 characters long.");
                        sound.playAlert();
                        return;
                      }
                      if (
                        duplicateCandidates.length > 0 &&
                        duplicateCandidates[0].similarityPercentage >= 70 &&
                        !bypassedWarning
                      ) {
                        setWarningModalOpen(true);
                        sound.playAlert();
                        return;
                      }
                    }
                    if (step === 2) {
                      if (!address.trim()) {
                        setAddress(`${district}, ${state}`);
                      }
                    }
                    setError("");
                    sound.playClick();
                    setStep(step + 1);
                  }}
                  className="py-2.5 px-6 rounded-xl bg-gov-navy hover:bg-gov-navyLight text-white text-xs font-bold shadow transition-all flex items-center gap-1.5"
                >
                  <span>
                    {step === 1
                      ? "Proceed to GIS Map"
                      : step === 2
                      ? "Proceed to Media Evidence"
                      : "Proceed to AI Triage"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-3 px-8 rounded-xl bg-gradient-to-r from-gov-saffron to-amber-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2 transform active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? "..." : t("submitToGovtBtn")}</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Voice Dictation Modal */}
      <VoiceInputModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onTranscriptReady={handleVoiceTranscript}
      />

      {/* Enhanced Side-by-Side Duplicate Warning Modal */}
      <DuplicateWarningModal
        isOpen={warningModalOpen}
        onClose={() => setWarningModalOpen(false)}
        matches={duplicateCandidates.map((c) => ({
          id: c.id,
          title: c.title,
          description: `Existing verified ground challenge registered in ${c.district} under ${c.category}. Triage match confidence: ${c.confidence}.`,
          category: c.category,
          district: c.district,
          similarity: c.similarityPercentage / 100,
          sharedKeywords: c.matchingKeywords,
        }))}
        newTitle={title}
        newDescription={description}
        newCategory={category}
        newDistrict={district}
        onSupportExisting={handleSupportExisting}
        onSubmitAnyway={handleSubmitAnywayFromModal}
        isSupporting={isSupportingExisting}
      />
    </div>
  );
}
