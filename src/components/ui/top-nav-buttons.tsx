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
			<NavButton icon="ph:file-text" href="/project-description" title="Opis projektu" />
		</Stack>
	);
};

export default TopNavButtons;
