import mongoose, { Schema } from "mongoose";

const UserSchema = new mongoose.Schema({
		_id: {
		type: Schema.Types.ObjectId,
		auto: true, // let Mongoose generate it
	},
	name: {
		type: String,
		required: [true, "Please provide a name"],
		maxlength: [60, "Name cannot be more than 60 characters"],
	},
	role: {
		type: String,
		enum: ["user", "admin"],
		default: "user",
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	requirements: [{ type: Schema.Types.ObjectId, ref: "Requirement" }],
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
