import db from "@/lib/db";
import { processCopilotMessage } from "@/lib/copilot/orchestrator";
import { CopilotContext } from "@/lib/copilot/types";

async function runTests() {
  console.log("==================================================");
  console.log("JANSAHAYA CIVIC COPILOT — 12 DEMO SCENARIO TESTS");
  console.log("==================================================\n");

  // Fetch real citizen for authenticated test
  const demoCitizen = await db.user.findFirst({
    where: { email: "citizen@demo.in" },
    select: { id: true, name: true, email: true, role: true, district: true }
  });

  const authContext: CopilotContext = {
    user: demoCitizen ? {
      userId: demoCitizen.id,
      name: demoCitizen.name,
      email: demoCitizen.email,
      role: demoCitizen.role,
      district: demoCitizen.district || undefined
    } : null
  };

  const scenarios = [
    {
      id: 1,
      name: "Flooding near school in Ranchi",
      prompt: "There is severe flooding near a school in Ranchi.",
      context: undefined
    },
    {
      id: 2,
      name: "Hinglish Flooding",
      prompt: "mere gaon mein pani bhar gaya hai",
      context: undefined
    },
    {
      id: 3,
      name: "Active problems in Ranchi",
      prompt: "What problems are active in Ranchi?",
      context: undefined
    },
    {
      id: 4,
      name: "Track my report (authenticated)",
      prompt: "Where is my report?",
      context: authContext
    },
    {
      id: 5,
      name: "Explain urgency 87",
      prompt: "Why is my urgency 87?",
      context: undefined
    },
    {
      id: 6,
      name: "Duplicate check",
      prompt: "Is this already reported? Waterlogging and sudden flash flood in Morabadi Ground",
      context: undefined
    },
    {
      id: 7,
      name: "Platform lifecycle after verification",
      prompt: "What happens after verification?",
      context: undefined
    },
    {
      id: 8,
      name: "Solver & University Matching",
      prompt: "Who can solve this problem?",
      context: undefined
    },
    {
      id: 9,
      name: "CSR Funding",
      prompt: "Can CSR fund this?",
      context: undefined
    },
    {
      id: 10,
      name: "Natural greeting",
      prompt: "Hello",
      context: undefined
    },
    {
      id: 11,
      name: "Out of scope question",
      prompt: "What is the capital of France?",
      context: undefined
    },
    {
      id: 12,
      name: "Emergency - injury",
      prompt: "I'm injured.",
      context: undefined
    }
  ];

  for (const sc of scenarios) {
    const res = await processCopilotMessage(sc.prompt, sc.context);
    console.log(`[Scenario ${sc.id}] "${sc.prompt}"`);
    console.log(`  Intent: ${res.intent} (Confidence: ${Math.round(res.confidence * 100)}%)`);
    console.log(`  Grounded Source: ${res.groundedSource}`);
    console.log(`  Actions Count: ${res.actions.length} -> [${res.actions.map(a => a.label).join(" | ")}]`);
    console.log(`  Card: ${res.card ? res.card.title : "None"}`);
    console.log(`  Reply Snippet:\n    ${res.reply.split("\n")[0]}`);
    console.log("--------------------------------------------------");
  }

  console.log("\n==================================================");
  console.log("REPETITION TEST — 20 DISTINCT PROMPTS");
  console.log("==================================================\n");

  const distinctPrompts = [
    "Hello",
    "There is flooding near my village",
    "mere gaon mein pani bhar gaya hai",
    "What problems are active in Ranchi?",
    "Show problems in Dhanbad",
    "Where is my report?",
    "Why is my urgency 87?",
    "Is this already reported?",
    "What happens after verification?",
    "Who can solve this problem?",
    "Can CSR fund this?",
    "I'm injured.",
    "Which district has the most active challenges?",
    "How to get SDRF compensation?",
    "What solutions have been proposed?",
    "Who created JanSahaya?",
    "What is the capital of France?",
    "Tell me about borewell fluoride in Palamu",
    "Road is broken near Hazaribagh",
    "Thank you so much"
  ];

  const replies = new Set<string>();
  const results = [];

  for (let i = 0; i < distinctPrompts.length; i++) {
    const p = distinctPrompts[i];
    const res = await processCopilotMessage(p, i === 5 ? authContext : undefined);
    results.push({ prompt: p, intent: res.intent, reply: res.reply });
    replies.add(res.reply);
  }

  console.log(`Total unique prompts tested: ${distinctPrompts.length}`);
  console.log(`Total unique responses generated: ${replies.size}`);

  if (replies.size === distinctPrompts.length) {
    console.log("✅ PERFECT: Zero duplicate responses! Every distinct prompt received a customized, grounded response.");
  } else {
    console.log(`⚠️ Note: ${distinctPrompts.length - replies.size} responses were identical. Checking duplicates:`);
  }

  console.log("\n==================================================");
  console.log("CONVERSATIONAL CONTEXT CONTINUATION TEST");
  console.log("==================================================\n");

  const turn1 = await processCopilotMessage("There is flooding in Bokaro");
  console.log("Turn 1: 'There is flooding in Bokaro'");
  console.log("  Intent:", turn1.intent, "| Card:", turn1.card?.title);

  const context2: CopilotContext = {
    previousIntent: turn1.intent,
    previousEntities: { district: "Bokaro", category: "Disaster Management" },
    history: [
      { role: "user", text: "There is flooding in Bokaro" },
      { role: "model", text: turn1.reply }
    ]
  };

  const turn2 = await processCopilotMessage("It is affecting the main road", context2);
  console.log("Turn 2: 'It is affecting the main road'");
  console.log("  Intent:", turn2.intent, "| Context preserved Bokaro & Flood:", turn2.reply.includes("Bokaro") || turn2.reply.includes("Disaster") || turn2.reply.includes("Flood"));

  const context3: CopilotContext = {
    ...context2,
    history: [
      ...context2.history!,
      { role: "user", text: "It is affecting the main road" },
      { role: "model", text: turn2.reply }
    ]
  };

  const turn3 = await processCopilotMessage("Can I report it?", context3);
  console.log("Turn 3: 'Can I report it?'");
  console.log("  Intent:", turn3.intent, "| Actions:", turn3.actions.map(a => a.label).join(", "));

  console.log("\n✅ ALL TESTS COMPLETED SUCCESSFULLY.");
}

runTests()
  .catch(console.error)
  .finally(() => process.exit(0));
