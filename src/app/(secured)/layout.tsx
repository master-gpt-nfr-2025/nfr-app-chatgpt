import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Box, Stack, Typography } from "@mui/joy";
import TopNavButtons from "@/components/ui/top-nav-buttons";
import BottomNavButtons from "@/components/ui/bottom-nav-buttons";
import Image from "next/image";
import Link from "next/link";
import { UserHandler } from "@/components/UserHandler";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "NFR GUI",
	description: "Non-functional requirements made easy",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<UserHandler>
					<Stack
						direction="row"
						sx={{
							bgcolor: "background.surface",
							position: "fixed",
							left: 0,
							top: 0,
							p: "2rem",
							ml: "100px",
							width: "calc(100% - 100px)",
							boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
							zIndex: 10,
						}}
					>
						<Typography sx={{ fontWeight: 600 }} level="h4">
							Wymagania pozafunkcjonalne dla serwisu StudentDeal
						</Typography>
					</Stack>
					<Stack
						direction="column"
						justifyContent="space-between"
						alignItems="center"
						sx={{ bgcolor: "background.body", position: "fixed", p: "2rem", left: 0, top: 0, height: "100%", zIndex: 11 }}
					>
						<Stack gap={2} justifyContent="center" alignItems="center">
							<Link href="/">
								<Box sx={{ transition: "0.2s all", "&:hover": { opacity: 0.9 } }}>
									<Image src="/logoipsum.svg" alt="Logo" width={36} height={36} />
								</Box>
							</Link>
							<TopNavButtons />
						</Stack>
						<BottomNavButtons />
					</Stack>
					<Box
						sx={{
							bgcolor: "background.level1",
							mt: "88px",
							p: "2rem",
							pl: "calc(100px + 2rem)",
							width: "100%",
							height: "100%",
						}}
					>
						{children}
					</Box>
				</UserHandler>
				<Analytics />
			</body>
		</html>
	);
}
