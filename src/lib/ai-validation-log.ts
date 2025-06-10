// lib/logValidationResult.ts
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
  wasIgnoreClicked: Boolean,
  wasUseSuggestionClicked: Boolean,
  timestamp: { type: Date, default: Date.now },
});

const ValidationLog =
  mongoose.models.ValidationLog || mongoose.model("ValidationLog", validationLogSchema);

export const logValidationResult = async (log: {
  userId: string;
  systemDescription: string;
  rawRequirement: string;
  templateName?: string;
  validationResponse: string;
  unambiguous: number;
  measurable: number;
  individuallyCompleted: number;
  validationScore: number;
  correctedRequirement?: string;
  wasIgnoreClicked?: boolean;
  wasUseSuggestionClicked?: boolean;
}) => {
  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(CONFIG.MONGO.connectionString);
    }
    await ValidationLog.create(log);
    console.log("📝 Validation log saved to MongoDB.");
  } catch (err) {
    console.error("❌ Failed to log validation result:", err);
  }
};
