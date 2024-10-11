import { UserHandler } from "@/components/UserHandler";
import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { Box, Typography } from "@mui/joy";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "NFR GUI",
	description: "Access the app by logging in",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<UserHandler>
					<Box
						sx={{
							width: { xs: "100%", md: "50vw" },
							transition: "width var(--Transition-duration)",
							transitionDelay: "calc(var(--Transition-duration) + 0.1s)",
							position: "relative",
							zIndex: 1,
							display: "flex",
							justifyContent: "flex-end",
							backdropFilter: "blur(12px)",
							backgroundColor: "rgba(255 255 255 / 0.2)",
						}}
					>
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								minHeight: "100dvh",
								width: "100%",
								px: 2,
							}}
						>
							<Box component="header" sx={{ p: "2rem", display: "flex", justifyContent: "space-between" }}>
								<Box sx={{ gap: 2, display: "flex", alignItems: "center" }}>
									<Link href="/">
										<Box sx={{ transition: "0.2s all", "&:hover": { opacity: 0.9 } }}>
											<Image src="/logoipsum.svg" alt="Logo" width={36} height={36} />
										</Box>
									</Link>
									<Typography level="title-lg">NFR GUI</Typography>
								</Box>
								{/* <ColorSchemeToggle /> */}
							</Box>
							{children}
						</Box>
					</Box>
					<Box
						sx={{
							height: "100%",
							position: "fixed",
							right: 0,
							top: 0,
							bottom: 0,
							left: { xs: 0, md: "50vw" },
							transition: "background-image var(--Transition-duration), left var(--Transition-duration) !important",
							transitionDelay: "calc(var(--Transition-duration) + 0.1s)",
							backgroundColor: "background.level1",
							backgroundSize: "cover",
							backgroundPosition: "center",
							backgroundRepeat: "no-repeat",
							backgroundImage: "url(/login.jpg)",
						}}
					/>
				</UserHandler>
			</body>
		</html>
	);
}
