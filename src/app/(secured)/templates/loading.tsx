import { CircularProgress, Stack, Typography } from "@mui/joy";
import { Box } from "@mui/material";
import React from "react";

const LoadingCategories = () => {
	return (
		<Stack justifyContent="center" gap={2} alignItems="center" sx={{ height: "100%", width: "100%", flex: 3.125 }}>
			<CircularProgress sx={{ mt: "5rem" }} />
			<Typography level="h4" sx={{ color: "text.tertiary" }}>
				Ładowanie
			</Typography>
		</Stack>
	);
};

export default LoadingCategories;
