"use client";
import { doLogout } from "@/actions/auth";
import { LogoutRounded } from "@mui/icons-material";
import { Button } from "@mui/joy";
import React, { useState } from "react";

const LogoutButton = () => {
	const [loading, setLoading] = useState(false);
	const handleLogout = async () => {
		setLoading(true);
		await doLogout();
		setLoading(false);
	};

	return (
		<Button onClick={handleLogout} color="primary" sx={{ maxWidth: 150 }} endDecorator={<LogoutRounded />} loading={loading}>
			Wyloguj
		</Button>
	);
};

export default LogoutButton;
