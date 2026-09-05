"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle, X, Send, Bot, User, Loader2, Mic,
  MicOff, Phone, Copy, Check, RefreshCw, ChevronDown, Sparkles,
} from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
  timestamp: Date;
  isDemo?: boolean;
  lang?: string;
}

const QUICK_PROMPTS = [
  { text: "What to do during a flood?", emoji: "🌊" },
  { text: "बाढ़ में क्या करें?", emoji: "🇮🇳" },
  { text: "Government compensation schemes", emoji: "💰" },
  { text: "How to report a disaster?", emoji: "📋" },
  { text: "Mining accident help", emoji: "⛏️" },
  { text: "First aid tips", emoji: "💊" },
];

const TYPING_PHRASES = [
  "Thinking...",
  "Analyzing your query...",
  "Looking up information...",
  "Preparing response...",
];

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "🙏 **Namaste!** I'm **JanSahaya AI** — your advanced disaster management assistant.\n\nI can help with:\n• Emergency steps (floods, earthquakes, fires)\n• Government compensation schemes\n• Health advice during disasters\n• How to report incidents on this platform\n\n_Ask me anything in **Hindi**, **English**, **Santali**, or **Bengali**!_",
      timestamp: new Date(),
      lang: "en",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingPhrase, setTypingPhrase] = useState(TYPING_PHRASES[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollBtn(false);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (open && !minimized) scrollToBottom();
  }, [messages, open, minimized, scrollToBottom]);

  // Typing phrase rotation
  useEffect(() => {
    if (loading) {
      let i = 0;
      typingInterval.current = setInterval(() => {
        i = (i + 1) % TYPING_PHRASES.length;
        setTypingPhrase(TYPING_PHRASES[i]);
      }, 1500);
    } else {
      if (typingInterval.current) clearInterval(typingInterval.current);
    }
    return () => { if (typingInterval.current) clearInterval(typingInterval.current); };
  }, [loading]);

  // Track scroll for show-more button
  const handleScroll = () => {
    if (!messagesRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");
    setLoading(true);

    const userMsg: Message = { role: "user", text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);

    // Get last 10 messages as history (excluding welcome message)
    const history = messages
      .slice(1)
      .slice(-10)
      .map((m) => ({ role: m.role, text: m.text }));

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      const botMsg: Message = {
        role: "model",
        text: data.reply || "I couldn't process that. Please try again.",
        timestamp: new Date(),
        isDemo: data.isDemo,
        lang: data.detectedLanguage,
      };
      setMessages((prev) => [...prev, botMsg]);

      // If chat is closed, count as unread
      if (!open || minimized) setUnreadCount((c) => c + 1);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "⚠️ Connection error. For emergencies call **112** immediately.\n\nSDMA Jharkhand: **0651-2446900**",
          timestamp: new Date(),
          isDemo: true,
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Voice recording
  const toggleVoice = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Voice input requires Chrome browser. You can also type in Hindi.");
      return;
    }

    const recognition = new SR();
    recognition.lang = "hi-IN";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results)
        .map((r) => (r as SpeechRecognitionResult)[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const copyMessage = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const clearChat = () => {
    setMessages([messages[0]]); // Keep welcome message
  };

  // Markdown-like text renderer
  const renderText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code class='bg-slate-100 px-1 rounded text-xs font-mono'>$1</code>")
      .replace(/\n/g, "<br/>")
      .replace(/•/g, "&#8226;");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => {
          setOpen(!open);
          setMinimized(false);
          setUnreadCount(0);
        }}
        className={`fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 group ${
          open ? "bg-red-500 hover:bg-red-600 rotate-90 scale-110" : "bg-[#1a2e5a] hover:bg-[#223878] hover:scale-110"
        }`}
        title="JanSahaya AI Assistant"
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-white" />
            {/* Live indicator */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            {/* Unread badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-2 -left-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-[9998] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300"
          style={{ width: "380px", height: minimized ? "72px" : "580px" }}
        >
          {/* ── Header ── */}
          <div className="bg-gradient-to-r from-[#1a2e5a] to-[#1e40af] px-4 py-3 flex items-center gap-3 shrink-0 cursor-pointer"
            onClick={() => setMinimized(!minimized)}>
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#1a2e5a]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-sm flex items-center gap-1.5">
                JanSahaya AI
                <Sparkles className="w-3 h-3 text-amber-400" />
              </div>
              <div className="text-blue-200 text-[10px] truncate">
                {loading ? (
                  <span className="animate-pulse">{typingPhrase}</span>
                ) : (
                  "Advanced AI • Jharkhand Disaster Management"
                )}
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-1.5 ml-auto" onClick={(e) => e.stopPropagation()}>
              <a href="tel:112" title="Call Emergency 112"
                className="w-8 h-8 rounded-xl bg-red-500/80 hover:bg-red-500 flex items-center justify-center transition-colors"
                onClick={(e) => e.stopPropagation()}>
                <Phone className="w-3.5 h-3.5 text-white" />
              </a>
              <button onClick={(e) => { e.stopPropagation(); clearChat(); }}
                title="Clear chat"
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <RefreshCw className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* ── Messages ── */}
              <div
                ref={messagesRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gradient-to-b from-slate-50 to-white"
              >
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.role === "user" ? "bg-[#1a2e5a]" : "bg-gradient-to-br from-blue-100 to-indigo-100"
                    }`}>
                      {msg.role === "user"
                        ? <User className="w-3.5 h-3.5 text-white" />
                        : <Bot className="w-3.5 h-3.5 text-blue-700" />}
                    </div>

                    {/* Bubble */}
                    <div className="flex flex-col max-w-[80%] gap-0.5">
                      <div className={`px-3 py-2.5 rounded-2xl text-xs leading-relaxed relative group ${
                        msg.role === "user"
                          ? "bg-[#1a2e5a] text-white rounded-tr-sm"
                          : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
                      }`}>
                        <div dangerouslySetInnerHTML={{ __html: renderText(msg.text) }} />

                        {/* Copy button — appears on hover */}
                        {msg.role === "model" && (
                          <button
                            onClick={() => copyMessage(msg.text, i)}
                            className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center justify-center transition-all"
                            title="Copy"
                          >
                            {copiedIdx === i
                              ? <Check className="w-2.5 h-2.5 text-green-600" />
                              : <Copy className="w-2.5 h-2.5 text-slate-500" />}
                          </button>
                        )}
                      </div>

                      {/* Timestamp + demo badge */}
                      <div className={`flex items-center gap-1 text-[9px] text-slate-400 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}>
                        <span>{formatTime(msg.timestamp)}</span>
                        {msg.isDemo && <span className="px-1 py-0.5 bg-amber-100 text-amber-600 rounded font-medium">demo</span>}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-blue-700" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Scroll to bottom button */}
              {showScrollBtn && (
                <button onClick={scrollToBottom}
                  className="absolute bottom-28 right-4 w-8 h-8 bg-white border border-slate-200 shadow-md rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors z-10">
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                </button>
              )}

              {/* ── Quick Prompts ── */}
              <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto">
                <div className="flex gap-1.5" style={{ minWidth: "max-content" }}>
                  {QUICK_PROMPTS.map((p) => (
                    <button key={p.text} onClick={() => sendMessage(p.text)}
                      disabled={loading}
                      className="shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-700 border border-blue-200 rounded-xl transition-colors whitespace-nowrap">
                      <span>{p.emoji}</span> {p.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Input Area ── */}
              <div className="px-3 pb-3 pt-2 bg-white flex gap-2 items-end">
                {/* Voice button */}
                <button onClick={toggleVoice}
                  title={isRecording ? "Stop recording" : "Speak in Hindi/Santali"}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                    isRecording
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}>
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Text input */}
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                    placeholder={isRecording ? "🎙️ Listening..." : "Type in Hindi or English..."}
                    disabled={loading}
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60 bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>

                {/* Send button */}
                <button onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 bg-[#1a2e5a] hover:bg-[#223878] disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all shrink-0 hover:scale-105 active:scale-95">
                  {loading
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* ── Footer ── */}
              <div className="px-4 pb-2 text-center">
                <p className="text-[9px] text-slate-400">
                  Powered by Google Gemini AI • JanSahaya SIH26043 • Emergency: <a href="tel:112" className="text-red-500 font-bold">112</a>
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
