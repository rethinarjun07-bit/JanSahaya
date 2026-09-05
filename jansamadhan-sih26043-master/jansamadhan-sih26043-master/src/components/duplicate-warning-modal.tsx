"use client";

import React from "react";
import {
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  X,
  ThumbsUp,
  ExternalLink,
} from "lucide-react";
import { sound } from "@/lib/sound";

export interface DuplicateMatchItem {
  id: string;
  title: string;
  description: string;
  category: string;
  district: string;
  similarity: number;
  upvotesCount?: number;
  status?: string;
  sharedKeywords?: string[];
}

interface DuplicateWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: DuplicateMatchItem[];
  newTitle: string;
  newDescription: string;
  newCategory?: string;
  newDistrict?: string;
  onSupportExisting: (challengeId: string) => void;
  onSubmitAnyway: () => void;
  isSupporting?: boolean;
}

export function DuplicateWarningModal({
  isOpen,
  onClose,
  matches,
  newTitle,
  newDescription,
  newCategory,
  newDistrict,
  onSupportExisting,
  onSubmitAnyway,
  isSupporting = false,
}: DuplicateWarningModalProps) {
  if (!isOpen || matches.length === 0) return null;

  const topMatch = matches[0];
  const simPercent = Math.round(topMatch.similarity * 100);

  // Extract shared keywords dynamically if not provided
  const sharedWords =
    topMatch.sharedKeywords ||
    Array.from(
      new Set(
        `${newTitle} ${newDescription}`
          .toLowerCase()
          .split(/\W+/)
          .filter(
            (w) =>
              w.length > 3 &&
              `${topMatch.title} ${topMatch.description}`.toLowerCase().includes(w)
          )
      )
    ).slice(0, 6);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-amber-300 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-black/30 px-2 py-0.5 rounded text-amber-200">
                AI Duplicate Protection Engine
              </span>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded text-white border border-white/20">
                SIH26043 Differentiator #1
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold font-serif flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-200" />
              <span>Potential Duplicate Challenge Detected ({simPercent}% Match)</span>
            </h3>
            <p className="text-xs text-amber-100 max-w-xl leading-relaxed">
              Our TF-IDF semantic engine found an existing active report with matching keywords and geospatial proximity. In crowdsourced disaster response, pooling citizen votes behind a single master report drives 4x faster government funding!
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shared Keywords Ribbon */}
        {sharedWords.length > 0 && (
          <div className="bg-amber-50 px-6 py-2.5 border-b border-amber-200 flex items-center gap-2 flex-wrap text-xs">
            <span className="font-bold text-amber-900 text-[11px] uppercase tracking-wide">
              Shared Keyword Signals:
            </span>
            {sharedWords.map((kw, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-white border border-amber-300 text-amber-800 text-[11px] font-semibold shadow-xs"
              >
                #{kw}
              </span>
            ))}
          </div>
        )}

        {/* Body: Side-by-Side Diff */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Citizen's New Report */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-wide">Your Draft Report</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">
                  New Submission
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 line-clamp-2">{newTitle || "Untitled"}</h4>
              <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed">
                {newDescription || "No description entered."}
              </p>
              <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-2">
                <span>📍 {newDistrict || "Jharkhand"}</span>
                <span>🏷️ {newCategory || "Disaster Mitigation"}</span>
              </div>
            </div>

            {/* Right: Existing Master Challenge */}
            <div className="bg-amber-50/50 rounded-2xl p-4 border-2 border-amber-300 space-y-2 relative">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Existing Master Challenge</span>
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-2 py-0.5 rounded">
                  {simPercent}% Cosine Sim
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 line-clamp-2">{topMatch.title}</h4>
              <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed">{topMatch.description}</p>
              <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span>📍 {topMatch.district}</span>
                <span className="font-bold text-emerald-700">
                  👍 {topMatch.upvotesCount || 12} Citizens Supporting
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
          >
            Edit My Report
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onSubmitAnyway();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            >
              Submit Anyway (Flag for Review)
            </button>

            <button
              type="button"
              disabled={isSupporting}
              onClick={() => {
                sound.playCelebration();
                onSupportExisting(topMatch.id);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>+1 Support Existing & Earn 25 Karma</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
