import { Box, Button, Checkbox, Divider, FormControl, FormLabel, IconButton, Input, Link, Stack, Typography } from "@mui/joy";
import React from "react";
import GoogleIcon from "./google-icon";

const Login = () => {
	return (
		<Box
			component="main"
			sx={{
				my: "auto",
				py: 2,
				pb: 5,
				display: "flex",
				flexDirection: "column",
				gap: 2,
				width: 400,
				maxWidth: "100%",
				mx: "auto",
				borderRadius: "sm",
				"& form": {
					display: "flex",
					flexDirection: "column",
					gap: 2,
				},
				[`& .MuiFormLabel-asterisk`]: {
					visibility: "hidden",
				},
			}}
		>
			<Stack sx={{ gap: 4, mb: 2 }}>
				<Stack sx={{ gap: 1 }}>
					<Typography component="h1" level="h3">
						Zaloguj się
					</Typography>
					<Typography level="body-sm">
						Nie masz jeszcze konta?{" "}
						<Link href="#replace-with-a-link" level="title-sm">
							Zarejestruj się!
						</Link>
					</Typography>
				</Stack>
				<Divider>lub</Divider>
				<Button variant="soft" color="neutral" fullWidth startDecorator={<GoogleIcon />}>
					Kontynuuj z Google
				</Button>
			</Stack>

			<Stack sx={{ gap: 4, mt: 2 }}>
				<form>
					<FormControl required>
						<FormLabel>Email</FormLabel>
						<Input type="email" name="email" />
					</FormControl>
					<FormControl required>
						<FormLabel>Hasło</FormLabel>
						<Input type="password" name="password" />
					</FormControl>
					<Stack sx={{ gap: 4, mt: 2 }}>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<Checkbox size="sm" label="Zapamiętaj mnie" name="persistent" />
							<Link level="title-sm" href="#replace-with-a-link">
								Nie pamiętasz hasła?
							</Link>
						</Box>
						<Button type="submit" fullWidth>
							Zaloguj się
						</Button>
					</Stack>
				</form>
			</Stack>
		</Box>
	);
};

export default Login;
