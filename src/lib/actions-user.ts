// ✅ Final corrected code for role assignment and persistence
// /lib/actions-user.ts
"use server";

import { revalidatePath } from "next/cache";
import User from "@/models/user.model";
import connect from "@/config/db";

export async function createUser(name: string, id?: string) {

	const res = await fetch("/api/user", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name, id }),
	});

	if (!res.ok) {
		throw new Error("❌ Failed to create or fetch user");
	}

	return await res.json();
}
