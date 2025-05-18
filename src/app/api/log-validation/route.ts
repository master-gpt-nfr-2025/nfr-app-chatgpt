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
    unambiguous: Number,
    measurable: Number,
    individuallyCompleted: Number,
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

export async function GET() {
  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(CONFIG.MONGO.connectionString);
    }

    const logs = await ValidationLog.find().sort({ timestamp: -1 }).lean();
    return NextResponse.json({ logs }, { status: 200 });
  } catch (err) {
    console.error("❌ Failed to fetch logs:", err);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
