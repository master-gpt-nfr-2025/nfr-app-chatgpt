"use client";
import { Box, Button, Checkbox, Divider, FormControl, FormHelperText, FormLabel, Input, Link, Stack, Typography } from "@mui/joy";
import React from "react";
import GoogleIcon from "../google-icon";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const registerSchema = z.object({
	username: z.string().min(3, "Nazwa użytkownika powinna mieć co najmniej 3 znaki"),
	email: z.string().email("Niepoprawny adres email").min(3, "Email powinien mieć co najmniej 3 znaki"),
	password: z.string().min(8, "Hasło powinno mieć co najmniej 8 znaków"),
	persistent: z.boolean(),
});

type RegisterData = z.infer<typeof registerSchema>;

const SignUp = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			username: "",
			email: "",
			password: "",
		},
	});

	const onSubmit = (data: RegisterData) => {
		console.log("Form submitted:", data);
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
						Utwórz konto
					</Typography>
					<Typography level="body-sm">
						Masz już konto?{" "}
						<Link href="/login" level="title-sm">
							Zaloguj się!
						</Link>
					</Typography>
				</Stack>
			</Stack>
			<Stack sx={{ gap: 4, mt: 1 }}>
				<form onSubmit={handleSubmit(onSubmit)}>
					<FormControl required>
						<FormLabel>Nazwa użytkownika</FormLabel>
						<Input type="username" {...register("username")} error={!!errors.username} />
						<FormHelperText>{errors.username?.message}</FormHelperText>
					</FormControl>
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
					<Stack sx={{ gap: 4, mt: 2 }}>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<Checkbox size="sm" label="Zapamiętaj mnie" {...register("persistent")} />
						</Box>
						<Button type="submit" fullWidth>
							Utwórz konto
						</Button>
					</Stack>
				</form>
				<Divider>lub</Divider>
				<Button variant="soft" color="neutral" fullWidth startDecorator={<GoogleIcon />}>
					Kontynuuj z Google
				</Button>
			</Stack>
		</Box>
	);
};

export default SignUp;
