import { Box, Typography } from "@mui/joy";
import React from "react";

const Templates = () => {
	return (
		<Box sx={{ textAlign: "center" }}>
			<Typography level="body-md" sx={{ color: "text.tertiary" }}>
				Wybierz szablon z widoku po lewej aby zobaczyć jego szczegóły. Możesz też utworzyć z niego nowe wymaganie.
			</Typography>
		</Box>
	);
};

export default Templates;
