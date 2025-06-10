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
  rating: Number,
  wasIgnoreClicked: Boolean,
  wasUseSuggestionClicked: Boolean,
  feedback: [String],
  otherFeedback: String,
  timestamp: { type: Date, default: Date.now },
});

// Avoid overwrite errors
if (mongoose.models.ValidationLog) {
  delete mongoose.models.ValidationLog;
}
const ValidationLog = mongoose.model("ValidationLog", validationLogSchema);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📥 POST /api/log-validation → received body:", JSON.stringify(body, null, 2));

    if (!mongoose.connection.readyState) {
      console.log("🔌 Connecting to MongoDB...");
      await mongoose.connect(CONFIG.MONGO.connectionString);
    }

    const createdLog = await ValidationLog.create(body);
    console.log("✅ Log successfully created with ID:", createdLog._id);

    return NextResponse.json({ message: "Log saved", id: createdLog._id }, { status: 201 });
  } catch (err) {
    console.error("❌ Logging error:", err);
    return NextResponse.json({ error: "Logging failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!mongoose.connection.readyState) {
      console.log("🔌 Connecting to MongoDB...");
      await mongoose.connect(CONFIG.MONGO.connectionString);
    }

    const logs = await ValidationLog.find().sort({ timestamp: -1 }).lean();
    console.log(`📤 GET /api/log-validation → returned ${logs.length} logs`);
    return NextResponse.json({ logs }, { status: 200 });
  } catch (err) {
    console.error("❌ Failed to fetch logs:", err);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const {
      id,
      rating,
      wasIgnoreClicked,
      wasUseSuggestionClicked,
      feedback,
      otherFeedback,
    } = await req.json();

    console.log("🛠️ PUT /api/log-validation → received:", {
      id,
      rating,
      wasIgnoreClicked,
      wasUseSuggestionClicked,
      feedback,
      otherFeedback,
    });

    if (!id) {
      console.warn("⚠️ Missing ID in update payload");
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    if (!mongoose.connection.readyState) {
      console.log("🔌 Connecting to MongoDB...");
      await mongoose.connect(CONFIG.MONGO.connectionString);
    }

    const update: Record<string, any> = {};
    if (rating !== undefined) update.rating = rating;
    if (wasIgnoreClicked !== undefined) update.wasIgnoreClicked = wasIgnoreClicked;
    if (wasUseSuggestionClicked !== undefined) update.wasUseSuggestionClicked = wasUseSuggestionClicked;
    if (feedback !== undefined) update.feedback = feedback;
    if (otherFeedback !== undefined) update.otherFeedback = otherFeedback;

    console.log("📝 Update object:", update);

    const result = await ValidationLog.findByIdAndUpdate(id, update, { new: true });

    if (!result) {
      console.warn("❌ Log not found for ID:", id);
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    console.log("✅ Log updated successfully:", result._id);
    return NextResponse.json({ message: "Log updated", log: result });
  } catch (err) {
    console.error("❌ Update failed:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
