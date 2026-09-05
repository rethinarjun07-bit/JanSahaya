import React from "react";
import Link from "next/link";
import { ShieldAlert, Flame, MapPin, ArrowLeft, Layers, Sparkles } from "lucide-react";
import db from "@/lib/db";
import LeafletMap from "@/components/leaflet-map";
import { PagePop, PopItem } from "@/components/page-pop-transition";

export const dynamic = "force-dynamic";

export default async function FullScreenMapPage() {
  const challenges = await db.challenge.findMany({
    where: { status: { not: "MERGED" } },
    select: {
      id: true,
      title: true,
      category: true,
      severity: true,
      urgencyScore: true,
      latitude: true,
      longitude: true,
      district: true,
      state: true,
      status: true,
      address: true,
      _count: {
        select: { upvotes: true, duplicates: true },
      },
    },
  });

  const formattedChallenges = challenges.map((c) => ({
    ...c,
    upvotesCount: c._count.upvotes,
    mergedCount: c._count.duplicates,
  }));

  return (
    <PagePop className="min-h-screen bg-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Bar */}
        <PopItem delay={0.05} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 font-serif">
                  National & Jharkhand GIS Disaster Heatmap
                </h1>
                <span className="px-2 py-0.2 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                  LIVE GIS TELEMETRY
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pulsing pins depict real-time severity levels across all 24 Jharkhand districts & Indian states.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500">Total Ground Incidents: <strong className="text-slate-900">{challenges.length}</strong></span>
            <Link
              href="/challenges/new"
              className="px-3.5 py-1.5 bg-gov-navy hover:bg-gov-navyLight text-white font-bold rounded-xl shadow-sm transition-colors"
            >
              + Post at Coordinates
            </Link>
          </div>
        </PopItem>

        {/* Dynamic Advanced Leaflet GIS Map Component */}
        <PopItem delay={0.15}>
          <LeafletMap challenges={formattedChallenges} height="680px" />
        </PopItem>
      </div>
    </PagePop>
  );
}
