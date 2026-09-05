"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Flame,
  Zap,
  Building2,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Sparkles,
  Mic,
  Search,
} from "lucide-react";
import { useLanguage } from "./language-provider";
import { PagePop, PopItem, PopCard } from "@/components/page-pop-transition";

interface FeaturedChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  district: string;
  state: string;
  aiTags: string | null;
  _count: {
    solutions: number;
    upvotes: number;
  };
}

interface HomeClientProps {
  totalChallenges: number;
  totalSolutions: number;
  totalSolvers: number;
  criticalCount: number;
  featuredChallenges: FeaturedChallenge[];
}

export function HomeClient({
  totalChallenges,
  totalSolutions,
  totalSolvers,
  criticalCount,
  featuredChallenges,
}: HomeClientProps) {
  const { t, language } = useLanguage();

  // Localized live ticker
  const tickerText =
    language === "hi"
      ? "🚨 रांची में मानसून बाढ़ चेतावनी • झरिया में भूमिगत कोयला आग गैस टेलीमेट्री सक्रिय • पलामू फ्लोराइड जल शोधन पायलट स्वीकृत • साहिबगंज में गंगा नदी तट कटाव निगरानी • राज्य आपदा आपातकाल के लिए 1070 पर कॉल करें"
      : language === "ur"
      ? "🚨 رانچی میں مون سون سیلاب کی وارننگ • جھریا میں زیر زمین کوئلے کی آگ کی گیس مانیٹرنگ فعال • پلامو فلورائیڈ پانی صاف کرنے کا پائلٹ منظور • صاحب گنج میں دریائے گنگا کے کٹاؤ کی نگرانی • ہنگامی صورتحال کے لیے 1070 پر کال کریں"
      : "🚨 Monsoon Flood Warning in Ranchi • Subterranean Coal Fire Gas Telemetry Active in Jharia • Palamu Fluoride Water Purification Pilot Sanctioned • Ganga Riverbank Soil Erosion Monitoring at Sahibganj • Call 1070 for State Disaster Emergency";

  return (
    <PagePop className="flex flex-col min-h-screen">
      {/* 1. Emergency Live Alert Ticker */}
      <PopItem delay={0.05} className="bg-amber-500 text-slate-950 font-semibold text-xs py-2 px-4 shadow-sm border-b border-amber-600">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <span className="uppercase tracking-wider font-extrabold text-[11px] bg-red-600 text-white px-2 py-0.5 rounded">
              {language === "hi" ? "उच्च सतर्कता" : language === "ur" ? "اعلیٰ الرٹ" : "High Alert Triage"}
            </span>
          </div>
          <div className="overflow-hidden whitespace-nowrap text-xs font-medium flex-1">
            <span className="inline-block animate-marquee">{tickerText}</span>
          </div>
          <Link
            href="/map"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-slate-950 underline hover:text-white transition-colors shrink-0"
          >
            <span>{t("navMap")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </PopItem>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-gov-navy to-slate-900 text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <PopItem delay={0.1}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-semibold mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t("subtagline")}</span>
            </div>
          </PopItem>

          <PopItem delay={0.15}>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-serif max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
              {t("heroHeading")}
            </h1>
          </PopItem>

          <PopItem delay={0.2}>
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
              {t("heroSubheading")}
            </p>
          </PopItem>

          <PopItem delay={0.25} className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
            <Link
              href="/challenges/new"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-gov-saffron to-amber-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Mic className="w-4 h-4" />
              <span>{t("navPostChallenge")}</span>
            </Link>
            <Link
              href="/challenges"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 text-slate-300" />
              <span>
                {t("navChallenges")} ({totalChallenges})
              </span>
            </Link>
          </PopItem>

          {/* Key Metrics Counter Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <PopItem delay={0.28} hoverEffect className="bg-white/5 backdrop-blur-md border border-white/10 p-4 sm:p-5 rounded-2xl text-left">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {t("statsTotalChallenges")}
              </div>
              <div className="text-3xl font-extrabold text-white">{totalChallenges}</div>
              <div className="text-[11px] text-amber-400 font-medium mt-1 flex items-center gap-1">
                <Flame className="w-3 h-3 text-red-400" /> {criticalCount} {t("criticalBadge")}
              </div>
            </PopItem>

            <PopItem delay={0.32} hoverEffect className="bg-white/5 backdrop-blur-md border border-white/10 p-4 sm:p-5 rounded-2xl text-left">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {t("statsActiveResolutions")}
              </div>
              <div className="text-3xl font-extrabold text-white">{totalSolutions}</div>
              <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Pilot Deployed
              </div>
            </PopItem>

            <PopItem delay={0.36} hoverEffect className="bg-white/5 backdrop-blur-md border border-white/10 p-4 sm:p-5 rounded-2xl text-left">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {language === "hi" ? "साझेदार शोधकर्ता" : language === "ur" ? "تحقیقی شراکت دار" : "Partnered Researchers"}
              </div>
              <div className="text-3xl font-extrabold text-white">{totalSolvers}</div>
              <div className="text-[11px] text-blue-300 font-medium mt-1 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> BIT Mesra &bull; IIT ISM
              </div>
            </PopItem>

            <PopItem delay={0.4} hoverEffect className="bg-white/5 backdrop-blur-md border border-white/10 p-4 sm:p-5 rounded-2xl text-left">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {t("statsPledgedFunds")}
              </div>
              <div className="text-3xl font-extrabold text-amber-300">₹4.85 Cr</div>
              <div className="text-[11px] text-slate-400 font-medium mt-1 flex items-center gap-1">
                <span>Tata Steel &bull; Coal India</span>
              </div>
            </PopItem>
          </div>
        </div>
      </section>

      {/* 3. Four-Step Collaborative Workflow */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-gov-saffron uppercase tracking-wider bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              {language === "hi" ? "मानक संचालन प्रक्रिया" : language === "ur" ? "معیاری طریقہ کار" : "Standard Operating Procedure"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3 font-serif">
              {t("howItWorks")}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              {language === "hi"
                ? "नागरिक समस्या रिपोर्टिंग से लेकर आधिकारिक नोडल सत्यापन और बहु-संस्थान परिनियोजन तक।"
                : language === "ur"
                ? "شہری مسئلہ رپورٹنگ سے لے کر سرکاری نوڈل افسر کی تصدیق اور ہمہ جہت نفاذ تک۔"
                : "From on-ground citizen voice intake to official nodal officer verification and multi-institution deployment."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-gov-navy flex items-center justify-center font-extrabold text-lg mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{t("step1Title")}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t("step1Desc")}</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-extrabold text-lg mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{t("step2Title")}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t("step2Desc")}</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-extrabold text-lg mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{t("step3Title")}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t("step3Desc")}</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-lg mb-4">
                4
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{t("step4Title")}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t("step4Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Priority Challenges */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                <h2 className="text-2xl font-bold text-slate-900 font-serif">
                  {language === "hi"
                    ? "उच्च प्राथमिकता वाली समस्याएं"
                    : language === "ur"
                    ? "اعلیٰ ترجیحی عوامی مسائل"
                    : "High-Priority Ground Challenges"}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {language === "hi"
                  ? "गंभीर समस्याएं जिन्हें तत्काल अनुसंधान सहायता एवं सीएसआर अनुदान की आवश्यकता है।"
                  : language === "ur"
                  ? "سنگین مسائل جنہیں فوری تحقیقی معاونت اور سی ایس آر فنڈنگ کی ضرورت ہے۔"
                  : "Real challenges requiring urgent multi-disciplinary research intervention and CSR grants."}
              </p>
            </div>

            <Link
              href="/challenges"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              <span>
                {language === "hi"
                  ? `सभी ${totalChallenges} समस्याएं देखें`
                  : language === "ur"
                  ? `تمام ${totalChallenges} مسائل دیکھیں`
                  : `Explore All ${totalChallenges} Challenges`}
              </span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredChallenges.map((item, idx) => {
              const tags = item.aiTags ? JSON.parse(item.aiTags) : [];
              const isCritical = item.severity === "CRITICAL";

              return (
                <PopCard
                  key={item.id}
                  delay={0.1 + idx * 0.05}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-gov-navyLight/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between p-5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider ${
                          isCritical
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {item.severity} {language === "hi" ? "चेतावनी" : language === "ur" ? "الرٹ" : "ALERT"}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {item.district}, {item.state}
                      </span>
                    </div>

                    <Link href={`/challenges/${item.id}`} className="block group">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-gov-navy transition-colors line-clamp-2 leading-snug mb-2">
                        {item.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                      {item.description}
                    </p>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {tags.slice(0, 3).map((tag: string, tidx: number) => (
                          <span
                            key={tidx}
                            className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-slate-500 font-medium">
                      <span>💡 {item._count.solutions} {language === "hi" ? "समाधान" : language === "ur" ? "حل" : "Solutions"}</span>
                      <span>👍 {item._count.upvotes} {language === "hi" ? "समर्थन" : language === "ur" ? "حمایت" : "Votes"}</span>
                    </div>

                    <Link
                      href={`/challenges/${item.id}`}
                      className="text-xs font-bold text-gov-navy hover:text-gov-navyLight flex items-center gap-1"
                    >
                      <span>{language === "hi" ? "विवरण देखें" : language === "ur" ? "تفصیلات" : "Details"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </PopCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. 7 Differentiators Callout Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800">
              SIH26043 Innovation Pillars
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif mt-3 text-white">
              {language === "hi"
                ? "7 प्रमुख तकनीकी विभेदक"
                : language === "ur"
                ? "7 بنیادی تکنیکی خصوصیات"
                : "The 7 Technological Differentiators"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-amber-400 font-bold text-sm mb-1">
                {language === "hi" ? "1. प्रतिरूप पहचान व विलय" : language === "ur" ? "1. نقل کی شناخت اور انضمام" : "1. Duplicate Detection & Merge"}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === "hi"
                  ? "टीएफ-आईडीएफ एवं कोसाइन समानता नागरिक को सतर्क करती है और नोडल अधिकारियों को विलय कंसोल प्रदान करती है।"
                  : language === "ur"
                  ? "ٹی ایف-آئی ڈی ایف مماثلت صارفین کو انتباہ کرتی ہے اور افسران کو انضمام کنسول فراہم کرتی ہے۔"
                  : "In-engine TF-IDF & Cosine similarity warns users during intake and equips Govt Admins with a side-by-side diff merge console."}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-amber-400 font-bold text-sm mb-1">
                {language === "hi" ? "2. स्वचालित समस्या वर्गीकरण" : language === "ur" ? "2. خودکار درجہ بندی" : "2. Automatic Classification"}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === "hi"
                  ? "एनएलपी समस्या की गंभीरता (1-100) का आकलन करता है और संबंधित विशेषज्ञ संस्थानों को टैग करता है।"
                  : language === "ur"
                  ? "این ایل پی مسائل کی درجہ بندی کرتا ہے اور 1-100 تک ارجنسی اسکور کا حساب لگاتا ہے۔"
                  : "NLP problem segregation categorizes ground issues, extracts domain keywords, and computes an automated 1-100 urgency score."}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-amber-400 font-bold text-sm mb-1">
                {language === "hi" ? "3. पारदर्शी विशेषज्ञता मिलान" : language === "ur" ? "3. شفاف ماہرانہ میچنگ" : "3. Explainable Expertise Match"}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === "hi"
                  ? "शोधकर्ताओं (बीआईटी मेसरा, आईआईटी धनबाद) के साथ पूर्ण पारदर्शिता स्कोर के साथ समस्याओं का मिलान।"
                  : language === "ur"
                  ? "محققین کے ساتھ مکمل شفافیت کے ساتھ مسائل کو میچ کیا جاتا ہے۔"
                  : "Multi-factor scoring algorithm matches problems to researchers (BIT Mesra, IIT ISM Dhanbad) with complete transparency bars."}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-amber-400 font-bold text-sm mb-1">
                {language === "hi" ? "4. बहुभाषी वॉयस एआई व अनुवाद" : language === "ur" ? "4. کثیر لسانی وائس اے آئی اور ترجمہ" : "4. AI Voice & Translation"}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === "hi"
                  ? "अंग्रेजी, हिन्दी और उर्दू में लाइव वॉयस डिक्टेशन तथा संपूर्ण वेबसाइट का त्रि-भाषी अनुवाद।"
                  : language === "ur"
                  ? "انگریزی، ہندی اور اردو میں لائیو وائس ڈکٹیشن اور پوری ویب سائٹ کا کثیر لسانی ترجمہ۔"
                  : "Full English, Hindi & Urdu localization with Web Speech live voice dictation and full-site multilingual translation."}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-amber-400 font-bold text-sm mb-1">
                {language === "hi" ? "5. सरकारी सत्यापन एवं डिजिटल प्रमाण पत्र" : language === "ur" ? "5. سرکاری تصدیق اور ڈیجیٹل سرٹیفکیٹ" : "5. Govt Verification & Certificate"}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === "hi"
                  ? "जिला नोडल अधिकारी द्वारा डिजिटल ऑडिट ट्रेल, माइलस्टोन साइन-ऑफ तथा मुद्रण योग्य आधिकारिक प्रमाण पत्र।"
                  : language === "ur"
                  ? "ڈسٹرکٹ نوڈل آفیسر کی ڈیجیٹل آڈٹ ٹریل اور پرنٹ کے قابل سرکاری سرٹیفکیٹس۔"
                  : "District Nodal Officer digital audit trail, milestone sign-off, and printable official verification certificates with state seals."}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-amber-400 font-bold text-sm mb-1">
                {language === "hi" ? "6. संवादात्मक जीआईएस आपदा मानचित्र" : language === "ur" ? "6. انٹرایکٹو جی آئی ایس نقشہ" : "6. Interactive GIS Disaster Map"}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === "hi"
                  ? "4 उपग्रह एवं स्थलाकृतिक मानचित्र परतों के साथ 2.4 किमी गंभीर प्रभाव गलियारा बफर जोन।"
                  : language === "ur"
                  ? "4 بیس میپس اور 2.4 کلومیٹر خطرے کے بفر زون کے ساتھ لائیو مانیٹرنگ۔"
                  : "4 satellite & topo basemaps with 2.4km critical hazard corridor buffer zones and live pin drops."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </PagePop>
  );
}
