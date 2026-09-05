"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  FileCheck,
  CheckCircle2,
  Printer,
  Award,
  Building2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { triggerConfetti } from "@/components/celebration-effects";
import { sound } from "@/lib/sound";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  challenge: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  universities: any[];
}

export function VerificationClient({ challenge, universities }: Props) {
  const [checklist, setChecklist] = useState({
    geotag: true,
    evidence: true,
    lifeThreat: challenge.severity === "CRITICAL",
    jurisdiction: true,
  });

  const [verifiedSeverity, setVerifiedSeverity] = useState(challenge.severity);
  const [officialNotes, setOfficialNotes] = useState(
    challenge.officialNotes ||
      `On-ground inspection conducted in ${challenge.district}. Threat vulnerability confirmed. Escalated for university technical modeling.`
  );
  const [assignedUniversityId, setAssignedUniversityId] = useState(
    challenge.assignedUniversityId || (universities[0]?.id ?? "")
  );

  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState(challenge.status === "VERIFIED" || challenge.status === "ASSIGNED");
  const [certificateId] = useState(`JH-SDMA-${challenge.id.substring(0, 8).toUpperCase()}-2024`);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challenge.id,
          status: "VERIFIED",
          officialNotes,
          verifiedSeverity,
          assignedUniversityId: assignedUniversityId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      triggerConfetti();
      setVerified(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error verifying challenge");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Verification Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-2 font-serif text-slate-900 text-2xl font-bold">
          <FileCheck className="w-7 h-7 text-gov-navy" />
          <span>Official Government Triage & Verification</span>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Formal statutory verification of ground challenge #{challenge.id.substring(0, 8)} under State Disaster Management Framework.
        </p>

        <form onSubmit={handleVerify} className="space-y-5">
          {/* Challenge Summary */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900 text-sm">{challenge.title}</div>
            <div className="text-slate-600 line-clamp-2">{challenge.description}</div>
            <div className="flex items-center gap-4 text-slate-500 pt-1">
              <span>District: <strong>{challenge.district}, {challenge.state}</strong></span>
              <span>Category: <strong>{challenge.category}</strong></span>
              <span>Reported By: <strong>{challenge.createdBy.name}</strong></span>
            </div>
          </div>

          {/* Statutory Verification Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">
              Nodal Officer Verification Checklist
            </label>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.geotag}
                  onChange={(e) => setChecklist({ ...checklist, geotag: e.target.checked })}
                  className="rounded text-gov-navy focus:ring-gov-navy"
                />
                <span className="font-medium text-slate-700">
                  Geotag coordinates ({challenge.latitude}, {challenge.longitude}) validated with cadastral GIS layers.
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.evidence}
                  onChange={(e) => setChecklist({ ...checklist, evidence: e.target.checked })}
                  className="rounded text-gov-navy focus:ring-gov-navy"
                />
                <span className="font-medium text-slate-700">
                  Ground evidence reviewed and classified as genuine municipal or disaster hazard.
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.lifeThreat}
                  onChange={(e) => setChecklist({ ...checklist, lifeThreat: e.target.checked })}
                  className="rounded text-gov-navy focus:ring-gov-navy"
                />
                <span className="font-medium text-slate-700">
                  Threat to human life, livestock, or critical infrastructure verified.
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.jurisdiction}
                  onChange={(e) => setChecklist({ ...checklist, jurisdiction: e.target.checked })}
                  className="rounded text-gov-navy focus:ring-gov-navy"
                />
                <span className="font-medium text-slate-700">
                  Jurisdiction belongs to Jharkhand State Disaster Management Cell / District Magistrate.
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Verified Severity
              </label>
              <select
                value={verifiedSeverity}
                onChange={(e) => setVerifiedSeverity(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none bg-slate-50"
              >
                <option value="CRITICAL">CRITICAL (Red Alert &bull; Immediate Triage)</option>
                <option value="HIGH">HIGH (Orange &bull; Escalated Response)</option>
                <option value="MEDIUM">MEDIUM (Yellow &bull; Scheduled Maintenance)</option>
                <option value="LOW">LOW (Routine)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Allocate to Partner University
              </label>
              <select
                value={assignedUniversityId}
                onChange={(e) => setAssignedUniversityId(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none bg-slate-50"
              >
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.district})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Official Inspection Remarks & Findings
            </label>
            <textarea
              rows={3}
              required
              value={officialNotes}
              onChange={(e) => setOfficialNotes(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3.5 px-6 bg-gradient-to-r from-gov-navy to-gov-navyLight hover:from-slate-900 hover:to-gov-navy text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{submitting ? "Processing Seal..." : "Sign Verification & Issue Digital Certificate"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Printable Official Digital Inspection Certificate */}
      {verified && (
        <div className="bg-white rounded-3xl border-4 border-slate-800 p-8 shadow-2xl space-y-6 relative overflow-hidden print:p-0 print:border-0">
          {/* Header watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-100 font-serif font-black text-7xl select-none pointer-events-none -rotate-12 uppercase opacity-40">
            Government Verified
          </div>

          <div className="text-center pb-4 border-b-2 border-slate-800 relative z-10">
            <div className="text-xs font-extrabold tracking-widest text-slate-600 uppercase mb-1">
              Government of Jharkhand &bull; Department of Disaster Management
            </div>
            <h2 className="text-2xl font-serif font-extrabold text-slate-900 uppercase tracking-tight">
              Official Disaster Vulnerability Certificate
            </h2>
            <div className="text-xs font-mono text-slate-500 mt-1">
              Certificate Ref ID: <strong className="text-slate-900">{certificateId}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs relative z-10">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Challenge / Incident:</span>
              <span className="font-bold text-slate-900 text-sm">{challenge.title}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Location & Jurisdiction:</span>
              <span className="font-bold text-slate-800">{challenge.district}, Jharkhand (GPS: {challenge.latitude}, {challenge.longitude})</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Verified Severity:</span>
              <span className="font-extrabold text-red-700 text-sm uppercase">{verifiedSeverity} PRIORITY</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Date of Statutory Inspection:</span>
              <span className="font-bold text-slate-800">{new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed relative z-10">
            <strong>Statutory Declaration:</strong> &ldquo;{officialNotes}&rdquo;
          </div>

          {/* Seal & Signatures */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 relative z-10 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-gov-navy text-gov-navy flex flex-col items-center justify-center text-[9px] font-bold text-center p-1">
                <span>SDMA</span>
                <span>JHARKHAND</span>
                <span>SEAL</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Digitally verified under Section 24 of the Disaster Management Act.
              </div>
            </div>

            <div className="text-right">
              <div className="font-serif italic font-bold text-gov-navy text-sm">Rajesh Kumar Sinha</div>
              <div className="text-xs font-bold text-slate-800">Sri Rajesh Kumar Sinha, IAS</div>
              <div className="text-[10px] text-slate-500">Principal Secretary & State Nodal Officer</div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end print:hidden">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print Official Certificate</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
