"use client";
import { Box, Button, Checkbox, Divider, FormControl, FormHelperText, FormLabel, Input, Link, Stack, Typography } from "@mui/joy";
import React, { useState } from "react";
import GoogleIcon from "../google-icon";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doCredentialsLogin, doSocialLogin } from "@/actions/auth";
import { redirect, useRouter } from "next/navigation";

const loginSchema = z.object({
	email: z.string().email("Niepoprawny adres email").min(3, "Email powinien mieć co najmniej 3 znaki"),
	password: z.string().min(8, "Hasło powinno mieć co najmniej 8 znaków"),
	persistent: z.boolean(),
});

export type LoginData = z.infer<typeof loginSchema>;

const Login = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const router = useRouter();

	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);

	const onSubmit = async (data: LoginData) => {
		try {
			setLoading(true);
			const response = await doCredentialsLogin(data);
			if (response.error) {
				setError(response.error as string);
				return;
			} else {
				router.replace("/");
			}
		} catch (error) {
			console.error(error);
			setError("Błąd logowania");
		} finally {
			setLoading(false);
		}
	};

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
						<Link href="/signup" level="title-sm">
							Zarejestruj się!
						</Link>
					</Typography>
				</Stack>
			</Stack>
			<Stack sx={{ gap: 4, mt: 1 }}>
				<form onSubmit={handleSubmit(onSubmit)}>
					<FormControl required error>
						<FormLabel>Email</FormLabel>
						<Input {...register("email")} error={!!errors.email} />
						<FormHelperText>{errors.email?.message}</FormHelperText>
					</FormControl>
					<FormControl required error>
						<FormLabel>Hasło</FormLabel>
						<Input type="password" {...register("password")} error={!!errors.password} />
						<FormHelperText>{errors.password?.message}</FormHelperText>
					</FormControl>
					{!!error && (
						<Typography level="body-sm" textColor={"danger.500"}>
							{error}
						</Typography>
					)}
					<Stack sx={{ gap: 4, mt: 2 }}>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<Checkbox size="sm" label="Zapamiętaj mnie" {...register("persistent")} />
							<Link level="title-sm" href="#replace-with-a-link">
								Nie pamiętasz hasła?
							</Link>
						</Box>
						<Button type="submit" fullWidth name="action" value="credentials" loading={loading}>
							Zaloguj się
						</Button>
					</Stack>
				</form>
				<Divider>lub</Divider>
				<Button onClick={() => doSocialLogin("google")} variant="soft" color="neutral" fullWidth startDecorator={<GoogleIcon />}>
					Kontynuuj z Google
				</Button>
			</Stack>
		</Box>
	);
};

export default Login;
