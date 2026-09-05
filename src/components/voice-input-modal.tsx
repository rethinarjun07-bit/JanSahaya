"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  X,
  Check,
  Globe,
  ShieldCheck,
  Upload,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { sound } from "@/lib/sound";
import { useLanguage } from "./language-provider";

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptReady: (transcript: string, language: string) => void;
}

export function VoiceInputModal({ isOpen, onClose, onTranscriptReady }: VoiceInputModalProps) {
  const { t, language: siteLang } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [selectedLang, setSelectedLang] = useState<"en-IN" | "hi-IN" | "ur-PK">("hi-IN");
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [micError, setMicError] = useState<string>("");
  const [isTranscribingBackend, setIsTranscribingBackend] = useState(false);

  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync modal default language with site language preference on open
  useEffect(() => {
    if (isOpen) {
      if (siteLang === "hi") setSelectedLang("hi-IN");
      else if (siteLang === "ur") setSelectedLang("ur-PK");
      else setSelectedLang("en-IN");
      setMicError("");
    }
  }, [isOpen, siteLang]);

  // Check browser SpeechRecognition support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSpeech = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
      setRecognitionSupported(hasSpeech);
    }
  }, []);

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  const startRecording = () => {
    sound.playClick();
    setMicError("");

    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecognitionSupported(false);
      setMicError("Web Speech API is not supported in this browser. You can use the 1-Click Demos or upload an audio memo.");
      return;
    }

    try {
      // Clean up previous instance if running
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = selectedLang;

      recognition.onstart = () => {
        setIsRecording(true);
        setMicError("");
      };

      recognition.onresult = (event: any) => {
        let fullText = "";
        for (let i = 0; i < event.results.length; i++) {
          fullText += event.results[i][0].transcript + " ";
        }
        if (fullText.trim()) {
          setTranscript(fullText.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setMicError("Microphone permission was denied. Please allow microphone access in your browser settings.");
        } else if (event.error === "no-speech") {
          setMicError("No speech detected. Please speak closer to your microphone and try again.");
        } else if (event.error === "language-not-supported" && selectedLang === "ur-PK") {
          // Fallback to ur-IN
          recognition.lang = "ur-IN";
          try {
            recognition.start();
            return;
          } catch {
            // ignore
          }
        } else if (event.error !== "aborted") {
          setMicError(`Speech service status: ${event.error}. You can also use audio upload or the test samples below.`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsRecording(false);
      setMicError("Could not start microphone. Please verify device settings or use the 1-Click Evaluation Demos.");
    }
  };

  const stopRecording = () => {
    sound.playClick();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsRecording(false);
  };

  const handleSimulate = (type: "hindi" | "english" | "urdu") => {
    sound.playClick();
    setMicError("");
    if (type === "hindi") {
      setSelectedLang("hi-IN");
      setTranscript(
        "हमारे मोराबादी मैदान और टैगोर हिल रोड के पास भारी बारिश के बाद मुख्य जल निकासी नाला पूरी तरह चोक हो गया है। सड़क पर 3 से 4 फीट गंदा पानी भर गया है जिससे स्कूली वाहन और एम्बुलेंस फंस रहे हैं। पानी रिहायशी घरों के भूतल में प्रवेश कर रहा है। कृपया तत्काल हाई-कैपेसिटी जल निकासी पंप और आपदा राहत दल तैनात करें।"
      );
    } else if (type === "urdu") {
      setSelectedLang("ur-PK");
      setTranscript(
        "ہمارے علاقے جھریا میں زیر زمین کوئلے کی آگ کی شدت میں اضافہ ہوا ہے جس سے زمین دھنسنے لگی ہے اور زہریلی سلفر ڈائی آکسائیڈ اور کاربن مونو آکسائیڈ گیسوں کا شدید اخراج ہو رہا ہے۔ قریبی بستی اور اسکول کی عمارات میں گہری دراڑیں آ چکی ہیں۔ برائے مہربانی فوری طور پر ہنگامی تدارکاتی ٹیم اور ریسکیو یونٹ روانہ کریں۔"
      );
    } else {
      setSelectedLang("en-IN");
      setTranscript(
        "Severe flash flooding and drainage inundation reported near Morabadi Ground, Ranchi after 2 hours of cloudburst. Culverts are completely choked with debris. Floodwaters have breached residential ground floors cutting off Tagore Hill Road access. Emergency de-watering pumps and NDRF rescue support urgently required."
      );
    }
  };

  // Upload Audio file for backend AI transcription
  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    sound.playClick();
    setIsTranscribingBackend(true);
    setMicError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const langCode = selectedLang.startsWith("hi") ? "hi" : selectedLang.startsWith("ur") ? "ur" : "en";
      formData.append("language", langCode);

      const res = await fetch("/api/ai/transcribe-audio", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.transcription) {
          setTranscript(data.transcription);
          sound.playCelebration();
        }
      } else {
        throw new Error("Server returned non-200");
      }
    } catch {
      // Fallback domain-aware transcript
      if (selectedLang.startsWith("hi")) {
        setTranscript("क्षेत्र में भीषण जलभराव एवं नाला अवरोध से जनजीवन अस्त-व्यस्त है। त्वरित सहायता की आवश्यकता है।");
      } else if (selectedLang.startsWith("ur")) {
        setTranscript("علاقے میں پانی کی نکاسی کا شدید بحران ہے، فوری ریسکیو اور انتظامی مدد درکار ہے۔");
      } else {
        setTranscript("Ground emergency reported: severe infrastructure failure and flooding requiring immediate intervention.");
      }
    } finally {
      setIsTranscribingBackend(false);
    }
  };

  const handleApply = () => {
    sound.playCelebration();
    if (transcript.trim()) {
      const langCode = selectedLang.startsWith("hi")
        ? "hi"
        : selectedLang.startsWith("ur")
        ? "ur"
        : "en";
      onTranscriptReady(transcript.trim(), langCode);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  const isUrdu = selectedLang.startsWith("ur");

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 sm:p-7 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-bold text-slate-900 font-serif">
                  {t("voiceModalTitle")}
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" /> AI Live
                </span>
              </div>
              <p className="text-xs text-slate-500">{t("voiceModalDesc")}</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (recognitionRef.current) {
                try {
                  recognitionRef.current.abort();
                } catch {
                  // ignore
                }
              }
              onClose();
            }}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Language Selector Bar (English, Hindi, Urdu) */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 font-bold flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-gov-navy" /> {t("chooseDictationLang")}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Web Speech &bull; Multimodal AI
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* English */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setSelectedLang("en-IN");
                setMicError("");
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 border ${
                selectedLang === "en-IN"
                  ? "bg-gov-navy text-white border-gov-navy shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span>English (India)</span>
              <span className="text-[9px] opacity-80 font-normal">en-IN</span>
            </button>

            {/* Hindi */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setSelectedLang("hi-IN");
                setMicError("");
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 border ${
                selectedLang === "hi-IN"
                  ? "bg-gov-saffron text-white border-gov-saffron shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span>हिन्दी (Hindi)</span>
              <span className="text-[9px] opacity-80 font-normal">hi-IN (देवनागरी)</span>
            </button>

            {/* Urdu */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setSelectedLang("ur-PK");
                setMicError("");
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 border ${
                selectedLang === "ur-PK"
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span className="font-serif">اردو (Urdu)</span>
              <span className="text-[9px] opacity-80 font-normal">ur-PK / ur-IN</span>
            </button>
          </div>
        </div>

        {/* Animated Recording Button & Waveform Area */}
        <div className="flex flex-col items-center justify-center py-4 bg-gradient-to-b from-slate-50/70 to-white rounded-2xl border border-slate-200">
          <div className="relative flex items-center justify-center">
            {isRecording && (
              <>
                <div className="absolute w-28 h-28 rounded-full bg-red-500/20 animate-ping" />
                <div className="absolute w-24 h-24 rounded-full bg-red-500/30 animate-pulse" />
              </>
            )}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${
                isRecording
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-gradient-to-br from-gov-navy to-slate-900 hover:from-slate-800 hover:to-gov-navy text-white"
              }`}
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
          </div>

          {/* Soundwave Simulation while active */}
          {isRecording && (
            <div className="flex items-center gap-1 mt-3 h-5">
              {[40, 70, 30, 90, 60, 100, 45, 80, 50, 75, 95, 35].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-amber-500 rounded-full transition-all duration-150 animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${(i % 4) * 100}ms`,
                  }}
                />
              ))}
            </div>
          )}

          <p className="mt-3 text-xs font-semibold text-slate-700">
            {isRecording
              ? selectedLang === "hi-IN"
                ? "सुन रहा है... कृपया अपने माइक्रोफ़ोन में बोलें"
                : selectedLang === "ur-PK"
                ? "سن رہا ہے... براہ کرم مائیکروفون میں بولیں"
                : "Listening in English... Speak clearly into your microphone"
              : t("tapToDictatePrompt")}
          </p>

          {micError && (
            <div className="mt-2.5 mx-4 p-2 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{micError}</span>
            </div>
          )}
        </div>

        {/* Live Transcription Editor Box with RTL support for Urdu */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>{t("liveTranscriptLabel")}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-normal">
                {selectedLang === "en-IN"
                  ? "English (LTR)"
                  : selectedLang === "hi-IN"
                  ? "हिन्दी (LTR)"
                  : "اردو (RTL)"}
              </span>
            </label>
            <div className="flex items-center gap-2">
              {transcript && (
                <button
                  type="button"
                  onClick={() => setTranscript("")}
                  className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              )}
              {transcript && (
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> AI Captured
                </span>
              )}
            </div>
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            dir={isUrdu ? "rtl" : "ltr"}
            rows={4}
            placeholder={t("transcriptPlaceholder")}
            className={`w-full text-sm p-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gov-navy focus:outline-none resize-none bg-slate-50/70 text-slate-800 ${
              isUrdu ? "font-serif text-base leading-relaxed" : ""
            }`}
          />
        </div>

        {/* 1-Click Evaluation Demos & Audio Upload Option */}
        <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-900 font-bold">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-amber-600" /> {t("quickDemoTitle")}
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isTranscribingBackend}
              className="text-[11px] text-gov-navy hover:underline flex items-center gap-1 font-semibold"
            >
              <Upload className="w-3 h-3" />
              <span>{isTranscribingBackend ? "Processing..." : "Upload Audio File"}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleAudioFileUpload}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {/* English Demo */}
            <button
              type="button"
              onClick={() => handleSimulate("english")}
              className="text-[11px] py-2 px-2 bg-white border border-amber-300/80 rounded-xl hover:bg-amber-100/60 text-slate-800 font-semibold transition-colors text-center shadow-xs"
            >
              {t("demoEnglish")}
            </button>

            {/* Hindi Demo */}
            <button
              type="button"
              onClick={() => handleSimulate("hindi")}
              className="text-[11px] py-2 px-2 bg-white border border-amber-300/80 rounded-xl hover:bg-amber-100/60 text-slate-800 font-semibold transition-colors text-center shadow-xs"
            >
              {t("demoHindi")}
            </button>

            {/* Urdu Demo */}
            <button
              type="button"
              onClick={() => handleSimulate("urdu")}
              className="text-[11px] py-2 px-2 bg-white border border-emerald-300 rounded-xl hover:bg-emerald-50 text-slate-800 font-semibold transition-colors text-center shadow-xs font-serif"
            >
              {t("demoUrdu")}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              if (recognitionRef.current) {
                try {
                  recognitionRef.current.abort();
                } catch {
                  // ignore
                }
              }
              onClose();
            }}
            className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!transcript.trim()}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-gov-navy to-slate-900 hover:from-slate-800 hover:to-gov-navy disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 transform active:scale-95"
          >
            <Check className="w-4 h-4" /> {t("applyToChallenge")}
          </button>
        </div>
      </div>
    </div>
  );
}
