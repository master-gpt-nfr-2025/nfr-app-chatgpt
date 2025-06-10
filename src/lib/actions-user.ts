// /lib/actions-user.ts
"use server";

import { headers } from "next/headers";

export async function createUser(name: string, id?: string) {
	const headersList = headers();
	const host = headersList.get("host");
	const protocol = process.env.VERCEL_ENV === "production" ? "https" : "http";
	const baseUrl = `${protocol}://${host}`;

	const res = await fetch(`${baseUrl}/api/user`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name, id }),
	});

	if (!res.ok) {
		throw new Error("❌ Failed to create or fetch user");
	}

	return await res.json();
}
