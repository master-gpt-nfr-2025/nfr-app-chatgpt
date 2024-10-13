import { Stack, Typography } from "@mui/joy";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
	const session = await auth();

	if (!session?.user) redirect("/login");

	return (
		<Stack gap={2}>
			<Typography level="h3">Jakub Ratajczyk 144327</Typography>
			<Typography level="h4">GUI dla pozyskiwania wymagań pozafunkcjonalnych w oparciu o szablony i jego ocena empiryczna</Typography>
			<Typography>{session?.user.name}</Typography>
		</Stack>
	);
}
