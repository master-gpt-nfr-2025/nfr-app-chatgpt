"use server";

import { revalidatePath } from "next/cache";
import User from "@/models/user.model";
import connect from "@/config/db";

export async function createUser(username: string, email: string, name: string, role: string = "user") {
	try {
		await connect();
		const existingUser = await User.findOne({
			$or: [{ username }, { email }],
		});

		if (existingUser) {
			throw new Error("User already exists");
		}

		const user = await User.create({ username, email, name, role });

		if (!user) {
			throw new Error("Invalid data");
		}

		revalidatePath("/");
		return { id: user._id.toString(), username: user.username };
	} catch (error) {
		console.error("Failed to create user:", error);
	}
}
