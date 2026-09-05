"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Mic, MicOff, Loader2, Send, CheckCircle2, ArrowRight,
  MessageSquare, Globe, Zap, AlertTriangle, Phone,
} from "lucide-react";
import { sound } from "@/lib/sound";

// Supported language options
const LANGUAGES = [
  { code: "en-IN", label: "English", flag: "🇬🇧" },
  { code: "hi-IN", label: "हिंदी (Hindi)", flag: "🇮🇳" },
  { code: "bn-IN", label: "বাংলা (Bengali)", flag: "🟡" },
  { code: "en-IN", label: "Santali (auto-detect)", flag: "🌿" },
];

const SMS_EXAMPLES = [
  { text: "FLOOD RANCHI CRITICAL", desc: "Flood emergency in Ranchi" },
  { text: "MINE FIRE DHANBAD HIGH", desc: "Coal mine fire, Dhanbad" },
  { text: "बाढ़ बोकारो गंभीर", desc: "Hindi flood report, Bokaro" },
  { text: "ROAD DAMAGE HAZARIBAGH MEDIUM", desc: "Road damage, Hazaribagh" },
  { text: "LANDSLIDE LATEHAR HIGH", desc: "Landslide alert, Latehar" },
];

type VoiceResult = {
  detectedLanguage?: string;
  translatedText?: string;
  title?: string;
  description?: string;
  category?: string;
  severity?: string;
  district?: string;
};

type SMSResult = {
  success?: boolean;
  challengeId?: string;
  parsed?: { category?: string; district?: string; severity?: string; title?: string };
  message?: string;
  error?: string;
};

