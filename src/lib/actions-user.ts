"use server";

import connect from "@/config/db";
import User from "@/models/user.model";

export async function createUser(name: string, id?: string) {
	await connect();

	let user = null;

	// Try to find by ID
	if (id) {
		user = await User.findById(id);
		if (user && user.name === name) {
			console.log("✅ Found user by ID");
			return {
				id: user._id.toString(),
				name: user.name,
				role: user.role,
				createdAt: user.createdAt,
			};
		}
	}

	// Try to find by name
	if (!user) {
		user = await User.findOne({ name });
		if (user) {
			console.log("✅ Found user by name");
			return {
				id: user._id.toString(),
				name: user.name,
				role: user.role,
				createdAt: user.createdAt,
			};
		}
	}

	// Create new user
	const newUser = await User.create({ name, role: "user" });
	console.log("🆕 Created user");

	return {
		id: newUser._id.toString(),
		name: newUser.name,
		role: newUser.role,
		createdAt: newUser.createdAt,
	};
}
