"use client";
import { Stack } from "@mui/joy";
import React, { useEffect } from "react";
import NavButton from "./nav-button";
import { useUserContext } from "@/components/UserProvider";

const TopNavButtons = () => {
	const { user } = useUserContext();

	useEffect(() => {
		if (user) {
			console.log(`👤 Logged-in user: ${user.name} | Role: ${user.role}`);
		} else {
			console.log("⚠️ No user context available.");
		}
	}, [user]);

	return (
		<Stack direction="column" justifyContent="center" alignItems="center" spacing={2}>
			<NavButton icon="ph:list-checks-bold" href="/requirements" title="Lista wymagań" />
			<NavButton icon="ph:book-open-text-bold" href="/templates" title="Katalog szablonów" />
			<NavButton icon="ph:magic-wand-bold" href="/create-requirement" title="Kreator wymagań" />
			<NavButton icon="ph:file-text-bold" href="/project-description" title="Opis projektu" />

			{user?.role === "admin" && (
				<NavButton icon="ph:gear-six-bold" href="/admin/validation-logs" title="Panel Administratora" />
			)}

			<NavButton icon="ph:file-arrow-up-bold" href="/mass-validation" title="AI mass validation" />
		</Stack>
	);
};

export default TopNavButtons;
