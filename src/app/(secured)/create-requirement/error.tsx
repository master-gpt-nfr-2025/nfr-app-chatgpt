"use client";
import { KeyboardReturn, SentimentVeryDissatisfiedOutlined } from "@mui/icons-material";
import { Button, Card, Stack, Typography } from "@mui/joy";
import { revalidatePath } from "next/cache";
import { useRouter } from "next/navigation";
import React from "react";

const CreateRequirementError = () => {
	const router = useRouter();

	return (
		<Card variant="plain" sx={{ flex: 3, minHeight: "60vh" }}>
			<Stack spacing={2} alignItems={"center"}>
				<SentimentVeryDissatisfiedOutlined color="error" fontSize="large" />
				<Stack textAlign={"center"}>
					<Typography level="h4">Wystąpił błąd</Typography>
					<Typography>Nie przejmuj się, to nie twoja wina :)</Typography>
				</Stack>
				<Button
					onClick={() => {
						revalidatePath("/create-requirement");
						router.refresh();
					}}
					color="primary"
					variant="soft"
					endDecorator={<KeyboardReturn />}
				>
					Wróć
				</Button>
			</Stack>
		</Card>
	);
};

export default CreateRequirementError;
