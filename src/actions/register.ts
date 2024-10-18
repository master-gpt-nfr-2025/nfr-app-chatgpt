"use server";
import User from "@/models/user.model";
import connect from "@/config/db";
import { hashSync } from "bcrypt-ts";

export async function register(email: string, name: string, password?: string, role: string = "user") {
	try {
		await connect();
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return { error: "Użytkownik o tym adresie email już istnieje" };
		}

		if (password) {
			const hashedPassword = hashSync(password, 10);
			const user = await User.create({ name, password: hashedPassword, email, role });
			if (!user) {
				return { error: "Nie udało się zarejestrować użytkownika" };
			}
			const savedUser = await user.save();
			return { success: true, user: { id: savedUser._id, name: savedUser.name, email: savedUser.email, role: savedUser.role } };
		} else {
			const user = await User.create({ name, email, role });
			if (!user) {
				return { error: "Nie udało się zarejestrować użytkownika" };
			}
			const savedUser = await user.save();
			return { success: true, user: { id: savedUser._id, name: savedUser.name, email: savedUser.email, role: savedUser.role } };
		}
	} catch (error) {
		console.warn("Failed to create user:", error);
		return { error: "Wystąpił błąd podczas rejestracji" };
	}
}
