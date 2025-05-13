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
			`I am the Requirements Engineer. I want to elicitate the quality and completeness of my non-functional requirement.\n` +
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
		const text = last?.content?.[0]?.type === "text" ? last.content[0].text.value : "No response";

		console.log("✅ Final response:", text);

		return NextResponse.json({ analysis: text });
	} catch (e: any) {
		console.error("❌ Server error:", e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}
