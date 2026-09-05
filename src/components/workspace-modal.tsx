"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Send,
  Users,
  Upload,
  Layers,
  Sparkles,
  Download,
  AlertCircle,
  Award,
} from "lucide-react";
import { sound } from "@/lib/sound";
import { triggerConfetti } from "@/components/celebration-effects";

export interface WorkspaceMilestone {
  id: string;
  order: number;
  title: string;
  description: string;
  targetDate?: string | null;
  status: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED" | string;
  proofUrl?: string | null;
  notes?: string | null;
}

export interface WorkspaceTeamMember {
  name: string;
  role: string;
  institution: string;
  avatar?: string;
  isLead?: boolean;
}

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeTitle: string;
  challengeDistrict: string;
  challengeCategory: string;
  universityName?: string;
  initialMilestones?: WorkspaceMilestone[];
  currentUserName?: string;
  currentUserRole?: string;
}

export function WorkspaceModal({
  isOpen,
  onClose,
  challengeTitle,
  challengeDistrict,
  challengeCategory,
  universityName = "Birla Institute of Technology, Mesra",
  initialMilestones,
  currentUserName = "Active Innovator",
  currentUserRole = "SOLVER",
}: WorkspaceModalProps) {
  const [activeTab, setActiveTab] = useState<"milestones" | "team" | "blueprints" | "chat">("milestones");

  // Milestones state
  const [milestones, setMilestones] = useState<WorkspaceMilestone[]>(
    initialMilestones && initialMilestones.length > 0
      ? initialMilestones
      : [
          {
            id: "m-1",
            order: 1,
            title: "Phase 1: LiDAR & Drone Topographic Survey",
            description: "High-resolution elevation contour mapping and hydrology runoff simulation on-site.",
            targetDate: "2026-09-15",
            status: "APPROVED",
            proofUrl: "/uploads/drone_contour_survey_v1.pdf",
            notes: "Verified by JSDMA Geologist with zero boundary deviations.",
          },
          {
            id: "m-2",
            order: 2,
            title: "Phase 2: IoT Sensor Subterranean Array Deployment",
            description: "Install wireless temperature & carbon monoxide telemetry probes across critical hot spots.",
            targetDate: "2026-10-05",
            status: "SUBMITTED",
            proofUrl: "/uploads/iot_probe_telemetry_schema.pdf",
            notes: "Telemetry packet latency < 450ms tested on 4G rural node.",
          },
          {
            id: "m-3",
            order: 3,
            title: "Phase 3: Slag Nitrogen Gas Purging & Seal Grouting",
            description: "Pneumatic injection of high-density fly-ash slurries to cut off subterranean oxygen supply.",
            targetDate: "2026-11-20",
            status: "PENDING",
            proofUrl: null,
            notes: "Co-sponsored under Tata Steel CSR Disaster Mitigation Pledges.",
          },
        ]
  );

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDate, setNewDate] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Team state
  const [teamMembers] = useState<WorkspaceTeamMember[]>([
    {
      name: "Dr. Aarav Mehta",
      role: "Principal Investigator & Drone Lead",
      institution: universityName,
      isLead: true,
    },
    {
      name: "Ananya Sengupta",
      role: "IoT Embedded Systems Lead (M.Tech)",
      institution: universityName,
    },
    {
      name: "Sri Rajesh Kumar Sinha, IAS",
      role: "Govt. Statutory Nodal Officer",
      institution: "Jharkhand State Disaster Management Authority",
    },
    {
      name: "Vikram Rathore",
      role: "CSR Project Sponsor & Field Auditor",
      institution: "Tata Steel Foundation, Jamshedpur",
    },
  ]);

  // Blueprints state
  const [blueprints] = useState([
    {
      id: "bp-1",
      title: "Statutory On-Site Inspection Clearance",
      type: "PDF (Official Sign-off)",
      size: "2.4 MB",
      date: "02 Sep 2026",
      approvedBy: "Govt. of Jharkhand",
    },
    {
      id: "bp-2",
      title: "GIS Elevation & Hydrological Vector Map",
      type: "GeoJSON / Shapefile",
      size: "14.8 MB",
      date: "03 Sep 2026",
      approvedBy: "BIT Mesra Remote Sensing Lab",
    },
    {
      id: "bp-3",
      title: "LoRaWAN Sensor Firmware Binary (v1.2.0)",
      type: "Embedded C / Hex",
      size: "512 KB",
      date: "04 Sep 2026",
      approvedBy: "IIT ISM Dhanbad Tech Incubator",
    },
  ]);

  // Chat state
  const [chatLog, setChatLog] = useState([
    {
      id: "c1",
      sender: "Dr. Aarav Mehta",
      role: "SOLVER",
      text: "Drone thermal mapping data has been processed. Temperature anomalies identified along the eastern transect.",
      time: "09:30 AM",
    },
    {
      id: "c2",
      sender: "Sri Rajesh Kumar Sinha, IAS",
      role: "ADMIN",
      text: "District Administration has cleared emergency road access and authorized the technical survey team.",
      time: "10:15 AM",
    },
    {
      id: "c3",
      sender: "Tata Steel CSR",
      role: "INDUSTRY",
      text: "Equipment co-sponsorship of Rs 4,50,000 released for the high-density slurry pump modules under CSR.",
      time: "10:45 AM",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  if (!isOpen) return null;

  // Velocity calculation
  const approvedCount = milestones.filter((m) => m.status === "APPROVED").length;
  const progressPercent = milestones.length > 0 ? Math.round((approvedCount / milestones.length) * 100) : 0;

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    sound.playClick();
    const newM: WorkspaceMilestone = {
      id: `m-${Date.now()}`,
      order: milestones.length + 1,
      title: newTitle,
      description: newDesc,
      targetDate: newDate || null,
      status: "PENDING",
      proofUrl: null,
      notes: "Newly scheduled phase milestone by university research squad.",
    };
    setMilestones([...milestones, newM]);
    setNewTitle("");
    setNewDesc("");
    setNewDate("");
    setIsAdding(false);
    triggerConfetti();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sound.playClick();
    const newMsg = {
      id: `c-${Date.now()}`,
      sender: currentUserName,
      role: currentUserRole,
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatLog((prev) => [...prev, newMsg]);
    setChatInput("");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-gov-navy to-slate-950 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                Collaborative Solution Workspace
              </span>
              <span className="text-[10px] font-semibold bg-white/10 text-slate-300 px-2 py-0.5 rounded border border-white/10">
                {challengeCategory} &bull; {challengeDistrict}
              </span>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Live SIH Workspace
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold font-serif line-clamp-1">{challengeTitle}</h2>
            <p className="text-xs text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Assigned Research Partner: </span>
              <span className="text-white font-semibold">{universityName}</span>
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 sm:gap-4 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab("milestones");
            }}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "milestones"
                ? "border-gov-navy text-gov-navy font-extrabold"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Sprint Milestones ({milestones.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab("team");
            }}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "team"
                ? "border-gov-navy text-gov-navy font-extrabold"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>Innovation Roster ({teamMembers.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab("blueprints");
            }}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "blueprints"
                ? "border-gov-navy text-gov-navy font-extrabold"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4 text-purple-600" />
            <span>Blueprints & Evidence</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab("chat");
            }}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "chat"
                ? "border-gov-navy text-gov-navy font-extrabold"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Send className="w-4 h-4 text-emerald-600" />
            <span>Technical Sprint Chat</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: MILESTONES */}
          {activeTab === "milestones" && (
            <div className="space-y-6">
              {/* Velocity Progress Header */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Deployment Velocity</div>
                  <div className="text-lg font-extrabold text-gov-navy flex items-center gap-2">
                    <span>{progressPercent}% Milestones Approved</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                      {approvedCount} of {milestones.length} Completed
                    </span>
                  </div>
                </div>
                <div className="w-44 bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Milestones List */}
              <div className="space-y-3">
                {milestones.map((m, idx) => (
                  <div
                    key={m.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-start justify-between gap-4 hover:border-gov-navy/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gov-navy/10 text-gov-navy font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              m.status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-800"
                                : m.status === "SUBMITTED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {m.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{m.description}</p>
                        {m.notes && (
                          <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                            &ldquo;{m.notes}&rdquo;
                          </div>
                        )}
                        {m.targetDate && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-slate-400" /> Target Date: {m.targetDate}
                          </div>
                        )}
                      </div>
                    </div>

                    {m.proofUrl && (
                      <a
                        href={m.proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
                      >
                        <Download className="w-3 h-3 text-slate-500" />
                        <span>Proof PDF</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Milestone Form */}
              {isAdding ? (
                <form onSubmit={handleAddMilestone} className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-3 animate-in fade-in">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-amber-600" />
                    <span>Schedule New Technical Sprint Milestone</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Phase Title (e.g., Pilot Prototyping)"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <textarea
                    placeholder="Milestone technical scope and deliverables..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gov-navy text-white hover:bg-gov-navyLight shadow transition-colors"
                    >
                      Save Milestone
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsAdding(true);
                  }}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 hover:border-gov-navy text-slate-600 hover:text-gov-navy text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Technical Milestone Phase
                </button>
              )}
            </div>
          )}

          {/* TAB 2: TEAM ROSTER */}
          {activeTab === "team" && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Institutional collaborative taskforce assigned to this disaster challenge under Section 135 & state partnership guidelines:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teamMembers.map((member, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-gov-navy to-gov-navyLight text-white flex items-center justify-center font-bold text-sm shadow">
                      {member.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{member.name}</span>
                        {member.isLead && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                            Team Lead
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gov-navy font-medium">{member.role}</div>
                      <div className="text-[10px] text-slate-400">{member.institution}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: BLUEPRINTS & EVIDENCE */}
          {activeTab === "blueprints" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Official technical assets, CAD drawings, and sensor schematics:</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">SHA-256 Verified</span>
              </div>
              <div className="space-y-2.5">
                {blueprints.map((bp) => (
                  <div
                    key={bp.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{bp.title}</h4>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {bp.type} &bull; {bp.size} &bull; Verified by {bp.approvedBy}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => sound.playClick()}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: THREADED SPRINT CHAT */}
          {activeTab === "chat" && (
            <div className="flex flex-col h-[380px]">
              <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 mb-3">
                {chatLog.map((msg) => (
                  <div key={msg.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{msg.sender}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            msg.role === "ADMIN"
                              ? "bg-amber-100 text-amber-800"
                              : msg.role === "INDUSTRY"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {msg.role}
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-400">{msg.time}</span>
                    </div>
                    <p className="text-xs text-slate-700">{msg.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Post technical update or nodal clearance note..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-gov-navy"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gov-navy hover:bg-gov-navyLight text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