export default function AiReportingPage() {
  // SMS state
  const [smsText, setSmsText] = useState("");
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsResult, setSmsResult] = useState<SMSResult | null>(null);

  // Voice state
  const [selectedLang, setSelectedLang] = useState("hi-IN");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceResult, setVoiceResult] = useState<VoiceResult | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // === SMS Parser ===
  const handleSMSSubmit = async () => {
    if (!smsText.trim()) return;
    sound.playClick();
    setSmsLoading(true);
    setSmsResult(null);
    try {
      const res = await fetch("/api/ai/sms-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smsText }),
      });
      const data = await res.json();
      setSmsResult(data);
      if (data.success) sound.playCelebration();
    } catch {
      setSmsResult({ error: "Failed to process SMS" });
    } finally {
      setSmsLoading(false);
    }
  };

  // === Voice Recording ===
  const startRecording = () => {
    const SpeechRecognition =
      (window as Window & typeof globalThis & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as Window & typeof globalThis & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Chrome.");
      return;
    }
    sound.playClick();
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ");
      setTranscript(text);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
    setTranscript("");
    setVoiceResult(null);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    sound.playClick();
  };

  const processVoiceReport = async () => {
    if (!transcript.trim()) return;
    sound.playClick();
    setVoiceLoading(true);
    setVoiceResult(null);
    try {
      const res = await fetch("/api/ai/voice-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, language: selectedLang }),
      });
      const data = await res.json();
      setVoiceResult(data);
      if (data.success) sound.playCelebration();
    } catch {
      setVoiceResult({ title: "Processing failed" });
    } finally {
      setVoiceLoading(false);
    }
  };

  const SEVERITY_COLORS: Record<string, string> = {
    CRITICAL: "bg-red-100 text-red-700 border-red-300",
    HIGH: "bg-orange-100 text-orange-700 border-orange-300",
    MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-300",
    LOW: "bg-green-100 text-green-700 border-green-300",
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gov-navy/10 border border-gov-navy/20 text-gov-navy text-xs font-bold mb-4">
            <Zap className="w-3.5 h-3.5 text-gov-saffron" />
            AI-Powered Inclusive Reporting · JanSahaya Innovation
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif mb-3">
            Report Without Internet
          </h1>
          <p className="text-slate-500 text-sm max-w-2xl mx-auto">
            During disasters, internet fails. Use <strong>SMS</strong> or speak in your local language — Hindi, Santali, Bengali — and our AI auto-creates the disaster report for government action.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-red-500" /> Emergency: <strong className="text-red-600">112</strong></span>
            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-blue-500" /> SDMA: <strong>0651-2446900</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* === FEATURE 1: SMS Reporter === */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-5 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base">📱 SMS / WhatsApp Reporter</h2>
                  <p className="text-emerald-200 text-[11px]">Works on basic phones · No internet needed</p>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-[11px] font-mono">
                Format: <span className="text-yellow-300">DISASTER DISTRICT SEVERITY</span><br />
                Example: <span className="text-white font-bold">FLOOD RANCHI CRITICAL</span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Quick examples */}
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Quick Examples — Click to try:</div>
                <div className="flex flex-wrap gap-1.5">
                  {SMS_EXAMPLES.map((ex) => (
                    <button key={ex.text} onClick={() => setSmsText(ex.text)}
                      className="text-[10px] font-mono px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-lg transition-colors text-slate-700">
                      {ex.text}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">SMS Message</label>
                <textarea
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  placeholder="Type SMS text here... e.g. FLOOD RANCHI CRITICAL"
                  className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono resize-none"
                  rows={3}
                />
              </div>

              <button onClick={handleSMSSubmit} disabled={!smsText.trim() || smsLoading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2">
                {smsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {smsLoading ? "Processing with AI..." : "Parse & Create Challenge"}
              </button>

              {/* SMS Result */}
              {smsResult && (
                <div className={`rounded-2xl p-4 border text-sm ${smsResult.success ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                  {smsResult.success ? (
                    <>
                      <div className="flex items-center gap-2 font-bold text-emerald-800 mb-2">
                        <CheckCircle2 className="w-4 h-4" /> Challenge Created!
                      </div>
                      <div className="space-y-1 text-xs text-emerald-700">
                        <div><strong>Title:</strong> {smsResult.parsed?.title}</div>
                        <div><strong>Category:</strong> {smsResult.parsed?.category}</div>
                        <div><strong>District:</strong> {smsResult.parsed?.district}</div>
                        <div>
                          <strong>Severity:</strong>{" "}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${SEVERITY_COLORS[smsResult.parsed?.severity || "HIGH"] || ""}`}>
                            {smsResult.parsed?.severity}
                          </span>
                        </div>
                      </div>
                      {smsResult.challengeId && (
                        <Link href={`/challenges/${smsResult.challengeId}`}
                          className="mt-3 flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline">
                          View Challenge <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-red-700 text-xs">
                      <AlertTriangle className="w-4 h-4" /> {smsResult.error || "Could not parse SMS. Try: FLOOD RANCHI HIGH"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* === FEATURE 2: Voice Reporter === */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base">🗣️ Voice Report — Any Language</h2>
                  <p className="text-blue-200 text-[11px]">Hindi · Santali · Bengali · English · AI translates automatically</p>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-[11px]">
                Speak naturally: <span className="text-yellow-300 font-bold">&quot;हमारे गांव में बाढ़ आ गई है, पानी घर में घुस गया&quot;</span><br />
                <span className="text-blue-200">AI translates → creates disaster report automatically</span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Language selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Select Language to Speak In:</label>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGES.map((lang) => (
                    <button key={lang.code + lang.label} onClick={() => setSelectedLang(lang.code)}
                      className={`text-xs py-2 px-3 rounded-xl border font-semibold transition-all flex items-center gap-2 ${
                        selectedLang === lang.code && lang.label !== "Santali (auto-detect)"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300"
                      }`}>
                      <span>{lang.flag}</span> {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mic button */}
              <div className="text-center">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-xl transition-all duration-200 ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600 animate-pulse scale-110"
                      : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
                  }`}>
                  {isRecording
                    ? <MicOff className="w-8 h-8 text-white" />
                    : <Mic className="w-8 h-8 text-white" />}
                </button>
                <p className="text-xs text-slate-500 mt-2">
                  {isRecording ? "🔴 Recording... tap to stop" : "Tap to start speaking"}
                </p>
              </div>

              {/* Transcript box */}
              {transcript && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Your words:</div>
                  <p className="text-sm text-slate-700 italic">&quot;{transcript}&quot;</p>
                </div>
              )}

              {transcript && !isRecording && (
                <button onClick={processVoiceReport} disabled={voiceLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2">
                  {voiceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {voiceLoading ? "AI Translating & Parsing..." : "Translate & Create Report"}
                </button>
              )}

              {/* Voice result */}
              {voiceResult && voiceResult.title && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm">
                  <div className="flex items-center gap-2 font-bold text-blue-800 mb-2">
                    <CheckCircle2 className="w-4 h-4" /> AI Parsed Your Report
                  </div>
                  <div className="space-y-1 text-xs text-blue-700">
                    {voiceResult.detectedLanguage && <div><strong>Language:</strong> {voiceResult.detectedLanguage}</div>}
                    {voiceResult.translatedText && (
                      <div><strong>Translation:</strong> <em>&quot;{voiceResult.translatedText}&quot;</em></div>
                    )}
                    <div><strong>Title:</strong> {voiceResult.title}</div>
                    <div><strong>Category:</strong> {voiceResult.category}</div>
                    {voiceResult.district && <div><strong>District:</strong> {voiceResult.district}</div>}
                    {voiceResult.severity && (
                      <div>
                        <strong>Severity:</strong>{" "}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${SEVERITY_COLORS[voiceResult.severity] || ""}`}>
                          {voiceResult.severity}
                        </span>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/challenges/new?title=${encodeURIComponent(voiceResult.title || "")}&category=${encodeURIComponent(voiceResult.category || "")}&description=${encodeURIComponent(voiceResult.description || "")}&severity=${encodeURIComponent(voiceResult.severity || "")}`}
                    className="mt-3 flex items-center gap-1.5 w-full justify-center py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors">
                    Submit as Challenge <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* How it works section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-extrabold text-slate-900 mb-4 text-center">How It Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs text-slate-600">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <div className="text-2xl mb-2">📱</div>
              <strong className="block text-slate-800 mb-1">1. Send SMS or Speak</strong>
              Text &quot;FLOOD RANCHI HIGH&quot; or speak in any local language — even Santali or Mundari
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <div className="text-2xl mb-2">🤖</div>
              <strong className="block text-slate-800 mb-1">2. AI Parses & Translates</strong>
              Gemini AI detects language, translates, extracts location + severity + category
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <div className="text-2xl mb-2">🏛️</div>
              <strong className="block text-slate-800 mb-1">3. Govt Gets Notified</strong>
              Challenge auto-created on platform → District officer assigned → Action tracked
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
