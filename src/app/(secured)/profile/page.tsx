"use client";
import { useUserContext } from "@/components/UserProvider";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Card, Stack, Typography, Button, Box } from "@mui/joy";
import React, { useState } from "react";

const Profile = () => {
	const { user, logout } = useUserContext();
	const [loading, setLoading] = useState(false);
	const handleLogout = () => {
		setLoading(true);
		logout();
		setLoading(false);
		window.location.reload();
	};
	return (
		<Stack gap={2}>
			<Typography level="h3">Profil</Typography>
			<Typography level="body-md">Informacje o zalogowanym i aktywnym użytkowniku</Typography>
			<Box sx={{ height: "calc(100vh - 88px - 9.5rem)" }}>
				<Card variant="plain">
					<Stack gap={0}>
						<Typography level="title-md">Nazwa użytkownika</Typography>
						<Typography level="h4">{user?.name}</Typography>
					</Stack>

					<Stack gap={0}>
						<Typography level="title-md">ID</Typography>
						<Typography level="h4">{user?.id}</Typography>
					</Stack>
					<Button
						color="primary"
						onClick={handleLogout}
						sx={{ maxWidth: 150 }}
						endDecorator={<Icon icon="ph:sign-out-bold" />}
						loading={loading}
					>
						Wyloguj
					</Button>
				</Card>
			</Box>
		</Stack>
	);
};

export default Profile;
