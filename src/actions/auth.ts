"use server";
import { signIn } from "@/auth";

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
	console.log("doSocialLogin", action);
	// Handle the social login logic here
}
