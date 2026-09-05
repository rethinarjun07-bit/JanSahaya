"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  DollarSign,
  Award,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Layers,
} from "lucide-react";
import { triggerConfetti } from "@/components/celebration-effects";
import { sound } from "@/lib/sound";
import { PopCard } from "@/components/page-pop-transition";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vettedChallenges: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  industryUsers: any[];
}

export function IndustryPortalClient({ vettedChallenges, industryUsers }: Props) {
  const [pledgeModalOpen, setPledgeModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [pledgeAmount, setPledgeAmount] = useState(1200000);
  const [csrCompany, setCsrCompany] = useState("Tata Steel CSR Foundation");
  const [pledgeSuccess, setPledgeSuccess] = useState(false);

  const handlePledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    triggerConfetti();
    setPledgeSuccess(true);
    setTimeout(() => {
      setPledgeModalOpen(false);
      setPledgeSuccess(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* 4 Featured Corporate CSR Leaders */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 font-serif mb-4">
          Empaneled Industry CSR Patrons
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {industryUsers.map((ind, idx) => (
            <PopCard key={ind.id} delay={0.05 * idx} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-0.5">{ind.name}</h3>
              <p className="text-xs text-slate-500 mb-3">{ind.organization || ind.designation}</p>
              <div className="text-[11px] text-purple-700 font-semibold flex items-center gap-1">
                ⭐ {ind.karmaPoints} CSR Patron Score
              </div>
            </PopCard>
          ))}
        </div>
      </div>

      {/* Vetted Challenges Seeking Co-Sponsorship */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 font-serif">
            Vetted High-Impact Challenges Seeking CSR Co-Sponsorship
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Verified by State Disaster Authority
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vettedChallenges.map((c, idx) => (
            <PopCard
              key={c.id}
              delay={0.06 * idx}
              className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Govt Verified
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{c.district}, {c.state}</span>
                </div>

                <Link href={`/challenges/${c.id}`} className="block group">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-gov-navy transition-colors mb-1.5 leading-snug">
                    {c.title}
                  </h3>
                </Link>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {c.description}
                </p>

                {c.solutions.length > 0 && (
                  <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 mb-4 text-xs">
                    <div className="text-[11px] text-purple-900 font-bold mb-0.5">Active Academic Lead:</div>
                    <div className="font-semibold text-slate-800">{c.solutions[0].title}</div>
                    <div className="text-[11px] text-slate-500">
                      By {c.solutions[0].author.name} ({c.solutions[0].author.organization})
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Solutions: <strong>{c.solutions.length}</strong>
                </span>

                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedChallenge(c);
                    setPledgeModalOpen(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-700 to-gov-navy hover:from-purple-800 hover:to-slate-900 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5 text-amber-300" />
                  <span>Pledge CSR Grant</span>
                </button>
              </div>
            </PopCard>
          ))}
        </div>
      </div>

      {/* Pledge CSR Grant Modal */}
      {pledgeModalOpen && selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <h2 className="text-xl font-bold font-serif text-slate-900 mb-1">
              Pledge CSR Grant Co-Sponsorship
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              For: &ldquo;{selectedChallenge.title}&rdquo;
            </p>

            {pledgeSuccess ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">CSR Grant Pledge Recorded!</h3>
                <p className="text-xs text-slate-600">
                  ₹{(pledgeAmount / 100000).toFixed(2)} Lakhs committed. District nodal office notified.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePledgeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Corporate / Foundation Name
                  </label>
                  <select
                    value={csrCompany}
                    onChange={(e) => setCsrCompany(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl bg-slate-50"
                  >
                    <option value="Tata Steel CSR Foundation">Tata Steel CSR Foundation (Jamshedpur)</option>
                    <option value="Coal India Green Tech Initiative">Coal India Green Tech Initiative (CIL)</option>
                    <option value="Jindal Steel & Power Foundation">Jindal Steel & Power Foundation (Patratu)</option>
                    <option value="Infosys Springboard Foundation">Infosys Springboard Foundation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pledged Grant Amount (₹)
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {[500000, 1200000, 2500000].map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setPledgeAmount(amt)}
                        className={`py-2 rounded-xl text-xs font-bold border ${
                          pledgeAmount === amt
                            ? "bg-purple-600 text-white border-purple-600"
                            : "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        ₹{(amt / 100000).toFixed(0)} Lakhs
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={pledgeAmount}
                    onChange={(e) => setPledgeAmount(parseFloat(e.target.value))}
                    className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setPledgeModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm CSR Pledge</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
