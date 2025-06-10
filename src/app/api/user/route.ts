import connectDB from "@/config/db";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
	const userId = req.headers.get("x-user-id");
	if (!userId) {
		return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
	}

	await connectDB();

	const user = await User.findById(userId);
	if (!user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	return NextResponse.json({
		id: user._id.toString(),
		name: user.name,
		role: user.role,
		createdAt: user.createdAt,
	});
}

export async function POST(req: Request) {
	await connectDB();
	const { id, name } = await req.json();

	if (!name) {
		return NextResponse.json({ error: "Missing name" }, { status: 400 });
	}

	let user = null;

	// Try to find by ID first
	if (id) {
		user = await User.findById(id);
		if (user && user.name === name) {
			console.log(`✅ Found user by ID and name match: ${name}`);
			return NextResponse.json({
				id: user._id.toString(),
				name: user.name,
				role: user.role,
				createdAt: user.createdAt,
			});
		}
	}

	// Try to find by name
	if (!user) {
		user = await User.findOne({ name });
		if (user) {
			console.log(`✅ Found existing user by name: ${name}`);
			return NextResponse.json({
				id: user._id.toString(),
				name: user.name,
				role: user.role,
				createdAt: user.createdAt,
			});
		}
	}

	// Create new user
	const newUser = await User.create({ name, role: "user" });
	console.log(`🆕 Created new user "${name}"`);

	return NextResponse.json({
		id: newUser._id.toString(),
		name: newUser.name,
		role: newUser.role,
		createdAt: newUser.createdAt,
	});
}
