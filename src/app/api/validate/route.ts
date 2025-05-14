// app/api/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID!;

export async function POST(req: NextRequest) {
	try {
		const { systemDescription, actors, requirement } = await req.json();

		console.log("🔧 New validation request");
		console.log("📝 Requirement:", requirement);
		console.log("📘 System Description:", systemDescription);
		console.log("🧑 Actors:", actors);

		const userMessage =
			`I am a Requirements Engineer. I want to formulate a non-functional requirement. The non-functional requirement shall be of high quality.\n` +
			`Requirement: ${requirement}\n\n` +
			`System Description: ${systemDescription}\n` +
			`Actors: ${actors.join(", ")}`;

		const thread = await openai.beta.threads.create();
		console.log("🧵 Thread created:", thread.id);

		await openai.beta.threads.messages.create(thread.id, {
			role: "user",
			content: userMessage,
		});
		console.log("✉️ Message added to thread");

		const run = await openai.beta.threads.runs.create(thread.id, {
			assistant_id: ASSISTANT_ID,
		});
		console.log("🏃‍♂️ Run started:", run.id);

		let status = run.status;
		while (status !== "completed" && status !== "failed") {
			await new Promise((res) => setTimeout(res, 1000));
			const updatedRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);
			status = updatedRun.status;
			console.log("⏳ Waiting... Status:", status);
		}

		if (status === "failed") throw new Error("Assistant run failed");

		const messages = await openai.beta.threads.messages.list(thread.id);
		console.log("📥 Messages received:", messages.data.length);

		const last = messages.data.find((msg) => msg.role === "assistant");
		let text = last?.content?.[0]?.type === "text" ? last.content[0].text.value : "No response";

		console.log("✅ Final response:\n", text);

		// === 🧠 Score Analysis ===
		const metricSynonyms = {
			Unambiguous: ["Unambiguous", "Ambiguity", " Unambiguous"],
			Measurable: ["Measurable", "Measurability"],
			"Individually Complete": ["Individually Complete", "Individual Completeness"]
		};

		let total = 0;
		for (const [label, synonyms] of Object.entries(metricSynonyms)) {
			const matched = synonyms.some((syn) =>
                new RegExp(
                  `(^|\\n)[ \\t#>*-]*\\*{0,2}${syn
                    .trim()
                    .replace(/\s+/g, '[\\s_]+')}\\*{0,2}\\s*[:：]?\\s*\\(?\\s*1\\s*\\)?\\s*(\\n|$)`,
                  "i"
                ).test(text)
              );              
                                                   
			console.log(`📊 ${label}:`, matched ? 1 : 0);
			if (matched) total++;
		}

		const qualityLevels = {
			3: "High quality requirement",
			2: "Fix recommended",
			1: "Should be fixed",
			0: "Must be fixed"
		};

		console.log("✅ Score total:", total);
		console.log("🏷️ Evaluation:", qualityLevels[total as keyof typeof qualityLevels]);
        if (total !== 3) {
            text = text
                // Remove metric lines and descriptions
                .replace(/^\s*(Unambiguous|Unambigious|Ambiguity|Measurable|Measurability|Individually Complete|Individual Completeness)\s*[:：]?\s*\(?\s*1\s*\)?\s*$/gim, '')
                .replace(/^\s*(\d+\.|[-–*])?\s*\*?\*?(Unambiguous|Ambiguity|Measurable|Measurability|Individually Complete|Individual Completeness)\*?\*?\s*[:：]?\s*\(?1\)?\)?\s*.*(?:\r?\n(\s*[-–•*] .*|.*))*$/gim, "")
        
                // 🔥 Remove everything before "Advice" only
                .replace(/^[\s\S]*?(?=\bAdvice:|\*\*?Advice)/i, '')
        
                // Collapse multiple blank lines
                .replace(/\n{2,}/g, "\n")
                .trim();
        
            // 💡 Make "Corrected requirement:" bold
            text = text.replace(/(^|\n)(Corrected requirement:)/i, '$1**$2**');
        }
        
		if (total === 3) {
			text = text
                .replace(/^\s*(AI Validation|Analysis|Requirement Assessment|Advice)\s*[:：]?\s*$/gim, "")
                .replace(/^\s*\*{1,2}\s*(AI Validation|Analysis|Requirement Assessment|Advice)\s*\*{1,2}\s*[:：]?\s*$/gim, "")
                            // Remove numbered or bulleted metric lines
                .replace(/^\s*(Unambiguous|Unambigious|Ambiguity|Measurable|Measurability|Individually Complete|Individual Completeness)\s*[:：]?\s*\(?\s*1\s*\)?\s*$/gim, '')
				.replace(/^\s*(\d+\.|[-–*])?\s*\*?\*?(Unambiguous|Ambiguity|Measurable|Measurability|Individually Complete|Individual Completeness)\*?\*?\s*[:：]?\s*\(?1\)?\)?\s*.*(?:\r?\n(\s*[-–•*] .*|.*))*$/gim, "")
				// Remove generic high quality lines
				.replace(/^\s*The requirement is of high quality\.*\s*$/gim, "")
				.replace(/^Corrected requirement:\s*.+$/gim, "")
				.replace(/\n{2,}/g, "\n")
                .replace(/^\*\*(High[- ]Quality|Conclusion|Requirement Assessment)\*\*:?$/gim, "")
                .replace(/^Requirement:\s?.*$/gim, "")
                .replace(/^The requirement is (clear|of high quality|clear, measurable, and complete)\.?$/gim, "")
				.trim();
		}

		return NextResponse.json({ analysis: text, score: total });
	} catch (e: any) {
		console.error("❌ Server error:", e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}
