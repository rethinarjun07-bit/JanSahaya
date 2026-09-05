"use client";

import React, { useState } from "react";
import { Building2, CheckCircle2, ArrowRight, Sparkles, Send, ShieldAlert } from "lucide-react";
import { triggerConfetti } from "@/components/celebration-effects";
import { sound } from "@/lib/sound";

interface ChallengeItem {
  id: string;
  title: string;
  category: string;
  severity: string;
  district: string;
  urgencyScore: number;
  autoAssignedUniversity?: string | null;
  assignedUniversityId?: string | null;
  assignedDepartment?: string | null;
}

interface UniversityItem {
  id: string;
  name: string;
  code: string;
  district: string;
  departments: string[];
  expertiseTags: string[];
  nodalOfficerName: string;
}

interface Props {
  challenges: ChallengeItem[];
  universities: UniversityItem[];
}

export function UniversityAssignmentClient({ challenges, universities }: Props) {
  const [selectedChallengeId, setSelectedChallengeId] = useState(challenges[0]?.id || "");
  const [selectedUniId, setSelectedUniId] = useState(universities[0]?.id || "");
  const [selectedDept, setSelectedDept] = useState(universities[0]?.departments[0] || "");
  const [notes, setNotes] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const currentChallenge = challenges.find((c) => c.id === selectedChallengeId);
  const currentUniversity = universities.find((u) => u.id === selectedUniId);

  const handleUniversityChange = (uniId: string) => {
    setSelectedUniId(uniId);
    const uni = universities.find((u) => u.id === uniId);
    if (uni && uni.departments.length > 0) {
      setSelectedDept(uni.departments[0]);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeId || !selectedUniId) return;

    sound.playClick();
    setAssigning(true);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: selectedChallengeId,
          universityId: selectedUniId,
          department: selectedDept,
          notes: notes || `Officially assigned to ${currentUniversity?.name} for technical disaster mitigation.`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Assignment failed");
      }

      triggerConfetti();
      setSuccessMsg(`Challenge successfully assigned to ${currentUniversity?.name} (${selectedDept})!`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error assigning institute");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 font-bold text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Select Challenge */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-gov-saffron" />
            <span>Select Ground Challenge to Allocate</span>
          </h3>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {challenges.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedChallengeId(c.id);
                  setSuccessMsg("");
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  selectedChallengeId === c.id
                    ? "border-gov-navy bg-blue-50/70 shadow-sm ring-1 ring-gov-navy"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                      c.severity === "CRITICAL"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {c.severity}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">{c.district}</span>
                </div>
                <div className="text-xs font-bold text-slate-900 line-clamp-2">{c.title}</div>
                {c.autoAssignedUniversity && (
                  <div className="mt-1 text-[11px] text-gov-navy flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>AI Suggested: <strong>{c.autoAssignedUniversity}</strong></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: University Selector & Dispatch Form */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <form onSubmit={handleAssign} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gov-navy" />
              <span>Target Research Institute & Department</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Premier University
              </label>
              <select
                value={selectedUniId}
                onChange={(e) => handleUniversityChange(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none bg-slate-50"
              >
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.district})
                  </option>
                ))}
              </select>
            </div>

            {currentUniversity && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specialized Division / Department
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none bg-slate-50"
                >
                  {currentUniversity.departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentUniversity && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                <div className="text-[11px] text-slate-400">Institutional Specialties:</div>
                <div className="flex flex-wrap gap-1">
                  {currentUniversity.expertiseTags.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-medium">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Nodal Officer: <strong>{currentUniversity.nodalOfficerName}</strong>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Nodal Instructions (Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specific research mandates, timeline expectations, or site contact points..."
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={assigning || !selectedChallengeId}
              className="w-full py-3.5 px-4 bg-gov-navy hover:bg-gov-navyLight text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 transform active:scale-95"
            >
              <Send className="w-4 h-4 text-amber-400" />
              <span>{assigning ? "Allocating Challenge..." : "Assign Problem & Dispatch Notification"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
