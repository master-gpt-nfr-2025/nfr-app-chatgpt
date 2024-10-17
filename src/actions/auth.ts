"use server";
import type { LoginData } from "@/app/(public)/login/page";
import { signIn, signOut } from "@/auth";

type LoginFormData = "google" | "github";

export async function doSocialLogin(provider: LoginFormData) {
	await signIn(provider, { redirectTo: "/" });
}

export async function doCredentialsLogin(data: LoginData) {
	const response = await signIn("credentials", {
		email: data.email,
		password: data.password,
		redirect: false,
	});
	return response;
}

export async function doLogout() {
	await signOut({ redirectTo: "/" });
}
