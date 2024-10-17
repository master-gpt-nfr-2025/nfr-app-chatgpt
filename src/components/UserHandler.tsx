// components/UserHandler.tsx
"use client";
import React from "react";
import { UserProvider } from "../context/userContext";

export function UserHandler({ children }: { children: React.ReactNode }) {
	return <UserProvider>{children}</UserProvider>;
}
