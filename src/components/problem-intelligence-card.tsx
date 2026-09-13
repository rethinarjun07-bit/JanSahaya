"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Landmark,
  MapPin,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  Globe,
} from "lucide-react";
import { useLanguage } from "./language-provider";

export interface ProblemIntelligenceProps {
  category: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string;
  urgencyScore: number; // 0 to 100
  aiConfidence?: number; // 0 to 100, default ~92
  duplicateProbability?: number; // 0 to 100
  evidenceStrength?: number; // 0 to 100
  priorityScore?: number; // 0 to 100
  priorityReasons?: string[];
  district?: string;
  state?: string;
  responsibleAuthority?: string;
  requiredExpertise?: string[];
  sdgGoals?: string[];
  slaStatus?: string;
  slaDeadline?: string;
  isVerifiedByGovt?: boolean;
  verifiedByOfficer?: string;
  verifiedAt?: string;
  className?: string;
}

export function ProblemIntelligenceCard({
  category,
  severity,
  urgencyScore,
  aiConfidence = 88,
  duplicateProbability = 8,
  evidenceStrength = 82,
  priorityScore = 74,
  priorityReasons = ["High urgency rating", "Verified GPS & photo evidence", "Multiple citizen confirmations"],
  district = "Ranchi",
  state = "Jharkhand",
  responsibleAuthority = "Disaster Management Cell / DWSD, Govt. of Jharkhand",
  requiredExpertise = ["Hydrology", "Environmental Engineering", "Civil Drainage"],
  sdgGoals = ["SDG 6: Clean Water & Sanitation", "SDG 11: Sustainable Cities"],
  slaStatus = "ON_TRACK",
  slaDeadline,
  isVerifiedByGovt = true,
  verifiedByOfficer = "Nodal Officer (IAS) • Urban Dev Dept",
  verifiedAt = "Verified on Ground",
  className = "",
}: ProblemIntelligenceProps) {
  const { language } = useLanguage();

  const getSeverityStyle = (sev: string) => {
    switch (sev.toUpperCase()) {
      case "CRITICAL":
        return {
          bg: "bg-red-50 text-red-800 border-red-200",
          pill: "bg-red-700 text-white",
          dot: "bg-red-500",
          label: language === "hi" ? "अति गंभीर" : "Critical Priority",
        };
      case "HIGH":
        return {
          bg: "bg-amber-50 text-amber-900 border-amber-200",
          pill: "bg-[#C05621] text-white",
          dot: "bg-[#C05621]",
          label: language === "hi" ? "उच्च प्राथमिकता" : "High Priority",
        };
      case "MEDIUM":
        return {
          bg: "bg-blue-50 text-blue-900 border-blue-200",
          pill: "bg-blue-700 text-white",
          dot: "bg-blue-500",
          label: language === "hi" ? "मध्यम" : "Medium Priority",
        };
      default:
        return {
          bg: "bg-slate-50 text-slate-800 border-slate-200",
          pill: "bg-slate-700 text-white",
          dot: "bg-slate-400",
          label: language === "hi" ? "सामान्य" : "Standard Priority",
        };
    }
  };

  const sevStyle = getSeverityStyle(severity);

  return (
    <div className={`bg-white rounded-3xl border border-[#E8DFC8] p-6 shadow-sm overflow-hidden ${className}`}>
      {/* Top Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#EFE8DF]">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-[#1A3D2F]/10 text-[#1A3D2F] flex items-center justify-center font-bold">
            <Cpu className="w-4 h-4 text-[#1A3D2F]" />
          </span>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {language === "hi" ? "समस्या विश्लेषण व इंटेलिजेंस" : "Problem Intelligence Matrix"}
            </div>
            <h4 className="text-base font-bold font-serif text-slate-900 leading-none mt-0.5">
              {category.replace("_", " ")}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${sevStyle.pill}`}>
            {sevStyle.label}
          </span>
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {district}, {state}
          </span>
        </div>
      </div>

      {/* Primary Metrics 4-Box Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
        {/* Urgency Score */}
        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8]">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            {language === "hi" ? "तात्कालिकता" : "Urgency Score"}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {urgencyScore}<span className="text-xs font-normal text-slate-400">/100</span>
          </div>
          <div className="w-full bg-[#E5DCC5] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${urgencyScore > 75 ? "bg-red-600" : urgencyScore > 50 ? "bg-[#C05621]" : "bg-[#2D6A4F]"}`}
              style={{ width: `${Math.min(urgencyScore, 100)}%` }}
            />
          </div>
        </div>

        {/* AI Confidence */}
        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8]">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            {language === "hi" ? "एआई विश्वसनीयता" : "AI Confidence"}
          </div>
          <div className="text-2xl font-black text-[#1A3D2F] mt-1">
            {aiConfidence}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {aiConfidence < 60 ? "Review Required" : "High Reliability"}
          </div>
        </div>

        {/* Duplicate Probability */}
        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8]">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            {language === "hi" ? "समानता / प्रतिरूप" : "Duplicate Check"}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {duplicateProbability}%
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-1">
            {duplicateProbability < 25 ? "Unique Report" : "Cluster Identified"}
          </div>
        </div>

        {/* Evidence Strength */}
        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8]">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            {language === "hi" ? "साक्ष्य सुदृढ़ता" : "Evidence Strength"}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {evidenceStrength}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            GPS • Photo • Voice
          </div>
        </div>
      </div>

      {/* Human-in-the-Loop Low Confidence Warning if applicable */}
      {aiConfidence < 60 && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Human Verification Protocol:</strong> AI confidence is {aiConfidence}%. On-ground verification by statutory department officer is mandatory before solver assignment.
          </span>
        </div>
      )}

      {/* Evidence & Prioritization Breakdown */}
      <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8] mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-[#EFE8DF]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Transparent Prioritization Index:
            </span>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#1A3D2F] text-white">
              {priorityScore}/100 Priority
            </span>
          </div>
          {slaDeadline && (
            <div className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#C05621]" />
              <span>SLA Target: {new Date(slaDeadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Factors list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>Precise Geotag GPS Coordinates Verified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>Photographic Evidence Attached</span>
          </div>
          {priorityReasons.slice(0, 2).map((reason, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* UN Sustainable Development Goals Mapping */}
      {sdgGoals && sdgGoals.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            UN SDG Alignment:
          </span>
          {sdgGoals.map((sdg, idx) => (
            <span
              key={idx}
              className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200"
            >
              {sdg}
            </span>
          ))}
        </div>
      )}

      {/* Strict Separation Callout: AI Analysis vs Government Verification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#EFE8DF]">
        {/* Box A: AI Analysis (Decision Support Only) */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#C05621] uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C05621]" />
              <span>AI Statistical Assessment (Advisory)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Analyzed via in-engine TF-IDF n-grams, geospatial proximity clustering, and domain vocabulary extractors.
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase mr-1">Recommended Solvers:</span>
              {requiredExpertise.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-[#E8DFC8] text-slate-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-[#E8DFC8] italic">
            * AI serves strictly as decision support. It does not possess statutory authority to approve or reject.
          </div>
        </div>

        {/* Box B: Government Statutory Verification (Authoritative) */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
          isVerifiedByGovt
            ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
            : "bg-amber-50/70 border-amber-200 text-amber-950"
        }`}>
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#1A3D2F] uppercase tracking-wider mb-1.5">
              <Landmark className="w-4 h-4 text-[#1A3D2F]" />
              <span>Government Statutory Verification</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong>Jurisdiction:</strong> {responsibleAuthority}
            </p>
            <div className="mt-2.5 flex items-center gap-2 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#1A3D2F]" />
              <span>{isVerifiedByGovt ? verifiedByOfficer : "Pending Nodal Inspection"}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-600 mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
            <span>Status: <strong>{isVerifiedByGovt ? "Official Sanction Verified" : "Under Statutory Review"}</strong></span>
            <span>{verifiedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
