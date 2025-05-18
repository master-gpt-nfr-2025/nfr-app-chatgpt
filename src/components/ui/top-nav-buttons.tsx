"use client";
import { Stack, Tooltip } from "@mui/joy";
import React from "react";
import NavButton from "./nav-button";

const TopNavButtons = () => {
	return (
		<Stack direction="column" justifyContent="center" alignItems="center" spacing={2}>
			<NavButton icon="ph:list-checks-bold" href="/requirements" title="Lista wymagań" />
			<NavButton icon="ph:book-open-text-bold" href="/templates" title="Katalog szablonów" />
			<NavButton icon="ph:magic-wand-bold" href="/create-requirement" title="Kreator wymagań" />
			<NavButton icon="ph:file-text-bold" href="/project-description" title="Opis projektu" />
			<NavButton icon="ph:gear-six-bold" href="/admin/validation-logs" title="Panel Administratora" />
		</Stack>
	);
};

export default TopNavButtons;
