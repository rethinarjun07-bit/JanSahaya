import { GoogleGenAI } from "@google/genai";
import {
  CopilotIntent,
  CopilotContext,
  CopilotResponse,
  CopilotAction,
  CopilotCard,
  ExtractedEntities
} from "./types";
import { classifyIntent, extractEntities, detectLanguage } from "./intents";
import {
  getUserReports,
  getDistrictCivicPulse,
  getStatewidePulse,
  findDuplicateChallenges,
  getAIAnalysisExplanation,
  getSolutionsData,
  getJharkhandEmergencyContacts
} from "./retriever";

export async function processCopilotMessage(
  message: string,
  context?: CopilotContext
): Promise<CopilotResponse> {
  const text = message.trim();
  const detectedLanguage = detectLanguage(text);
  const isHindi = detectedLanguage === "hi";

  // Level 1: Intent & Entity Classification
  const { intent, confidence } = classifyIntent(text, context);
  const entities = extractEntities(text, context);

  let reply = "";
  let actions: CopilotAction[] = [];
  let card: CopilotCard | undefined = undefined;
  let groundedSource = "JanSahaya Platform Data Engine";

  // Level 2: Intent-specific Grounded Handlers
  switch (intent) {
    case "REPORT_PROBLEM": {
      const category = entities.category || "Disaster Management";
      const urgency = entities.urgencyEstimate || 80;
      const district = entities.district || "Ranchi";
      const affected = entities.affected ? ` affecting ${entities.affected}` : "";

      if (isHindi) {
        reply = `🌧️ **समस्या पहचानी गई**: यह **${category}** की श्रेणी में आता है।\n\n• **सुझावित श्रेणी**: ${category}\n• **सुझावित तात्कालिकता (Urgency)**: ${urgency >= 80 ? "High (उच्च)" : "Medium (मध्यम)"} (${urgency}/100)\n• **पहचाना गया क्षेत्र**: ${district}${affected ? ` (${affected})` : ""}\n\nमैं इसे जनसहाया पर तुरंत दर्ज करने में मदद कर सकता हूँ। नीचे दिए गए बटन पर क्लिक करके विवरण की पुष्टि करें।`;
      } else {
        reply = `🌧️ **Civic Problem Detected**: This sounds like a **${category}** issue.\n\n• **Suggested Category**: ${category}\n• **Suggested Urgency**: ${urgency >= 80 ? "High" : "Medium"} (Score ~${urgency}/100)\n• **Target Area**: ${district}${affected ? ` (${affected})` : ""}\n\nI can help you submit this report directly to local authorities and matched technical solvers.`;
      }

      const reportUrl = `/challenges/new?title=${encodeURIComponent(text.slice(0, 80))}&category=${encodeURIComponent(category)}&district=${encodeURIComponent(district)}&description=${encodeURIComponent(text)}`;

      actions = [
        { label: "📝 Report This Problem", url: reportUrl, variant: "primary" },
        { label: "🗺️ Open GIS Map", url: "/map", variant: "outline" }
      ];

      card = {
        type: "problem_report",
        title: "Report Preview",
        items: [
          { label: "Category", value: category, badge: "AI Suggested", badgeColor: "blue" },
          { label: "Urgency", value: `${urgency}/100`, badge: urgency >= 80 ? "High" : "Medium", badgeColor: urgency >= 80 ? "red" : "amber" },
          { label: "District", value: district, badge: "Location", badgeColor: "slate" },
          { label: "Status", value: "Awaiting Citizen Confirmation", badge: "Draft", badgeColor: "amber" }
        ]
      };
      break;
    }

    case "TRACK_MY_REPORT": {
      if (!context?.user?.userId) {
        reply = isHindi
          ? `🔒 **लॉगिन आवश्यक है**: आपकी व्यक्तिगत शिकायतों और रिपोर्ट की स्थिति देखने के लिए कृपया अपने जनसहाया खाते में साइन इन करें।`
          : `🔒 **Sign-in Required**: Please sign in so I can securely access and track your active challenges and reports.`;

        actions = [
          { label: "🔑 Sign In to JanSahaya", url: "/login", variant: "primary" },
          { label: "📝 Post New Challenge", url: "/challenges/new", variant: "outline" }
        ];
        break;
      }

      const userReports = await getUserReports(context.user.userId);
      groundedSource = `JanSahaya Database (${userReports.length} user records)`;

      if (userReports.length === 0) {
        reply = isHindi
          ? `📋 आपके खाते (${context.user.email}) से अभी तक कोई रिपोर्ट दर्ज नहीं की गई है।\n\nआप किसी भी नागरिक समस्या या आपदा की रिपोर्ट तुरंत कर सकते हैं।`
          : `📋 You have no active reports registered under your account (${context.user.email}).\n\nYou can report any local civic hazard or disaster anytime.`;

        actions = [
          { label: "📝 Report Problem", url: "/challenges/new", variant: "primary" },
          { label: "🗺️ Open GIS Map", url: "/map", variant: "outline" }
        ];
      } else {
        const latest = userReports[0];
        const statusMap: Record<string, string> = {
          SUBMITTED: "Awaiting Government Verification",
          VERIFIED: "Verified by District Administration",
          ASSIGNED: "Matched to University Solver Lab",
          IN_PROGRESS: "Solution Prototyping Active",
          SOLVED: "Resolved & Field Deployed",
          MERGED: "Merged with Master Report"
        };

        if (isHindi) {
          reply = `📋 **आपकी नवीनतम रिपोर्ट:**\n\n**${latest.title}** (आईडी: \`${latest.id.slice(0, 10)}\`)\n\n✓ **AI विश्लेषण पूर्ण**: तात्कालिकता स्कोर ${latest.urgencyScore}/100\n${latest.verifiedAt ? "✓ **सरकारी सत्यापन**: स्वीकृत (Approved)" : "⏳ **सरकारी सत्यापन**: समीक्षाधीन (Under Review)"}\n⏳ **विश्वविद्यालय मैचिंग**: ${latest.autoAssignedUniversity || "प्रक्रियाधीन"}\n\n**वर्तमान स्थिति**: ${statusMap[latest.status] || latest.status}\n**प्राप्त समाधान**: ${latest.solutionsCount}`;
        } else {
          reply = `📋 **Your Latest Report:**\n\n**${latest.title}** (Ref: \`${latest.id.slice(0, 10)}\`)\n\n✓ **AI Analysis Complete**: Urgency Score ${latest.urgencyScore}/100\n${latest.verifiedAt ? "✓ **Government Verification**: Approved" : "⏳ **Government Verification**: Under Administrative Review"}\n⏳ **University Matching**: ${latest.autoAssignedUniversity || "Matching Premier Lab"}\n\n**Current Stage**: ${statusMap[latest.status] || latest.status}\n**Solutions Proposed**: ${latest.solutionsCount}`;
        }

        actions = [
          { label: "📄 Open Report Details", url: `/challenges/${latest.id}`, variant: "primary" },
          { label: "📊 View All Challenges", url: "/challenges", variant: "outline" }
        ];

        card = {
          type: "report_tracker",
          title: "Challenge Tracking",
          items: [
            { label: "Ref ID", value: latest.id.slice(0, 12) + "...", badge: latest.district, badgeColor: "slate" },
            { label: "Urgency", value: `${latest.urgencyScore}/100`, badge: latest.severity, badgeColor: latest.severity === "CRITICAL" ? "red" : "amber" },
            { label: "Stage", value: latest.status, badge: "Status", badgeColor: "blue" },
            { label: "University", value: latest.autoAssignedUniversity || "Assigned by Sector", badge: "Quad-Helix", badgeColor: "green" }
          ]
        };
      }
      break;
    }

    case "FIND_PROBLEMS": {
      const district = entities.district || "Ranchi";
      const pulse = await getDistrictCivicPulse(district);
      groundedSource = `JanSahaya Database (District: ${district})`;

      if (isHindi) {
        reply = `📍 **${district} नागरिक पल्स (Civic Pulse)**\n\nमुझे ${district} में **${pulse.totalChallenges} सक्रिय समस्याएँ** मिलीं।\n\n🔴 **${pulse.criticalCount} गंभीर (Critical)**\n🟠 **${pulse.highCount} उच्च (High)**\n🟡 **${pulse.mediumCount} मध्यम (Medium)**\n🟢 **${pulse.lowCount} सामान्य (Low)**\n\n**प्रमुख श्रेणियाँ**: ${pulse.topCategories.map(c => c.category).join(", ") || "सामान्य नागरिक मामले"}`;
      } else {
        reply = `📍 **${district} Civic Pulse**\n\nI found **${pulse.totalChallenges} active challenges** registered in ${district}.\n\n🔴 **${pulse.criticalCount} Critical**\n🟠 **${pulse.highCount} High**\n🟡 **${pulse.mediumCount} Medium**\n🟢 **${pulse.lowCount} Low**\n\n**Most reported categories**: ${pulse.topCategories.map(c => c.category).join(", ") || "General infrastructure"}.`;
      }

      actions = [
        { label: `🔎 View ${district} Challenges`, url: `/challenges?district=${encodeURIComponent(district)}`, variant: "primary" },
        { label: "🗺️ Open GIS Map", url: "/map", variant: "outline" }
      ];

      card = {
        type: "challenge_pulse",
        title: `${district} Civic Pulse`,
        items: [
          { label: "Total Active", value: String(pulse.totalChallenges), badge: "Real-time", badgeColor: "blue" },
          { label: "Critical Severity", value: String(pulse.criticalCount), badge: "Immediate Attention", badgeColor: "red" },
          { label: "High Urgency", value: String(pulse.highCount), badge: "Urgent", badgeColor: "amber" },
          { label: "Top Domain", value: pulse.topCategories[0]?.category || "Disaster", badge: "Sector", badgeColor: "slate" }
        ]
      };
      break;
    }

    case "FIND_LOCAL_PROBLEMS":
    case "GIS_LOCATION_EXPLORATION": {
      const statePulse = await getStatewidePulse();
      groundedSource = `JanSahaya GIS Registry (${statePulse.totalActive} geo-challenges)`;

      const topList = statePulse.topDistricts
        .map(d => `• **${d.district}**: ${d.count} challenges (${d.criticalCount} critical)`)
        .join("\n");

      if (isHindi) {
        reply = `🗺️ **झारखंड राज्य GIS अन्वेषण**\n\nपूरे झारखंड में वर्तमान में **${statePulse.totalActive} भू-टैग की गई चुनौतियाँ** सक्रिय हैं।\n\n**उच्चतम गतिविधि वाले जिले**:\n${topList}\n\nआप इंटरेक्टिव जीआईएस मैप पर सभी 24 जिलों के लाइवSeverity मार्कर देख सकते हैं।`;
      } else {
        reply = `🗺️ **Jharkhand GIS & Geo-Analytics**\n\nCurrently tracking **${statePulse.totalActive} active geotagged challenges** across Jharkhand.\n\n**Districts with highest active density**:\n${topList}\n\nHigh-density areas are highlighted with real-time pulsing markers on our interactive GIS map.`;
      }

      actions = [
        { label: "🗺️ Open Interactive GIS Map", url: "/map", variant: "primary" },
        { label: "📍 View All Challenges", url: "/challenges", variant: "outline" }
      ];
      break;
    }

    case "EXPLAIN_AI_ANALYSIS": {
      const analysis = await getAIAnalysisExplanation(entities.challengeId, text);
      groundedSource = "Deterministic NLP Classifier Engine";

      const factorBullets = analysis.factors.map(f => `• ${f}`).join("\n");

      if (isHindi) {
        reply = `🧠 **AI बहु-कारक विश्लेषण (Multi-Factor Analysis)**\n\n**तात्कालिकता स्कोर**: ${analysis.urgencyScore}/100 — ${analysis.urgencyScore >= 80 ? "उच्च (High)" : "मध्यम (Medium)"}\n**AI विश्वास स्तर**: ${analysis.confidenceScore}%\n\n**पहचाने गए कारक (Factors Detected)**:\n${factorBullets}\n\n• **अनुशंसित विभाग**: ${analysis.department}\n• **नोडल संस्थान**: ${analysis.university}\n\n⚠️ *यह एक स्वचालित AI अनुशंसा है। आधिकारिक निर्णय और प्राथमिकता राज्य सरकार के पास है।*`;
      } else {
        reply = `🧠 **AI Multi-Factor Analysis**\n\n**Urgency Score**: ${analysis.urgencyScore}/100 — ${analysis.urgencyScore >= 80 ? "High Priority" : "Standard Priority"}\n**AI Confidence**: ${analysis.confidenceScore}%\n\n**Factors Detected & Evaluated**:\n${factorBullets}\n\n• **Recommended Department**: ${analysis.department}\n• **Premier Institute Assigned**: ${analysis.university}\n\n⚠️ *This is an objective AI recommendation. Statutory Government verification remains the final authority.*`;
      }

      actions = [
        { label: "🏛️ Platform Workflow", url: "/challenges", variant: "primary" },
        { label: "🗺️ View on Map", url: "/map", variant: "outline" }
      ];

      card = {
        type: "ai_explanation",
        title: "AI Scoring Rationale",
        items: [
          { label: "Urgency Metric", value: `${analysis.urgencyScore}/100`, badge: "Priority", badgeColor: analysis.urgencyScore >= 80 ? "red" : "amber" },
          { label: "Confidence", value: `${analysis.confidenceScore}%`, badge: "Verified", badgeColor: "blue" },
          { label: "Target Dept", value: analysis.department, badge: "Govt Authority", badgeColor: "slate" },
          { label: "Academic Partner", value: analysis.university, badge: "Nodal Lab", badgeColor: "green" }
        ]
      };
      break;
    }

    case "CHECK_DUPLICATE": {
      const duplicates = await findDuplicateChallenges(text, text, entities.district, entities.category);
      groundedSource = "TF-IDF & N-Gram Cosine Similarity Engine";

      if (duplicates.length > 0) {
        const top = duplicates[0];
        reply = isHindi
          ? `🔍 मुझे इससे मिलती-जुलती एक मौजूदा रिपोर्ट मिली है:\n\n**${top.title}**\n• **स्थान**: ${top.district}\n• **समानता**: ${top.similarityPercentage}% शब्दावली समानता\n${top.distanceKm ? `• **दूरी**: लगभग ${top.distanceKm} किमी दूर\n` : ""}\nक्या आप मौजूदा रिपोर्ट का समर्थन करना चाहते हैं या नई शिकायत दर्ज करना चाहते हैं?`
          : `🔍 I found a potentially related existing report in our database:\n\n**${top.title}**\n• **Location**: ${top.district}\n• **Similarity**: ${top.similarityPercentage}% text & sector overlap\n${top.distanceKm ? `• **Distance**: ${top.distanceKm} km away\n` : ""}\nJanSahaya prevents duplicate clutter by clustering reports so government teams can act faster.`;

        actions = [
          { label: "🔎 View Related Report", url: `/challenges/${top.id}`, variant: "primary" },
          { label: "📝 Continue New Report", url: "/challenges/new", variant: "outline" }
        ];

        card = {
          type: "duplicate_alert",
          title: "Potential Duplicate Match",
          items: [
            { label: "Existing Report", value: top.title.slice(0, 60) + "...", badge: top.district, badgeColor: "slate" },
            { label: "Similarity", value: `${top.similarityPercentage}%`, badge: top.confidence, badgeColor: "amber" },
            { label: "Recommendation", value: "Support Existing Report to Elevate Urgency", badge: "Action", badgeColor: "blue" }
          ]
        };
      } else {
        reply = isHindi
          ? `✅ इस क्षेत्र में कोई समान पूर्व-दर्ज रिपोर्ट नहीं मिली। आपकी शिकायत नई प्रतीत होती है।`
          : `✅ No duplicate reports detected in this sector or area. Your challenge appears unique and ready for registration.`;

        actions = [
          { label: "📝 Report Problem Now", url: "/challenges/new", variant: "primary" }
        ];
      }
      break;
    }

    case "EMERGENCY_GUIDANCE": {
      groundedSource = "Verified Jharkhand Emergency Helplines";
      const contacts = getJharkhandEmergencyContacts();

      if (isHindi) {
        reply = `🚨 **आपातकालीन सहायता — तुरंत सुरक्षा पहली प्राथमिकता**\n\nयदि आप या कोई अन्य व्यक्ति घायल, खतरे में या फंसा हुआ है, तो तुरंत आपातकालीन सहायता लें:\n\n• **राष्ट्रीय आपातकालीन नंबर**: **112**\n• **एम्बुलेंस / चिकित्सा**: **108**\n• **झारखंड राज्य आपदा प्रबंधन (SDMA)**: **0651-2446900**\n• **NDRF रांची**: **0651-2290000**\n• **अग्निशमन (Fire)**: **101**\n\n⚠️ *जनसहाया AI आपातकालीन सेवाओं का विकल्प नहीं है। कृपया तुरंत 112 पर संपर्क करें।*`;
      } else {
        reply = `🚨 **Emergency Guidance — Safety First**\n\nIf you or someone nearby is injured, trapped, or in immediate danger, seek emergency response immediately:\n\n• **National Emergency / Police**: **112**\n• **Ambulance / Medical SOS**: **108**\n• **Jharkhand SDMA**: **0651-2446900**\n• **NDRF Battalion Ranchi**: **0651-2290000**\n• **Fire Emergency**: **101**\n\n⚠️ *JanSahaya AI cannot replace first responders or medical professionals. Call 112 right now if life or safety is threatened.*`;
      }

      actions = [
        { label: "🚨 Call 112 Now", url: "tel:112", variant: "danger" },
        { label: "🚑 Call Ambulance 108", url: "tel:108", variant: "danger" }
      ];

      card = {
        type: "emergency_banner",
        title: "Jharkhand Emergency Contacts",
        items: contacts
      };
      break;
    }

    case "EXPLAIN_JANSAHAYA": {
      groundedSource = "JanSahaya Quad-Helix Operating Blueprint";
      if (isHindi) {
        reply = `🏛️ **जनसहाया कार्यप्रणाली (Workflow):**\n\n1. **नागरिक रिपोर्ट**: फोटो और जीपीएस के साथ समस्या दर्ज की जाती है।\n2. **AI समझ**: श्रेणी, तात्कालिकता स्कोर और डुप्लिकेट पहचान।\n3. **सरकारी सत्यापन**: संबंधित जिला अधिकारी जमीनी सत्यापन करते हैं।\n4. **विश्वविद्यालय मैचिंग**: प्रमुख शोध संस्थानों (BIT Mesra, IIT ISM, BAU, NIT JSR) को समाधान हेतु भेजा जाता है।\n5. **समाधान प्रस्ताव**: छात्र और शोधकर्ता तकनीकी समाधान और बजट प्रस्तुत करते हैं।\n6. **सरकारी मूल्यांकन**: समाधान की व्यावहारिकता और प्रभाव की जांच।\n7. **CSR / उद्योग सहयोग**: टाटा स्टील, कोल इंडिया जैसे साझेदार परियोजना को वित्तपोषित करते हैं।\n8. **क्रियान्वयन**: जमीनी स्तर पर समाधान लागू किया जाता है।\n9. **नागरिक प्रतिक्रिया**: आप समाधान की पुष्टि करते हैं।\n\n*मूल सिद्धांत: AI अनुशंसा करता है, सरकार आधिकारिक निर्णय लेती है।*`;
      } else {
        reply = `🏛️ **JanSahaya Quad-Helix Problem-Solving Lifecycle:**\n\n1. **Citizen Report**: Geotagged civic issue or disaster distress recorded.\n2. **AI Understanding**: Deterministic categorization, urgency scoring & duplicate clustering.\n3. **Government Verification**: Nodal district officers verify authenticity and set priority.\n4. **University/Solver Matching**: Auto-routed to premier labs (BIT Mesra, IIT ISM, BAU, NIT JSR).\n5. **Solution Proposal**: Researchers submit engineering blueprints, milestones and budgets.\n6. **Government Evaluation**: State authorities assess feasibility and public utility.\n7. **CSR / Industry Funding**: Industrial leaders (Tata Steel, Coal India, JSPL) fund vetted pilots.\n8. **Field Implementation**: On-ground execution with verified progress milestones.\n9. **Citizen Feedback & Impact**: Community confirms resolution.\n\n*Core Principle: AI recommends. Government makes statutory verification.*`;
      }

      actions = [
        { label: "📝 Report Problem", url: "/challenges/new", variant: "primary" },
        { label: "💡 View Active Solutions", url: "/solutions", variant: "outline" }
      ];
      break;
    }

    case "SOLUTION_STATUS": {
      const solutions = await getSolutionsData(entities.challengeId);
      groundedSource = `JanSahaya Solutions Registry (${solutions.length} active pilots)`;

      if (solutions.length > 0) {
        const solList = solutions.map(s =>
          `• **${s.title}** by *${s.teamName}*\n  Status: **${s.status}** · Budget: ${s.budgetEstimate} · Timeline: ${s.timelineMonths}`
        ).join("\n\n");

        if (isHindi) {
          reply = `💡 **प्रस्तावित समाधानों की वर्तमान स्थिति:**\n\n${solList}\n\nसरकारी मूल्यांकन और सीएसआर सहयोग के बाद समाधान को मैदान में उतारा जाता है।`;
        } else {
          reply = `💡 **Current Solution Proposals:**\n\n${solList}\n\nSolutions undergo transparent government evaluation before field deployment and CSR capital allocation.`;
        }

        actions = [
          { label: "💡 View Solutions Hub", url: "/solutions", variant: "primary" },
          { label: "🎓 Solver Innovation Lab", url: "/solver", variant: "outline" }
        ];

        card = {
          type: "solutions_list",
          title: "Vetted Technical Solutions",
          items: solutions.map(s => ({
            label: s.teamName,
            value: s.title.slice(0, 50) + "...",
            badge: s.status,
            badgeColor: s.status === "GOVT_VERIFIED" ? "green" : "blue"
          }))
        };
      } else {
        reply = isHindi
          ? `💡 इस चुनौती के लिए अभी समाधान प्रस्ताव आमंत्रित किए जा रहे हैं। शोधकर्ता और विश्वविद्यालय समाधान प्रस्तुत कर सकते हैं।`
          : `💡 Solution proposals are actively invited for this challenge. Accredited university labs and student innovators can submit technical pilots.`;

        actions = [
          { label: "🎓 Propose Solution", url: "/solver", variant: "primary" },
          { label: "📊 Browse Challenges", url: "/challenges", variant: "outline" }
        ];
      }
      break;
    }

    case "UNIVERSITY_SOLVER_HELP": {
      groundedSource = "JanSahaya University Matching Knowledge Base";
      if (isHindi) {
        reply = `🎓 **झारखंड विश्वविद्यालय समाधान नेटवर्क (University Solver Matching):**\n\nजनसहाया प्रत्येक चुनौती को उसकी तकनीकी श्रेणी के अनुसार प्रमुख संस्थानों से जोड़ता है:\n\n• **BIT Mesra**: जल विज्ञान (Hydrology), ड्रोन सर्वेक्षण और जीआईएस मैपिंग\n• **IIT (ISM) Dhanbad**: भूमिगत कोयला आग, माइनिंग सुरक्षा और भू-तकनीकी खतरे\n• **Birsa Agricultural University (BAU)**: सूखा प्रबंधन, कृषि-जलवायु लचीलापन और वन आग\n• **NIT Jamshedpur**: भारी औद्योगिक प्रदूषण, पुल व सड़क इंजीनियरिंग\n• **AIIMS Deoghar**: आपदा चिकित्सा और जलजनित महामारी नियंत्रण`;
      } else {
        reply = `🎓 **University Solver Matching Matrix:**\n\nJanSahaya routes civic challenges to Jharkhand's premier academic institutions based on technical domain:\n\n• **BIT Mesra**: Hydrology, Urban Flash Floods, Aerial Drone Remote Sensing & GIS\n• **IIT (ISM) Dhanbad**: Subterranean Coal Fires, Mine Subsidence & Geotechnical Safety\n• **Birsa Agricultural University (BAU)**: Agro-Climatic Resilience, Drought Adaptation & Forestry\n• **NIT Jamshedpur**: Heavy Industrial Effluents, Structural Transport Infrastructure\n• **AIIMS Deoghar**: Disaster Medicine & Waterborne Epidemiological Triage`;
      }

      actions = [
        { label: "🎓 Solver Portal", url: "/solver", variant: "primary" },
        { label: "💡 View Solutions", url: "/solutions", variant: "outline" }
      ];
      break;
    }

    case "CSR_INDUSTRY_HELP": {
      groundedSource = "JanSahaya CSR Funding Pipeline";
      if (isHindi) {
        reply = `🏢 **CSR एवं उद्योग सहयोग (CSR Funding Support):**\n\nकंपनीज एक्ट की धारा 135 के तहत, उद्योग साझेदार (जैसे टाटा स्टील सीएसआर, कोल इंडिया, जिंदल फाउंडेशन) जनसहाया पर सत्यापित समाधानों को फंड करते हैं:\n\n1. केवल **सरकार द्वारा सत्यापित (Govt-Verified)** समाधान ही फंडिंग के लिए पात्र होते हैं।\n2. फंड सीधे पायलट क्रियान्वयन और उपकरण निर्माण हेतु आवंटित होता है।\n3. प्रभाव और परिणाम पारदर्शी ऑडिट लॉग में दर्ज होते हैं।`;
      } else {
        reply = `🏢 **CSR & Industry Partnership Pipeline:**\n\nUnder Section 135 CSR guidelines, corporate partners (such as Tata Steel CSR, Coal India Green Tech, JSPL Foundation) fund verified high-impact solutions on JanSahaya:\n\n1. **Prerequisite**: Only Government-verified and milestone-tracked solutions qualify for CSR grants.\n2. **Capital Efficiency**: Frugal, scalable student-faculty pilots receive direct deployment sponsorship.\n3. **Auditability**: Every rupee and ground milestone is permanently logged and publicly verifiable.`;
      }

      actions = [
        { label: "🏢 CSR Industry Portal", url: "/industry", variant: "primary" },
        { label: "💡 Funded Solutions", url: "/solutions", variant: "outline" }
      ];
      break;
    }

    case "GOVERNMENT_SCHEME_GUIDANCE": {
      groundedSource = "Govt. of Jharkhand Disaster Relief Norms";
      if (isHindi) {
        reply = `💰 **झारखंड आपदा राहत एवं मुआवजा योजनाएँ:**\n\n• **SDRF (राज्य आपदा राहत कोष)**: पूर्ण मकान क्षति पर ₹95,100 / आंशिक पर ₹10,200; फसल क्षति पर ₹13,500/हेक्टेयर; जनहानि पर ₹4 लाख।\n• **PM राहत कोष**: गंभीर आपदा पीड़ितों हेतु प्रत्यक्ष सहायता।\n• **PM फसल बीमा योजना**: मौसम या बाढ़ से फसल नुकसान पर क्लेम।\n• **मुख्यमंत्री हेल्पलाइन**: डायल **181** किसी भी योजना सम्बन्धी सहायता के लिए।`;
      } else {
        reply = `💰 **Disaster Compensation Schemes in Jharkhand:**\n\n• **SDRF (State Disaster Response Fund)**: House damage: ₹95,100 (complete) / ₹10,200 (partial); Crop loss: ₹13,500/hectare; Human casualty: ₹4 Lakh to next of kin.\n• **PM National Relief Fund**: Grants for natural catastrophe victims.\n• **PM Fasal Bima Yojana**: Comprehensive crop distress insurance.\n• **Chief Minister Helpline**: Dial **181** for grievance & scheme facilitation.`;
      }

      actions = [
        { label: "📝 Report Damage on JanSahaya", url: "/challenges/new", variant: "primary" },
        { label: "📞 Dial 181 (CM Helpline)", url: "tel:181", variant: "outline" }
      ];
      break;
    }

    case "GENERAL_CONVERSATION": {
      const isGratitude = /thank|thanks|dhanyawad|shukriya|धन्यवाद|शुक्रिया/i.test(text);
      if (isGratitude) {
        reply = isHindi
          ? `🙏 आपका बहुत-बहुत धन्यवाद! झारखंड में नागरिक सुधार और जनसेवा में आपका सहयोग अमूल्य है। यदि आपको किसी अन्य समस्या की रिपोर्ट करनी हो या जानकारी चाहिए, तो मैं सदैव उपलब्ध हूँ।`
          : `🙏 You're very welcome! Active citizen participation keeps Jharkhand safer and stronger. Let me know if you need to report or track any other local civic concerns.`;
        actions = [
          { label: "📝 Report Another Problem", url: "/challenges/new", variant: "primary" },
          { label: "🗺️ Open GIS Map", url: "/map", variant: "outline" }
        ];
      } else if (isHindi) {
        reply = `🙏 नमस्ते! मैं **जनसहाया AI** हूँ।\n\nझारखंड में किसी नागरिक समस्या, आपदा रिपोर्टिंग या शिकायत ट्रैकिंग में आज मैं आपकी क्या सहायता कर सकता हूँ?`;
        actions = [
          { label: "📝 Report Problem", url: "/challenges/new", variant: "primary" },
          { label: "📍 Ranchi Civic Pulse", prompt: "What problems are active in Ranchi?", variant: "outline" },
          { label: "📊 Track My Report", prompt: "Where is my report?", variant: "outline" }
        ];
      } else {
        reply = `🙏 Namaste! I'm **JanSahaya AI**.\n\nHow can I assist you with Jharkhand civic issues, disaster reporting, or challenge tracking today?`;
        actions = [
          { label: "📝 Report Problem", url: "/challenges/new", variant: "primary" },
          { label: "📍 Ranchi Civic Pulse", prompt: "What problems are active in Ranchi?", variant: "outline" },
          { label: "📊 Track My Report", prompt: "Where is my report?", variant: "outline" }
        ];
      }
      break;
    }

    case "GENERAL_JANSAHAYA_QUESTION": {
      if (isHindi) {
        reply = `🌐 **जनसहाया (JanSahaya)** झारखंड सरकार, नागरिकों, प्रमुख विश्वविद्यालयों और सीएसआर उद्योग जगत को जोड़ने वाला एक बुद्धिमान नागरिक मंच है।\n\nयह नागरिकों की समस्याओं को सत्यापित कर स्थानीय विश्वविद्यालयों के शोधकर्ताओं द्वारा समाधान में बदलता है।`;
      } else {
        reply = `🌐 **JanSahaya** is an intelligent Quad-Helix civic innovation platform built for Jharkhand. It bridges citizens, government departments, premier universities (BIT Mesra, IIT ISM), and CSR industries to resolve on-ground disaster and societal challenges with measurable impact.`;
      }

      actions = [
        { label: "📝 Report Problem", url: "/challenges/new", variant: "primary" },
        { label: "🗺️ Open GIS Map", url: "/map", variant: "outline" }
      ];
      break;
    }

    default: {
      // UNKNOWN or Out of Scope
      if (isHindi) {
        reply = `ℹ️ मैं मुख्य रूप से **जनसहाया नागरिक और आपदा प्रबंधन** कार्यों (समस्या रिपोर्टिंग, ट्रैकिंग, समाधान और जीआईएस विश्लेषण) के लिए डिज़ाइन किया गया हूँ।\n\nइस विषय पर मेरे पास सत्यापित जनसहाया डेटा नहीं है। क्या आप झारखंड में किसी नागरिक समस्या या आपदा की जांच करना चाहते हैं?`;
      } else {
        if (text.toLowerCase().includes("france") || text.toLowerCase().includes("paris")) {
          reply = `Paris is the capital of France. However, as **JanSahaya AI**, my core purpose is assisting with civic challenges, disaster management, and community reports across Jharkhand.`;
        } else {
          reply = `I am specifically designed for **JanSahaya civic and disaster management** tasks in Jharkhand. I do not have verified platform data for this query.`;
        }
      }

      actions = [
        { label: "📝 Report Civic Problem", url: "/challenges/new", variant: "primary" },
        { label: "📍 Explore Local Problems", prompt: "What problems are active in Ranchi?", variant: "outline" },
        { label: "🗺️ Open GIS Map", url: "/map", variant: "outline" }
      ];
      break;
    }
  }

  // Level 3: Optional Gemini Synthesis (if API key available and prompt needs complex natural phrasing)
  const apiKey = (process.env.GEMINI_API_KEY || "").replace(/^["']|["']$/g, "").trim();
  const hasGemini = Boolean(apiKey && !apiKey.includes("Demo-Replace"));

  if (hasGemini && (intent === "GENERAL_CONVERSATION" || intent === "UNKNOWN" || text.split(/\s+/).length > 12)) {
    try {
      const aiClient = new GoogleGenAI({ apiKey });
      const contents = [
        ...(context?.history || []).slice(-4).map(h => ({
          role: h.role as "user" | "model",
          parts: [{ text: h.text }]
        })),
        {
          role: "user" as const,
          parts: [{
            text: `[SYSTEM CONTEXT: Verified JanSahaya ground truth facts:\n${reply}\nDetected intent: ${intent}]\nUser query: "${text}"\nProvide a warm, concise response (maximum 3 sentences) grounded strictly in the provided JanSahaya facts. NEVER repeat generic introductory lists.`
          }]
        }
      ];

      const res = await aiClient.models.generateContent({
        model: "gemini-2.0-flash",
        contents,
        config: {
          maxOutputTokens: 300,
          temperature: 0.5
        }
      });

      if (res.text && res.text.trim().length > 15) {
        reply = res.text.trim();
        groundedSource = "Google Gemini + JanSahaya Verified Ground Truth";
      }
    } catch (e) {
      console.warn("Gemini optional synthesis skipped, using Level 2 grounded response:", e);
    }
  }

  return {
    reply,
    intent,
    confidence,
    actions,
    card,
    isDemo: !hasGemini,
    detectedLanguage,
    groundedSource
  };
}
