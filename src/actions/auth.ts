"use server";
import { signIn, signOut } from "@/auth";

type LoginFormData = {
	action: "credentials" | "google";
	email?: string;
	password?: string;
};

export async function doSocialLogin(formData: LoginFormData) {
	const action = formData.action;
	if (action === "google") {
		await signIn(action, { redirectTo: "/" });
	}
}

export async function doLogout() {
	await signOut({ redirectTo: "/" });
}
