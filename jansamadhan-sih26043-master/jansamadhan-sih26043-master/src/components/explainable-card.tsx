"use client";

import React from "react";
import { CheckCircle2, Award, MapPin, Building, TrendingUp } from "lucide-react";
import { ExplainableMatch } from "@/lib/nlp/matcher";

interface ExplainableCardProps {
  match: ExplainableMatch;
  onSelect?: () => void;
}

export function ExplainableCard({ match, onSelect }: ExplainableCardProps) {
  const getBadgeColor = (verdict: string) => {
    switch (verdict) {
      case "PERFECT_MATCH":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "HIGH_ALIGNMENT":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "GOOD_FIT":
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const getBarColor = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.8) return "bg-emerald-500";
    if (ratio >= 0.6) return "bg-blue-500";
    return "bg-amber-500";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h4 className="text-base font-bold text-slate-900">{match.solverName}</h4>
          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
            <Building className="w-3.5 h-3.5 text-gov-navy" /> {match.organization}
          </p>
        </div>

        {/* Overall Match Circle / Pill */}
        <div className="text-right">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gov-navy text-white text-xs font-bold shadow-sm">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{match.matchPercentage}% Fit</span>
          </div>
          <div className="mt-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getBadgeColor(match.fitVerdict)}`}>
              {match.fitVerdict.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown Metrics */}
      <div className="space-y-2.5 my-3 pt-2 border-t border-slate-100 text-xs">
        {/* Metric 1: Skills */}
        <div>
          <div className="flex justify-between items-center text-slate-600 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Domain & Skill Match
            </span>
            <span className="font-bold text-slate-800">
              {match.breakdown.skillRelevance.score} / {match.breakdown.skillRelevance.max}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                match.breakdown.skillRelevance.score,
                match.breakdown.skillRelevance.max
              )}`}
              style={{
                width: `${(match.breakdown.skillRelevance.score / match.breakdown.skillRelevance.max) * 100}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{match.breakdown.skillRelevance.detail}</p>
        </div>

        {/* Metric 2: Proximity */}
        <div>
          <div className="flex justify-between items-center text-slate-600 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-rose-500" /> District Proximity
            </span>
            <span className="font-bold text-slate-800">
              {match.breakdown.districtProximity.score} / {match.breakdown.districtProximity.max}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                match.breakdown.districtProximity.score,
                match.breakdown.districtProximity.max
              )}`}
              style={{
                width: `${(match.breakdown.districtProximity.score / match.breakdown.districtProximity.max) * 100}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{match.breakdown.districtProximity.detail}</p>
        </div>

        {/* Metric 3: Institutional Alignment */}
        <div>
          <div className="flex justify-between items-center text-slate-600 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <Building className="w-3.5 h-3.5 text-indigo-500" /> Research Lab Alignment
            </span>
            <span className="font-bold text-slate-800">
              {match.breakdown.institutionalAlignment.score} / {match.breakdown.institutionalAlignment.max}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                match.breakdown.institutionalAlignment.score,
                match.breakdown.institutionalAlignment.max
              )}`}
              style={{
                width: `${(match.breakdown.institutionalAlignment.score / match.breakdown.institutionalAlignment.max) * 100}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{match.breakdown.institutionalAlignment.detail}</p>
        </div>

        {/* Metric 4: Track Record */}
        <div>
          <div className="flex justify-between items-center text-slate-600 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" /> Verified Track Record & Karma
            </span>
            <span className="font-bold text-slate-800">
              {match.breakdown.provenTrackRecord.score} / {match.breakdown.provenTrackRecord.max}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                match.breakdown.provenTrackRecord.score,
                match.breakdown.provenTrackRecord.max
              )}`}
              style={{
                width: `${(match.breakdown.provenTrackRecord.score / match.breakdown.provenTrackRecord.max) * 100}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{match.breakdown.provenTrackRecord.detail}</p>
        </div>
      </div>

      {/* Matched Skills Tags */}
      {match.matchedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
          {match.matchedSkills.map((s, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {onSelect && (
        <button
          onClick={onSelect}
          className="w-full mt-3 py-2 px-3 bg-slate-50 hover:bg-gov-navy hover:text-white text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
        >
          Assign Problem to this Lab
        </button>
      )}

      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>Formula: 0.45·Text + 0.25·Skills + 0.15·TrackRecord + 0.15·Proximity</span>
        <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Explainable AI</span>
      </div>
    </div>
  );
}
