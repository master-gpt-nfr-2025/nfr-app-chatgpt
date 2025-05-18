import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { CONFIG } from "@/config/config";

const validationLogSchema = new mongoose.Schema({
  userId: String,
  systemDescription: String,
  rawRequirement: String,
  templateName: String,
  validationResponse: String,
  validationScore: Number,
  correctedRequirement: String,
  timestamp: { type: Date, default: Date.now },
});

const ValidationLog = mongoose.models.ValidationLog || mongoose.model("ValidationLog", validationLogSchema);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!mongoose.connection.readyState) {
      await mongoose.connect(CONFIG.MONGO.connectionString);
    }

    await ValidationLog.create(body);
    return NextResponse.json({ message: "Log saved" }, { status: 201 });
  } catch (err) {
    console.error("❌ Logging error:", err);
    return NextResponse.json({ error: "Logging failed" }, { status: 500 });
  }
}
