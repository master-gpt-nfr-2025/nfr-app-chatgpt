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
    timestamp: { type: Date, default: Date.now },
  });  

  if (mongoose.models.ValidationLog) {
    delete mongoose.models.ValidationLog;
  }
  
  const ValidationLog = mongoose.model("ValidationLog", validationLogSchema);
  
  export async function POST(req: NextRequest) {
    try {
      const body = await req.json();
      if (!mongoose.connection.readyState) {
        await mongoose.connect(CONFIG.MONGO.connectionString);
      }
  
      const createdLog = await ValidationLog.create(body);
      return NextResponse.json({ message: "Log saved", id: createdLog._id }, { status: 201 }); // <- return the _id
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

export async function PUT(req: NextRequest) {
    try {
        const { id, rating } = await req.json(); // ✅ accept 'id'
        if (!id || rating === undefined) {
          return NextResponse.json({ error: "Missing id or rating" }, { status: 400 });
        }
        
  
      if (!mongoose.connection.readyState) {
        await mongoose.connect(CONFIG.MONGO.connectionString);
      }
  
      const result = await ValidationLog.findByIdAndUpdate(
        id,
        { rating },
        { new: true }
      );
  
      if (!result) {
        return NextResponse.json({ error: "Log not found" }, { status: 404 });
      }
  
      return NextResponse.json({ message: "Rating updated", log: result });
    } catch (err) {
      console.error("❌ Update rating failed:", err);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
  }