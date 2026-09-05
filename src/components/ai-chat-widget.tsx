"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Mic, Phone } from "lucide-react";
import { sound } from "@/lib/sound";

interface Message {
  role: "user" | "model";
  text: string;
  isDemo?: boolean;
}

const QUICK_PROMPTS = [
  "What to do during a flood?",
  "How to report a disaster?",
  "बाढ़ आने पर क्या करें?",
  "Government compensation schemes",
];

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "🙏 Namaste! I'm **JanSahaya AI** — your disaster management assistant for Jharkhand.\n\nI can help with emergency steps, how to report incidents, government compensation, and more.\n\n_You can ask in Hindi, English, or your local language!_",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    sound.playClick();
    setInput("");
    setLoading(true);

    const userMsg: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.filter((m) => m.role !== "model" || messages.indexOf(m) > 0),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "model", text: data.reply || "Sorry, I couldn't process that.", isDemo: data.isDemo },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Connection error. For emergencies call **112**.", isDemo: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => { setOpen(!open); sound.playClick(); }}
        className={`fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          open ? "bg-red-500 hover:bg-red-600 rotate-0" : "bg-gov-navy hover:bg-gov-navyLight"
        }`}
        title="JanSahaya AI Assistant"
      >
        {open ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[9998] w-[350px] sm:w-[400px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          style={{ height: "520px" }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-gov-navy to-blue-800 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">JanSahaya AI</div>
              <div className="text-blue-200 text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Disaster Management Assistant · Jharkhand
              </div>
            </div>
            <a href="tel:112" className="ml-auto flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-colors">
              <Phone className="w-3 h-3" /> 112
            </a>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === "user" ? "bg-gov-navy" : "bg-blue-100"
                }`}>
                  {msg.role === "user"
                    ? <User className="w-3.5 h-3.5 text-white" />
                    : <Bot className="w-3.5 h-3.5 text-blue-700" />}
                </div>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gov-navy text-white rounded-tr-sm"
                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
                }`}
                  dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                />
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-blue-700" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 flex gap-1.5 overflow-x-auto bg-white border-t border-slate-100">
            {QUICK_PROMPTS.map((p) => (
              <button key={p} onClick={() => sendMessage(p)}
                className="shrink-0 text-[10px] font-semibold px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl transition-colors">
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Ask in Hindi or English..."
              className="flex-1 text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
              className="w-9 h-9 bg-gov-navy hover:bg-gov-navyLight disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
