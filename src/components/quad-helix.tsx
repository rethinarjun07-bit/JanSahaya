"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Landmark, GraduationCap, Building2, ArrowUpRight, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
import { useLanguage } from "./language-provider";

export type QuadRole = "CITIZEN" | "GOVERNMENT" | "UNIVERSITY" | "INDUSTRY";

interface NodeData {
  id: QuadRole;
  title: string;
  tagline: string;
  badge: string;
  color: string;
  accentBg: string;
  borderColor: string;
  textColor: string;
  icon: React.ElementType;
  position: { x: number; y: number };
  actions: string[];
  deliverable: string;
}

export function QuadHelix() {
  const { language } = useLanguage();
  const [activeRole, setActiveRole] = useState<QuadRole>("CITIZEN");

  const nodes: Record<QuadRole, NodeData> = {
    CITIZEN: {
      id: "CITIZEN",
      title: language === "hi" ? "नागरिक समाज" : language === "ur" ? "شہری سماج" : "Citizen & Community",
      tagline: language === "hi" ? "जमीनी समस्याओं की रिपोर्ट और ट्रैकिंग" : language === "ur" ? "بنیادی مسائل کی رپورٹ اور ٹریکنگ" : "Ground Problem Reporting & Civic Tracking",
      badge: language === "hi" ? "स्तंभ १: आधार" : language === "ur" ? "ستون ۱" : "Pillar 1: Intake",
      color: "#C05621",
      accentBg: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-900",
      icon: Users,
      position: { x: 20, y: 25 },
      actions: [
        language === "hi" ? "ध्वनि, फोटो व जीपीएस से समस्या दर्ज करें" : language === "ur" ? "آواز، تصویر اور جی پی ایس سے مسئلہ درج کریں" : "Submit ground issues via Voice, Photo, and GPS",
        language === "hi" ? "निजी ट्रैकिंग टोकन से वास्तविक स्थिति देखें" : language === "ur" ? "ریئل ٹائم میں پیش رفت کو ٹریک کریں" : "Track real-time resolution milestone status",
        language === "hi" ? "समाधान के बाद प्रभाव का सत्यापन करें" : language === "ur" ? "حل کے بعد اثرات کی تصدیق کریں" : "Provide ground confirmation once solved",
      ],
      deliverable: language === "hi" ? "नागरिक आवाज व सत्यापन" : language === "ur" ? "شہری آواز" : "Verified Ground Need & Feedback",
    },
    GOVERNMENT: {
      id: "GOVERNMENT",
      title: language === "hi" ? "प्रशासन व नोडल अधिकारी" : language === "ur" ? "سرکاری انتظامیہ" : "Government & Nodal Officers",
      tagline: language === "hi" ? "आधिकारिक सत्यापन, प्राथमिकता और अंतिम निर्णय" : language === "ur" ? "سرکاری تصدیق اور حتمی فیصلہ" : "Statutory Verification, Priority & Final Decision",
      badge: language === "hi" ? "स्तंभ २: प्राधिकरण" : language === "ur" ? "ستون ۲" : "Pillar 2: Authority",
      color: "#1A3D2F",
      accentBg: "bg-emerald-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-950",
      icon: Landmark,
      position: { x: 80, y: 25 },
      actions: [
        language === "hi" ? "एआई वर्गीकरण की ऑन-ग्राउंड समीक्षा" : language === "ur" ? "اے آئی کی رپورٹ کی تصدیق" : "Audit AI classification & duplicate detection reports",
        language === "hi" ? "विभागीय अधिकार क्षेत्र और प्राथमिकता तय करना" : language === "ur" ? "ترجیحات اور ذمہ داری کا تعین" : "Set departmental jurisdiction and SLA priority",
        language === "hi" ? "विश्वविद्यालय समाधानों का आधिकारिक अनुमोदन" : language === "ur" ? "تحقیقی حل کو حتمی منظوری دینا" : "Issue statutory clearance for university solutions",
      ],
      deliverable: language === "hi" ? "संवैधानिक स्वीकृति व संसाधन" : language === "ur" ? "سرکاری منظوری" : "Statutory Authority & Policy Sanction",
    },
    UNIVERSITY: {
      id: "UNIVERSITY",
      title: language === "hi" ? "विश्वविद्यालय व शोधकर्ता" : language === "ur" ? "یونیورسٹی اور محققین" : "Universities & Research Labs",
      tagline: language === "hi" ? "वैज्ञानिक शोध, प्रोटोटाइप और तकनीकी समाधान" : language === "ur" ? "سائنسی تحقیق اور عملی حل" : "Applied R&D, Pilot Prototypes & Deep Science",
      badge: language === "hi" ? "स्तंभ ३: नवाचार" : language === "ur" ? "ستون ۳" : "Pillar 3: Innovation",
      color: "#245340",
      accentBg: "bg-teal-50",
      borderColor: "border-teal-200",
      textColor: "text-teal-950",
      icon: GraduationCap,
      position: { x: 20, y: 75 },
      actions: [
        language === "hi" ? "बीआईटी मेसरा, आईआईटी धनबाद आदि के बहुविषयक दल" : language === "ur" ? "یونیورسٹی ریسرچرز کی ٹیمیں" : "Multi-disciplinary faculty & student solver teams (BIT Mesra, IIT ISM)",
        language === "hi" ? "बजट, चरणबद्ध समयसीमा व प्रभाव विश्लेषण के साथ प्रस्ताव" : language === "ur" ? "بجٹ اور ٹائم لائن کے ساتھ حل تجویز کرنا" : "Submit detailed solution architecture with cost estimates",
        language === "hi" ? "जमीनी स्तर पर प्रायोगिक परीक्षण (पायलट डिप्लॉयमेंट)" : language === "ur" ? "پائلٹ ٹیسٹنگ اور نفاذ" : "Deploy field prototypes and sensor testbeds",
      ],
      deliverable: language === "hi" ? "लागत-प्रभावी व्यावहारिक नवाचार" : language === "ur" ? "عملی سائنسی حل" : "Scalable Engineered Solutions",
    },
    INDUSTRY: {
      id: "INDUSTRY",
      title: language === "hi" ? "उद्योग व सीएसआर प्रतिष्ठान" : language === "ur" ? "صنعت اور سی ایس آر" : "Industry & CSR Partners",
      tagline: language === "hi" ? "धारा १३५ सीएसआर अनुदान, परामर्श और बड़े पैमाने पर विस्तार" : language === "ur" ? "فنڈنگ اور کارپوریٹ رہنمائی" : "Section 135 CSR Grants, Mentorship & Scale",
      badge: language === "hi" ? "स्तंभ ४: पोषण" : language === "ur" ? "ستون ۴" : "Pillar 4: Sustenance",
      color: "#B45309",
      accentBg: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-950",
      icon: Building2,
      position: { x: 80, y: 75 },
      actions: [
        language === "hi" ? "टाटा स्टील, कोल इंडिया आदि द्वारा सत्यापित परियोजनाओं को वित्तपोषण" : language === "ur" ? "کارپوریٹ فنڈنگ کی فراہمی" : "Pledge CSR capital towards vetted district challenges",
        language === "hi" ? "माइलस्टोन गेटवे पर पारदर्शी फंड रिलीज" : language === "ur" ? "مرحلہ وار فنڈز کی منتقلی" : "Release tranches against verified milestone progress",
        language === "hi" ? "व्यावसायिक उत्पादन एवं राष्ट्रव्यापी विस्तार" : language === "ur" ? "بڑے پیمانے پر توسیع" : "Scale successful pilots into sustainable public infrastructure",
      ],
      deliverable: language === "hi" ? "वित्तीय संबल व औद्योगिक विशेषज्ञता" : language === "ur" ? "فنڈز اور وسائل" : "Catalytic Capital & Industrial Scale",
    },
  };

  const current = nodes[activeRole];

  return (
    <div className="w-full bg-[#FAF7F2] border border-[#E8DFC8] rounded-3xl p-6 sm:p-10 shadow-sm transition-all duration-300">
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE8DF] text-[#1A3D2F] text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#C05621]" />
          <span>{language === "hi" ? "चतुर्भुज सहयोग मॉडल (SIH26043)" : "Quad-Helix Collaboration Model"}</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 leading-tight">
          {language === "hi"
            ? "चार स्तंभ — एक साझा संकल्प"
            : language === "ur"
            ? "چار ستون — ایک مقصد"
            : "Four Pillars. One Shared Civic Purpose."}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 font-normal leading-relaxed">
          {language === "hi"
            ? "नागरिक केवल समस्या दर्ज नहीं करते; जनसहाय प्रत्येक समस्या को समाधान, वित्तपोषण और प्रभाव के संगठित पथ पर ले जाता है।"
            : "Citizens do not merely report problems. JanSahaya orchestrates an unbroken path from intake to statutory sanction, academic discovery, and corporate scale."}
        </p>
      </div>

      {/* Interactive Helix Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Visual Nexus Canvas */}
        <div className="lg:col-span-7 relative flex items-center justify-center p-4 min-h-[340px] sm:min-h-[400px]">
          {/* SVG Connection Lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {(Object.keys(nodes) as QuadRole[]).map((key) => {
              const node = nodes[key];
              const isActive = activeRole === key;
              return (
                <path
                  key={key}
                  d={`M 50 50 Q ${50 + (node.position.x - 50) * 0.4} ${50 + (node.position.y - 50) * 0.1}, ${node.position.x} ${node.position.y}`}
                  fill="none"
                  stroke={isActive ? node.color : "#DDD2C3"}
                  strokeWidth={isActive ? "2" : "0.9"}
                  strokeDasharray={isActive ? "none" : "2,2"}
                  className="transition-all duration-500 ease-out"
                />
              );
            })}
          </svg>

          {/* Central JanSahaya Core Nexus */}
          <div className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#1A3D2F] text-white shadow-xl border-4 border-[#FAF7F2] flex flex-col items-center justify-center text-center p-2 group">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping mb-1" />
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-amber-200 uppercase">
              Core Nexus
            </span>
            <span className="font-serif font-extrabold text-sm sm:text-base tracking-tight text-white leading-none mt-0.5">
              JanSahaya
            </span>
            <span className="text-[9px] text-slate-300 font-medium mt-1">
              Govt of Jharkhand
            </span>
          </div>

          {/* 4 Interactive Nodes */}
          {(Object.keys(nodes) as QuadRole[]).map((key) => {
            const node = nodes[key];
            const Icon = node.icon;
            const isActive = activeRole === key;
            const isTop = node.position.y < 50;
            const isLeft = node.position.x < 50;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveRole(key)}
                onMouseEnter={() => setActiveRole(key)}
                aria-pressed={isActive}
                className={`absolute z-20 transition-all duration-300 flex items-center gap-2 p-2.5 sm:p-3 rounded-2xl border ${
                  isTop ? "top-2 sm:top-6" : "bottom-2 sm:bottom-6"
                } ${isLeft ? "left-2 sm:left-6" : "right-2 sm:right-6"} ${
                  isActive
                    ? "bg-white border-slate-900/40 shadow-lg scale-105"
                    : "bg-white/80 border-[#E8DFC8] hover:bg-white hover:border-slate-400/50 shadow-sm"
                }`}
                style={{
                  boxShadow: isActive ? `0 10px 25px -5px ${node.color}25` : undefined,
                }}
              >
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white transition-transform duration-300 shrink-0"
                  style={{ backgroundColor: node.color }}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-none">
                    {node.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5 leading-snug">
                    {node.title.split(" ")[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Info Details Panel */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-white rounded-2xl border border-[#E8DFC8] p-5 sm:p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className="text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider text-white"
                  style={{ backgroundColor: current.color }}
                >
                  {current.badge}
                </span>
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1A3D2F]" />
                  {language === "hi" ? "सत्यापित भूमिका" : "Governed Role"}
                </span>
              </div>

              <h4 className="text-lg sm:text-xl font-bold font-serif text-slate-900">
                {current.title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 mb-4 leading-relaxed">
                {current.tagline}
              </p>

              <div className="space-y-2.5 mb-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  {language === "hi" ? "प्रमुख जिम्मेदारियां व कार्य" : "Key Responsibilities in Platform"}
                </span>
                {current.actions.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                    <CheckCircle2
                      className="w-4 h-4 shrink-0 mt-0.5"
                      style={{ color: current.color }}
                    />
                    <span>{act}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#EFE8DF] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {language === "hi" ? "मुख्य योगदान" : "Output Contribution"}
                  </span>
                  <span className="font-bold text-slate-900">{current.deliverable}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const roles: QuadRole[] = ["CITIZEN", "GOVERNMENT", "UNIVERSITY", "INDUSTRY"];
                    const nextIdx = (roles.indexOf(activeRole) + 1) % roles.length;
                    setActiveRole(roles[nextIdx]);
                  }}
                  className="inline-flex items-center gap-1 font-bold text-[#1A3D2F] hover:text-[#2D6A4F] transition-colors"
                >
                  <span>{language === "hi" ? "अगला स्तंभ" : "Next Pillar"}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
