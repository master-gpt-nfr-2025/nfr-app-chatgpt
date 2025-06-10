"use client";

import React, { useState } from "react";
import {
	Modal,
	Input,
	Button,
	DialogContent,
	DialogTitle,
	FormControl,
	ModalDialog
} from "@mui/joy";
import { createUser } from "@/lib/actions-user";
import { useUserContext } from "@/components/UserProvider";

interface NamePopupProps {
	onComplete: () => void;
}

export function NamePopup({ onComplete }: NamePopupProps) {
	const [name, setName] = useState("");
	const [open, setOpen] = useState(true);
	const [loading, setLoading] = useState(false);
	const { setUserStorage } = useUserContext();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setName(e.target.value);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const existingId = localStorage.getItem("userId");
			const user = await createUser(name.trim(), existingId || undefined);

			if (user?.id && user?.name) {
				setUserStorage(user.name); // calls POST again only if needed
				setOpen(false);
				onComplete();
			}
		} catch (error) {
			console.error("❌ Error in NamePopup submission:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal open={open}>
			<ModalDialog size="md">
				<DialogTitle component="div">Podaj swoje imię</DialogTitle>
				<DialogContent>
					Podaj imię, które będzie Cię identyfikować podczas korzystania z aplikacji
				</DialogContent>

				<form onSubmit={handleSubmit}>
					<FormControl>
						<Input
							placeholder="Wpisz swoje imię"
							variant="soft"
							value={name}
							onChange={handleChange}
							required
						/>
						<Button
							variant="solid"
							color="primary"
							type="submit"
							sx={{ mt: 2 }}
							loading={loading}
						>
							Zapisz
						</Button>
					</FormControl>
				</form>
			</ModalDialog>
		</Modal>
	);
}
