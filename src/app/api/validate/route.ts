import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID!;

export async function POST(req: NextRequest) {
  try {
    const { systemDescription, requirement } = await req.json();

    console.log("🔧 New validation request");
    console.log("📝 Requirement:", requirement);

    const userMessage = `I am a Requirements Engineer. I want to formulate a non-functional requirement. The non-functional requirement shall be of high quality.\nRequirement: ${requirement}\n`;

    const thread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userMessage,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID
    });

    console.log("🧠 Assistant ID used:", ASSISTANT_ID);
console.log("📎 Thread created:", thread.id);


    let status = run.status;

    console.log("🧮 Estimated prompt length:", userMessage.length);

    while (status !== "completed" && status !== "failed") {
      await new Promise((res) => setTimeout(res, 1000));
      const updatedRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      status = updatedRun.status;
    }

    if (status === "failed") {
  const runInfo = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  console.error("❌ Run failed detail:", JSON.stringify(runInfo, null, 2));
  throw new Error("Assistant run failed");
}

    const messages = await openai.beta.threads.messages.list(thread.id);
    const last = messages.data.find((msg) => msg.role === "assistant");
    let text =
      last?.content?.[0]?.type === "text" ? last.content[0].text.value : "No response";

    console.log("📨 AI Response:", text);

    const metricSynonyms = {
      unambiguous: ["Unambiguous", "Ambiguity"],
      measurable: ["Measurable", "Measurability"],
      individuallyCompleted: ["Individually Complete", "Individual Completeness"],
    };

    let total = 0;
    const qualityFactors: Record<keyof typeof metricSynonyms, number> = {
      unambiguous: 0,
      measurable: 0,
      individuallyCompleted: 0,
    };

    for (const [key, synonyms] of Object.entries(metricSynonyms) as [keyof typeof metricSynonyms, string[]][]) {
      const matched = synonyms.some((syn) =>
        new RegExp(`(^|\\n)[ \\t#>*-]*\\*{0,2}${syn.replace(/\s+/g, '[\\s_]+')}\\*{0,2}\\s*[:：]?\\s*\\(?\\s*1\\s*\\)?\\s*(\\n|$)`, "i").test(text)
      );
      qualityFactors[key] = matched ? 1 : 0;
      if (matched) total++;
    }

    // 🔍 Extract Suggested Requirement & Explanation
    let parsed = "";
    // Special NFR rejection message case
if (/please try better, it is not nfr\s*[:(]/i.test(text)) {
  return NextResponse.json({
    analysis: "Please try better, it is not NFR :(",
    score: 0,
    unambiguous: 0,
    measurable: 0,
    individuallyCompleted: 0,
  });
}
else if (total !== 3) {
 const match = text.match(/(?:\*\*\s*)?Suggested requirement\s*[:：]?\s*([\s\S]*?)\n+(?:\*\*\s*)?Explanation\s*[:：]?\s*([\s\S]*)/i);
 let parsed = "";
  if (match) {
    const suggested = match[1]?.trim();
    const explanation = match[2]?.trim();
    parsed += suggested ? `Suggested requirement: ${suggested}\n` : "";
    parsed += explanation ? `Explanation: ${explanation}` : "";
  } else {
    parsed = text.trim();
  }
  text = parsed;
}
 else {
      // Clean high quality response
      text = text
        .replace(/^Your requirement:.*$/gim, "")
        .replace(/^Unambiguous:\s*\d+/gim, "")
        .replace(/^Measurable:\s*\d+/gim, "")
        .replace(/^Individually complete:\s*\d+/gim, "")
        .replace(/\n{2,}/g, "\n")
        .trim();
    }

    return NextResponse.json({
      analysis: text,
      score: total,
      ...qualityFactors,
    });

  } catch (e: any) {
    console.error("❌ Server error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
