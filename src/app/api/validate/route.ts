// app/api/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID!;

export async function POST(req: NextRequest) {
  try {
    const { systemDescription, actors, requirement } = await req.json();

    const userMessage =
      `I am the Requirements Engineer. I want to elicitate the quality and completeness of my non-functional requirement.\n` +
      `Requirement: ${requirement}\n\n` +
      `System Description: ${systemDescription}\n` +
      `Actors: ${actors.join(", ")}`;

    const thread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userMessage,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID,
    });

    // Poll for result
    let status = run.status;
    while (status !== "completed" && status !== "failed") {
      await new Promise((res) => setTimeout(res, 1000));
      const updatedRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      status = updatedRun.status;
    }

    if (status === "failed") throw new Error("Assistant run failed");

    const messages = await openai.beta.threads.messages.list(thread.id);
    const last = messages.data.find((msg) => msg.role === "assistant");
    const text = last?.content?.[0]?.type === "text" ? last.content[0].text.value : "No response";

    return NextResponse.json({ analysis: text });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
