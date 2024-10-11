import { Add } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/joy";
import Link from "next/link";
import React from "react";

const RequirementsPage = () => {
	return (
		<Box sx={{ textAlign: "center", flex: 4 }}>
			<Typography level="body-md" sx={{ color: "text.tertiary", mb: "1rem" }}>
				Wybierz wymaganie z widoku po lewej aby zobaczyć jego szczegóły. Jeśli nie widzisz żadnych wymagań możesz je dodać
			</Typography>
			<Link href={"/create-requirement"}>
				<Button startDecorator={<Add />}>Dodaj wymaganie przez kreator</Button>
			</Link>
		</Box>
	);
};

export default RequirementsPage;
