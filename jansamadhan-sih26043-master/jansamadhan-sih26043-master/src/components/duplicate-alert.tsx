"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink, ArrowRight, Layers } from "lucide-react";
import { DuplicateCandidate } from "@/lib/nlp/tfidf";

interface DuplicateAlertProps {
  candidates: DuplicateCandidate[];
}

export function DuplicateAlert({ candidates }: DuplicateAlertProps) {
  if (!candidates || candidates.length === 0) return null;

  const topMatch = candidates[0];

  return (
    <div className="rounded-2xl border-2 border-amber-400 bg-amber-50/90 p-4 shadow-sm mb-6 transition-all duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-400 text-slate-900 shrink-0 mt-0.5 shadow-sm">
          <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
            <h4 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
              <span>Potential Duplicate Challenge Identified</span>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full text-xs font-bold">
                {topMatch.similarityPercentage}% Similarity Match
              </span>
            </h4>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
              {topMatch.confidence} CONFIDENCE
            </span>
          </div>

          <p className="text-xs text-amber-900/90 mb-3 leading-relaxed">
            Our intelligent TF-IDF duplicate engine detected that a very similar challenge has already been registered in{" "}
            <strong>{topMatch.district}</strong>. Consider reviewing the existing report to upvote or append evidence instead of creating a fragmented duplicate:
          </p>

          <div className="bg-white/90 border border-amber-300/80 rounded-xl p-3 mb-3">
            <div className="text-xs font-bold text-slate-900 line-clamp-1 mb-1">
              &ldquo;{topMatch.title}&rdquo;
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span>Sector: <strong className="text-slate-700">{topMatch.category}</strong></span>
              <span>District: <strong className="text-slate-700">{topMatch.district}</strong></span>
            </div>

            {topMatch.matchingKeywords.length > 0 && (
              <div className="mt-2 flex items-center gap-1 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Overlapping Terms:</span>
                {topMatch.matchingKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-amber-100/70 border border-amber-200 text-amber-900 rounded text-[10px] font-medium"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/challenges/${topMatch.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors shadow-sm"
            >
              <span>Inspect Existing Challenge</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <span className="text-[11px] text-amber-900/70 italic">
              (You may still proceed with submission if this is a distinct issue)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
