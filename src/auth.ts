import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import { GOOGLE } from "@/config/config";

import User from "@/models/user.model";
import { compare } from "bcrypt-ts";
import { register } from "./actions/register";

export const {
	handlers: { GET, POST },
	auth,
	signIn,
	signOut,
} = NextAuth({
	providers: [
		GoogleProvider({
			clientId: GOOGLE.clientId,
			clientSecret: GOOGLE.clientSecret,
			authorization: {
				params: {
					access_type: "offline",
					response_type: "code",
					prompt: "consent",
				},
			},
		}),
		CredentialsProvider({
			name: "Credentials",
			id: "credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (
					!credentials?.email ||
					!credentials?.password ||
					typeof credentials.email !== "string" ||
					typeof credentials.password !== "string"
				) {
					throw new Error("Nieprawidłowe dane uwierzytelniające");
				}

				const user = await User.findOne({ email: credentials.email }).select("+password");

				if (!user) {
					throw new Error("Ups! Niepoprawny email lub hasło");
				}
				const isMatch = await compare(credentials.password, user.password);

				if (!isMatch) {
					throw new Error("Ups! Niepoprawny email lub hasło");
				}

				return { email: user.email, name: user.name, role: user.role };
			},
		}),
	],
	session: {
		strategy: "jwt",
	},
	callbacks: {
		async signIn({ user, account }) {
			if (account?.provider === "google") {
				try {
					await register(user.email!, user.name!);
				} catch (error) {
					console.error(error);
				}
			}
			return true;
		},
	},
});
