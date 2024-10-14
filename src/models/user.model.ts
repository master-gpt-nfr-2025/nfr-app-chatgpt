import mongoose, { Schema } from "mongoose";

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please provide a name"],
		maxlength: [60, "Name cannot be more than 60 characters"],
	},
	username: {
		type: String,
		required: [true, "Please provide a username"],
		maxlength: [60, "Name cannot be more than 60 characters"],
	},
	email: {
		type: String,
		required: [true, "Please provide an email"],
		unique: true,
		match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "Please provide a valid email"],
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
