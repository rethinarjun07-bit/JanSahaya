"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { BarChart3, PieChart as PieIcon, TrendingUp, Layers, Award } from "lucide-react";
import { PopCard, PopItem } from "@/components/page-pop-transition";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

const SEVERITY_COLORS = {
  CRITICAL: "#DC2626",
  HIGH: "#EA580C",
  MEDIUM: "#EAB308",
  LOW: "#3B82F6",
};

export function AnalyticsClient({ data }: Props) {
  const { summary, categoryData, severityData, districtData, statusFunnel } = data;

  const pieData = severityData.map((s: { name: string; value: number }) => ({
    name: `${s.name} Priority`,
    value: s.value,
    color: SEVERITY_COLORS[s.name as keyof typeof SEVERITY_COLORS] || "#64748b",
  }));

  return (
    <div className="space-y-8">
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PopCard delay={0.05} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Total Ground Challenges</div>
          <div className="text-3xl font-extrabold text-slate-900">{summary.totalChallenges}</div>
          <div className="text-[11px] text-slate-400 mt-1">From {summary.districtsCovered} districts</div>
        </PopCard>

        <PopCard delay={0.1} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Active Tech Proposals</div>
          <div className="text-3xl font-extrabold text-blue-600">{summary.activeSolutions}</div>
          <div className="text-[11px] text-emerald-600 mt-1">{summary.verifiedSolutions} Verified by Govt</div>
        </PopCard>

        <PopCard delay={0.15} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Deduplication Savings</div>
          <div className="text-3xl font-extrabold text-amber-600">{summary.duplicateMergesCount || 3} Merges</div>
          <div className="text-[11px] text-slate-400 mt-1">Consolidated reports</div>
        </PopCard>

        <PopCard delay={0.2} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Pledged CSR Capital</div>
          <div className="text-3xl font-extrabold text-gov-navy">{summary.csrPledgedCrores}</div>
          <div className="text-[11px] text-purple-600 mt-1">Section 135 Co-Sponsorship</div>
        </PopCard>
      </div>

      {/* Chart Grid: Category Breakdown & Severity Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <PopItem delay={0.25} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gov-navy" />
            <h3 className="text-base font-bold text-slate-900 font-serif">
              Challenges by Sector & Category
            </h3>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "12px", color: "white", fontSize: "12px" }}
                />
                <Bar dataKey="value" fill="#0B2545" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PopItem>

        {/* Severity Distribution Pie */}
        <PopItem delay={0.3} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon className="w-5 h-5 text-gov-saffron" />
            <h3 className="text-base font-bold text-slate-900 font-serif">
              Disaster Severity Distribution
            </h3>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry: { color: string }, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "12px", color: "white", fontSize: "12px" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </PopItem>
      </div>

      {/* District Incident Frequency */}
      <PopItem delay={0.35} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 font-serif mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <span>Top Affected Districts (Incident Density)</span>
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={districtData} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#0f172a", fontWeight: "bold" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "12px", color: "white", fontSize: "12px" }}
              />
              <Bar dataKey="count" fill="#F57C00" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PopItem>

      {/* Solution Lifecycle Stage Gates Funnel */}
      <PopItem delay={0.4} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 font-serif mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <span>National Innovation Lifecycle Funnel</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
          {statusFunnel.map((step: { stage: string; count: number }, idx: number) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="text-2xl font-black text-gov-navy">{step.count}</div>
              <div className="text-xs font-bold text-slate-700 mt-1">{step.stage}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Phase {idx + 1}</div>
            </div>
          ))}
        </div>
      </PopItem>
    </div>
  );
}
