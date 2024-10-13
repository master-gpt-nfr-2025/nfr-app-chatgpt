import {
	Button,
	Chip,
	DialogContent,
	DialogTitle,
	FormControl,
	FormHelperText,
	FormLabel,
	Input,
	Modal,
	ModalClose,
	ModalDialog,
	Stack,
} from "@mui/joy";
import React, { useEffect, useState } from "react";
import { Requirement } from "@/types/requirement";
import { saveRequirement } from "@/lib/actions-requirement";
import { generateRequirementId } from "@/lib/mapping";
import { useUserContext } from "../../context/userContext";

type UseTemplateModalProps = {
	open: boolean;
	setOpen: (open: boolean) => void;
	requirement: Requirement;
	setReqId: React.Dispatch<React.SetStateAction<string | null>>;
	setSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
};

const UseTemplateModal = ({ open, setOpen, requirement, setReqId, setSnackbar }: UseTemplateModalProps) => {
	const [reqID, setReqID] = useState<string>(requirement?.id);
	const [name, setName] = useState<string>(requirement?.name);

	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<boolean>(false);
	const [errorText, setErrorText] = useState<string>("");

	const { user } = useUserContext();

	const handleCloseModal = (e: any, reason: string) => {
		if (reason === "backdropClick") {
			return;
		}
		setOpen(false);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setName(e.target.value);
		setErrorText("");
		setError(false);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		if (!name) {
			setError(true);
			setErrorText("Nazwa wymagania jest obowiązkowa!");
		}
		requirement.name = name;
		requirement.createdAt = new Date();
		requirement.createdThrough = "catalogue";
		if (user) {
			requirement.createdBy = user.id;
		}

		const createdRequirement = await saveRequirement(requirement, user?.id);
		if (!createdRequirement) {
			setError(true);
			setErrorText("Wymaganie o podanej nazwie już istnieje!");
		} else {
			setReqId(createdRequirement);
			setError(false);
			setErrorText("");
			setSnackbar(true);
			setOpen(false);
		}
		setLoading(false);
	};

	useEffect(() => {
		const getNewID = async () => {
			const newID = await generateRequirementId();
			setReqID(newID);
			requirement.id = newID;
		};

		if (open) {
			getNewID();
		}
	}, [open]);

	return (
		<>
			<Modal open={open} onClose={handleCloseModal}>
				<ModalDialog size="lg">
					<ModalClose variant="plain" color="danger" />
					<DialogTitle component="div">
						Utwórz nowe wymaganie
						<Chip color="primary">{reqID}</Chip>
					</DialogTitle>
					<DialogContent>Uzupełnij brakujące informacje aby utworzyć nowe wymaganie</DialogContent>

					<form onSubmit={handleSubmit}>
						<FormControl error={error}>
							<FormLabel sx={{ fontWeight: "600" }} htmlFor="requirement-name">
								Nazwa wymagania
							</FormLabel>
							<Input placeholder="Nazwa wymagania" variant="soft" value={name} onChange={handleChange} />
							<FormHelperText>{errorText}</FormHelperText>
							<Stack direction="row" spacing={1} sx={{ mt: 1 }}>
								<Button variant="solid" color="primary" type="submit" loading={loading}>
									Utwórz
								</Button>
								<Button variant="outlined" color="primary" onClick={() => setOpen(false)}>
									Anuluj
								</Button>
							</Stack>
						</FormControl>
					</form>
				</ModalDialog>
			</Modal>
		</>
	);
};

export default UseTemplateModal;
