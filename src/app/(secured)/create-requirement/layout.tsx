import { Box, Card, Stack, Typography } from "@mui/joy";
import React from "react";

export default async function RequirementsLayout({ children }: { children: React.ReactNode }) {
	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
			<Typography level="h3">Kreator wymagań</Typography>
			<Typography level="body-md">Użyj kreatora aby stworzyć nowe wymaganie</Typography>
			<Stack gap={2} alignItems="flex-start" direction="row">
				<Card variant="plain" sx={{ flex: 1 }}>
					{children}
				</Card>
			</Stack>
		</Box>
	);
}
