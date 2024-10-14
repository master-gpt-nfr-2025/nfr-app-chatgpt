import { auth } from "@/auth";
import LogoutButton from "@/components/ui/logout-button";
import { Card, Stack, Typography, Box } from "@mui/joy";
import React from "react";

const Profile = async () => {
	const session = await auth();

	return (
		<Stack gap={2}>
			<Typography level="h3">Profil</Typography>
			<Typography level="body-md">Informacje o zalogowanym i aktywnym użytkowniku</Typography>
			<Box sx={{ height: "calc(100vh - 88px - 9.5rem)" }}>
				<Card variant="plain">
					<Stack gap={0}>
						<Typography level="title-md">Nazwa użytkownika</Typography>
						<Typography level="h4">{session?.user?.name}</Typography>
					</Stack>

					<Stack gap={0}>
						<Typography level="title-md">Email</Typography>
						<Typography level="h4">{session?.user?.email}</Typography>
					</Stack>
					<LogoutButton />
				</Card>
			</Box>
		</Stack>
	);
};

export default Profile;
