import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID!;

export async function POST(req: NextRequest) {
  try {
    const { systemDescription, requirement } = await req.json();

    console.log("🔧 New validation request");
    console.log("📝 Requirement:", requirement);

    const userMessage = `I am a Requirements Engineer. I want to formulate a non-functional requirement. The non-functional requirement shall be of high quality.\nRequirement: ${requirement}\n\nSystem Description: ${systemDescription}\n`;

    const thread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userMessage,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID,
    });

    let status = run.status;
    while (status !== "completed" && status !== "failed") {
      await new Promise((res) => setTimeout(res, 1000));
      const updatedRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      status = updatedRun.status;
    }

    if (status === "failed") throw new Error("Assistant run failed");

    const messages = await openai.beta.threads.messages.list(thread.id);
    const last = messages.data.find((msg) => msg.role === "assistant");
    let text =
      last?.content?.[0]?.type === "text" ? last.content[0].text.value : "No response";

	  const metricSynonyms = {
		unambiguous: ["Unambiguous", "Ambiguity", " Unambiguous"],
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
			new RegExp(
				`(^|\\n)[ \\t#>*-]*\\*{0,2}${syn
					.trim()
					.replace(/\s+/g, '[\\s_]+')}\\*{0,2}\\s*[:：]?\\s*\\(?\\s*1\\s*\\)?\\s*(\\n|$)`,
				"i"
			).test(text)
		);
		qualityFactors[key] = matched ? 1 : 0;
		if (matched) total++;
	}

    if (total !== 3) {
      text = text
        .replace(
          /^\s*(Unambiguous|Unambigious|Ambiguity|Measurable|Measurability|Individually Complete|Individual Completeness)\s*[:：]?\s*\(?\s*1\s*\)?\s*$/gim,
          ""
        )
        .replace(
          /^\s*(\d+\.|[-–*])?\s*\*?\*?(Unambiguous|Ambiguity|Measurable|Measurability|Individually Complete|Individual Completeness)\*?\*?\s*[:：]?\s*\(?1\)?\)?\s*.*(?:\r?\n(\s*[-–•*] .*|.*))*$/gim,
          ""
        )
        .replace(/^[\s\S]*?(?=\bAdvice:|\*\*?Advice)/i, "")
        .replace(/\n{2,}/g, "\n")
        .replace(/(^|\n)(Corrected requirement:)/i, "$1**$2**")
        .trim();
    } else {
      text = text
        .replace(/^\s*(AI Validation|Analysis|Requirement Assessment|Advice)\s*[:：]?\s*$/gim, "")
        .replace(/^\s*\*{1,2}\s*(AI Validation|Analysis|Requirement Assessment|Advice)\s*\*{1,2}\s*[:：]?\s*$/gim, "")
        .replace(
          /^\s*(Unambiguous|Unambigious|Ambiguity|Measurable|Measurability|Individually Complete|Individual Completeness)\s*[:：]?\s*\(?\s*1\s*\)?\s*$/gim,
          ""
        )
        .replace(
          /^\s*(\d+\.|[-–*])?\s*\*?\*?(Unambiguous|Ambiguity|Measurable|Measurability|Individually Complete|Individual Completeness)\*?\*?\s*[:：]?\s*\(?1\)?\)?\s*.*(?:\r?\n(\s*[-–•*] .*|.*))*$/gim,
          ""
        )
        .replace(/^\s*The requirement is of high quality\.*\s*$/gim, "")
        .replace(/^Corrected requirement:\s*.+$/gim, "")
        .replace(/\n{2,}/g, "\n")
        .replace(/^\*\*(High[- ]Quality|Conclusion|Requirement Assessment)\*\*:?$/gim, "")
        .replace(/^Requirement:\s?.*$/gim, "")
        .replace(/^The requirement is (clear|of high quality|clear, measurable, and complete)\.?$/gim, "")
        .trim();
    }
	return NextResponse.json({
		analysis: text,
		score: total,
		...qualityFactors, // includes unambiguous, measurable, individuallyCompleted
	});

	  
  } catch (e: any) {
    console.error("❌ Server error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
