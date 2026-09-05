"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, PhoneCall, Heart, ExternalLink, CheckCircle2 } from "lucide-react";
import { useLanguage } from "./language-provider";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t-4 border-gov-saffron">
      {/* 1. Emergency Helpline Bar */}
      <div className="bg-slate-950 py-3 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider">
            <PhoneCall className="w-4 h-4" /> 24/7 State Emergency Disaster Helplines:
          </div>
          <div className="flex items-center gap-4 flex-wrap text-slate-300 font-medium">
            <span>SDMA Control Room: <strong className="text-white font-mono">1070</strong></span>
            <span>National Emergency: <strong className="text-white font-mono">112</strong></span>
            <span>Ambulance Triage: <strong className="text-white font-mono">108</strong></span>
            <span>Mining Emergency: <strong className="text-white font-mono">1800-345-6677</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Portal Overview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg font-serif">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>{t("portalName")}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An intelligent digital platform connecting citizens, government departments, premier universities, and industry CSR leaders to crowdsource and co-solve disaster management & societal challenges across India.
            </p>
            <div className="inline-block px-2.5 py-1 bg-slate-800 rounded-lg text-[11px] text-amber-300 font-semibold border border-slate-700">
              Smart India Hackathon SIH26043
            </div>
          </div>

          {/* Col 2: Premier Academic Labs */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 pb-1 border-b border-slate-800">
              Partner Universities
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="hover:text-amber-400 transition-colors">Birla Institute of Technology, Mesra</li>
              <li className="hover:text-amber-400 transition-colors">IIT (ISM) Dhanbad</li>
              <li className="hover:text-amber-400 transition-colors">NIT Jamshedpur</li>
              <li className="hover:text-amber-400 transition-colors">Birsa Agricultural University</li>
              <li className="hover:text-amber-400 transition-colors">AIIMS Deoghar</li>
              <li className="hover:text-amber-400 transition-colors">Ranchi University</li>
            </ul>
          </div>

          {/* Col 3: Key Core Engines */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 pb-1 border-b border-slate-800">
              Differentiating Technology
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> TF-IDF Duplicate Detection
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> AI Problem Classification
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Explainable Solver Matcher
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Web Speech Voice Dictation
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Interactive GIS Disaster Heatmap
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Milestone-Gated CSR Escrow
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Portals */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 pb-1 border-b border-slate-800">
              Quick Portals
            </h4>
            <div className="space-y-2 text-xs">
              <Link href="/challenges/new" className="block text-slate-400 hover:text-white transition-colors">
                &rarr; Log New Ground Challenge
              </Link>
              <Link href="/map" className="block text-slate-400 hover:text-white transition-colors">
                &rarr; Full-Screen GIS Disaster Map
              </Link>
              <Link href="/admin/duplicates" className="block text-slate-400 hover:text-white transition-colors">
                &rarr; Duplicate Merge Console
              </Link>
              <Link href="/solver/dashboard" className="block text-slate-400 hover:text-white transition-colors">
                &rarr; Researcher Matched Feed
              </Link>
              <Link href="/industry" className="block text-slate-400 hover:text-white transition-colors">
                &rarr; CSR Sponsorship Portal
              </Link>
            </div>
          </div>
        </div>

        {/* 3. Bottom Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} JanSahaya &bull; Department of Disaster Management, Govt. of Jharkhand.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>WCAG 2.1 AA Compliant</span>
            <span>&bull;</span>
            <span>ISO 27001 Security Standard</span>
            <span>&bull;</span>
            <span>National Informatics Centre (NIC) Layout Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
