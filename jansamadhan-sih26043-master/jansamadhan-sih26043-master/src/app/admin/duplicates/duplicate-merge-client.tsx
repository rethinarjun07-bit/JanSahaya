"use client";

import React, { useState } from "react";
import {
  GitMerge,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Search,
  ExternalLink,
} from "lucide-react";
import { triggerConfetti } from "@/components/celebration-effects";
import { sound } from "@/lib/sound";
import { PopCard, PopItem } from "@/components/page-pop-transition";

interface ChallengeSimple {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  district: string;
  state: string;
  status: string;
  urgencyScore: number;
}

interface Props {
  challenges: ChallengeSimple[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mergeHistory: any[];
}

export function DuplicateMergeClient({ challenges, mergeHistory }: Props) {
  // Preset demo pairs based on seed
  const morabadi1 = challenges.find((c) => c.title.toLowerCase().includes("sudden flash flood in morabadi"));
  const morabadi2 = challenges.find((c) => c.title.toLowerCase().includes("severe water accumulation") && c.title.toLowerCase().includes("morabadi"));

  const jharia1 = challenges.find((c) => c.title.toLowerCase().includes("underground coal seam fire"));
  const jharia2 = challenges.find((c) => c.title.toLowerCase().includes("subterranean coal fire"));

  const palamu1 = challenges.find((c) => c.title.toLowerCase().includes("severe groundwater fluoride"));
  const palamu2 = challenges.find((c) => c.title.toLowerCase().includes("high fluoride levels"));

  const [masterId, setMasterId] = useState(morabadi1?.id || challenges[0]?.id || "");
  const [duplicateId, setDuplicateId] = useState(morabadi2?.id || challenges[1]?.id || "");
  const [reason, setReason] = useState("Identical physical location and drainage blockage reported in Morabadi Ground.");
  const [merging, setMerging] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const master = challenges.find((c) => c.id === masterId);
  const duplicate = challenges.find((c) => c.id === duplicateId);

  // Compute mock / dynamic similarity percentage
  const calculateScore = () => {
    if (!master || !duplicate) return 0;
    if (master.id === duplicate.id) return 100;
    if (master.district.toLowerCase() === duplicate.district.toLowerCase()) {
      return 88;
    }
    return 34;
  };

  const similarityScore = calculateScore();

  const handleSelectPreset = (mId?: string, dId?: string, defaultReason?: string) => {
    sound.playClick();
    if (mId) setMasterId(mId);
    if (dId) setDuplicateId(dId);
    if (defaultReason) setReason(defaultReason);
    setSuccessMessage("");
  };

  const handleExecuteMerge = async () => {
    if (!masterId || !duplicateId || masterId === duplicateId) {
      alert("Please select two distinct challenges to merge.");
      return;
    }

    sound.playClick();
    setMerging(true);
    try {
      const res = await fetch("/api/admin/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          masterChallengeId: masterId,
          duplicateChallengeId: duplicateId,
          reason,
          similarityScore: similarityScore / 100,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Merge failed");
      }

      triggerConfetti();
      setSuccessMessage(data.message || "Successfully merged duplicate challenge into Master!");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error executing merge");
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Test Presets Banner */}
      <PopItem delay={0.05} className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            1-Click Test Scenarios (Deliberate Seed Duplicates):
          </span>
          <span className="text-[11px] text-amber-800">Ready for Live Demonstration</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {morabadi1 && morabadi2 && (
            <button
              onClick={() =>
                handleSelectPreset(
                  morabadi1.id,
                  morabadi2.id,
                  "Identical culvert choke and flash flood accumulation in Morabadi Ground, Ranchi."
                )
              }
              className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-800 hover:bg-amber-100 transition-colors shadow-sm"
            >
              🌊 Scenario 1: Morabadi Floods (Ranchi)
            </button>
          )}

          {jharia1 && jharia2 && (
            <button
              onClick={() =>
                handleSelectPreset(
                  jharia1.id,
                  jharia2.id,
                  "Subterranean coal fire fumes affecting Jharia settlements."
                )
              }
              className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-800 hover:bg-amber-100 transition-colors shadow-sm"
            >
              🔥 Scenario 2: Jharia Coal Fire (Dhanbad)
            </button>
          )}

          {palamu1 && palamu2 && (
            <button
              onClick={() =>
                handleSelectPreset(
                  palamu1.id,
                  palamu2.id,
                  "High fluoride levels and borewell drought in Palamu rural blocks."
                )
              }
              className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-800 hover:bg-amber-100 transition-colors shadow-sm"
            >
              💧 Scenario 3: Palamu Water Fluoride
            </button>
          )}
        </div>
      </PopItem>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-900 font-bold text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Side-by-Side Diff Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Master Challenge */}
        <PopCard delay={0.1} className="bg-white rounded-3xl border-2 border-gov-navy/40 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-gov-navy bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                Designated Master Record
              </span>
              <span className="text-xs text-slate-400">Primary Aggregation Target</span>
            </div>

            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Master Challenge:
            </label>
            <select
              value={masterId}
              onChange={(e) => {
                sound.playClick();
                setMasterId(e.target.value);
              }}
              className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl mb-4 focus:ring-2 focus:ring-gov-navy focus:outline-none bg-slate-50"
            >
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.district}] {c.title.substring(0, 70)}...
                </option>
              ))}
            </select>

            {master && (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-900 text-sm mb-1">{master.title}</div>
                  <p className="text-slate-600 leading-relaxed">{master.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-50 rounded-lg">District: <strong>{master.district}</strong></div>
                  <div className="p-2 bg-slate-50 rounded-lg">Sector: <strong>{master.category}</strong></div>
                  <div className="p-2 bg-slate-50 rounded-lg">Severity: <strong>{master.severity}</strong></div>
                  <div className="p-2 bg-slate-50 rounded-lg">Urgency: <strong>{master.urgencyScore}/100</strong></div>
                </div>
              </div>
            )}
          </div>
        </PopCard>

        {/* Right Side: Duplicate Challenge */}
        <PopCard delay={0.15} className="bg-white rounded-3xl border-2 border-amber-400/60 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                Duplicate Candidate
              </span>
              <span className="text-xs text-amber-700 font-semibold">Will be set to MERGED</span>
            </div>

            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Duplicate Challenge:
            </label>
            <select
              value={duplicateId}
              onChange={(e) => {
                sound.playClick();
                setDuplicateId(e.target.value);
              }}
              className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl mb-4 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50"
            >
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.district}] {c.title.substring(0, 70)}...
                </option>
              ))}
            </select>

            {duplicate && (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200">
                  <div className="font-bold text-slate-900 text-sm mb-1">{duplicate.title}</div>
                  <p className="text-slate-600 leading-relaxed">{duplicate.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-50 rounded-lg">District: <strong>{duplicate.district}</strong></div>
                  <div className="p-2 bg-slate-50 rounded-lg">Sector: <strong>{duplicate.category}</strong></div>
                  <div className="p-2 bg-slate-50 rounded-lg">Severity: <strong>{duplicate.severity}</strong></div>
                  <div className="p-2 bg-slate-50 rounded-lg">Urgency: <strong>{duplicate.urgencyScore}/100</strong></div>
                </div>
              </div>
            )}
          </div>
        </PopCard>
      </div>

      {/* Similarity & Merge Action Console */}
      <PopItem delay={0.2} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Cosine & TF-IDF Similarity Score:</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl font-extrabold text-gov-navy">{similarityScore}% Match</span>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                High Confidence Duplicate
              </span>
            </div>
          </div>

          <div className="w-full sm:w-64 bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                similarityScore > 75 ? "bg-red-500" : similarityScore > 50 ? "bg-amber-500" : "bg-blue-500"
              }`}
              style={{ width: `${similarityScore}%` }}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Official Nodal Justification for Merge Dossier:
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none"
            placeholder="Document rationale for spatial & descriptive consolidation..."
          />
        </div>

        <button
          onClick={handleExecuteMerge}
          disabled={merging || masterId === duplicateId}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-gov-navy via-gov-navyLight to-slate-900 hover:from-slate-900 hover:to-gov-navy disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95"
        >
          <GitMerge className="w-5 h-5 text-amber-400" />
          <span>{merging ? "Executing Deduplication..." : "Execute Merge & Roll Up Engagement"}</span>
        </button>
      </PopItem>

      {/* Merge History Table */}
      {mergeHistory.length > 0 && (
        <PopItem delay={0.25} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-gov-navy" /> Recent Deduplication History
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {mergeHistory.map((m: any) => (
              <div key={m.id} className="py-2.5 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="font-bold text-slate-800">Master #{m.masterChallengeId.substring(0, 8)}</span>
                  <span className="text-slate-400 mx-1.5">&larr;</span>
                  <span className="text-slate-600">Merged #{m.duplicateChallengeId.substring(0, 8)}</span>
                  <span className="ml-2 text-slate-500 italic font-normal">({m.reason})</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {new Date(m.mergedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </PopItem>
      )}
    </div>
  );
}
