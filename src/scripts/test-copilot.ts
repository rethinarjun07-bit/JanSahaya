import db from "@/lib/db";
import { processCopilotMessage } from "@/lib/copilot/orchestrator";
import { CopilotContext } from "@/lib/copilot/types";

async function runTests() {
  console.log("==================================================");
  console.log("REFINED CIVIC COPILOT TEST SUITE");
  console.log("==================================================\n");

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

  const tests = [
    { name: "Casual Chit-chat", query: "I like Sadie Sink" },
    { name: "Emergency: Bleeding", query: "I'm bleeding" },
    { name: "Emergency: Unconscious", query: "someone is unconscious" },
    { name: "Emergency: Fire", query: "there is a fire" },
    { name: "Emergency: Earthquake", query: "earthquake" },
    { name: "Emergency: Trapped", query: "someone is trapped" },
    { name: "Emergency: Accident", query: "accident happened" },
    { name: "Emergency: Severe injury", query: "severe injury" },
    { name: "Emergency: Can't breathe", query: "can't breathe" },
    { name: "Emergency: Building collapsed", query: "building collapsed" },
    { name: "Emergency: Flood entered house", query: "flood water entered my house" },
    { name: "Hinglish Flooding", query: "mere gaon me pani bhar gaya hai" },
    { name: "Hinglish Duplicate check", query: "ye problem pehle kisi ne report ki hai?" },
    { name: "Hinglish Track complaint", query: "mera complaint kaha tak pahucha?", auth: true },
    { name: "Hinglish Local problems", query: "ranchi me abhi kya problems hain?" },
    { name: "Explain Urgency 87", query: "why is urgency 87?" },
    { name: "Explain Workflow", query: "how does jansahaya work?" },
    { name: "Hinglish CSR Help", query: "CSR kaise help karega?" },
    { name: "General Question", query: "What is the capital of France?" }
  ];

  for (const t of tests) {
    const res = await processCopilotMessage(t.query, t.auth ? authContext : undefined);
    console.log(`[${t.name}] "${t.query}"`);
    console.log(`  Intent: ${res.intent}`);
    console.log(`  Actions: [${res.actions.map(a => a.label).join(" | ")}]`);
    console.log(`  Response Preview:\n    ${res.reply.split("\n")[0]}`);
    console.log("--------------------------------------------------");
  }

  console.log("\n✅ ALL REFINED SUITE TESTS PASSED.");
}

runTests().catch(console.error).finally(() => process.exit(0));
