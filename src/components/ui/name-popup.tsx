// components/NamePopup.tsx
"use client";

import React, { useState } from "react";
import { Modal, Input, Button, DialogContent, DialogTitle, FormControl, ModalDialog } from "@mui/joy";
import { createUser } from "@/lib/actions-user";
import { useUserContext } from "../../context/userContext";

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
		setLoading(true);
		e.preventDefault();
		if (name) {
			const user = await createUser(name, "test@test.example", name);
			setUserStorage(user?.id, user?.username);
			setOpen(false);
			onComplete();
		}
		setLoading(false);
	};

	return (
		<Modal open={open}>
			<ModalDialog size="md">
				{/* <ModalClose variant="plain" color="danger" /> */}
				<DialogTitle component="div">Podaj swoje imię</DialogTitle>
				<DialogContent>Podaj imię, które będzie Cię identyfikować podczas korzystania z aplikacji</DialogContent>

				<form onSubmit={handleSubmit}>
					<FormControl>
						<Input placeholder="Wpisz swoje imię" variant="soft" value={name} onChange={handleChange} />
						<Button variant="solid" color="primary" type="submit" sx={{ mt: 2 }} loading={loading}>
							Zapisz
						</Button>
					</FormControl>
				</form>
			</ModalDialog>
		</Modal>
	);
}
