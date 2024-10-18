"use client";
import { useRequirementData } from "@/hooks/useRequirementData";
import ParsedRequirementText from "./parsed-requirement-text";
import RequirementFields from "@/components/ui/requirement-fields";
import { Requirement } from "@/types/requirement";
import { Button, FormControl, IconButton, Input, Snackbar, Stack, Tooltip, Typography } from "@mui/joy";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { moveToTrash, restoreFromTrash, updateRequirement as updateRequirementDB } from "@/lib/actions-requirement";
import { useSession } from "next-auth/react";

type RequirementCardProps = {
	initialRequirement: Requirement;
};

type SnackbarState = {
	message: string;
	color?: "success" | "warning" | "danger" | "neutral" | "primary";
	title?: string;
	startDecorator?: React.ReactNode;
	endDecorator?: React.ReactNode;
};

const RequirementCard = ({ initialRequirement }: RequirementCardProps) => {
	const { requirement, parsedText, updateRequirement, resetRequirement } = useRequirementData(initialRequirement);
	const session = useSession();
	const user = session.data?.user;

	const [edit, setEdit] = useState<boolean>(false);
	const [editedName, setEditedName] = useState<string>(requirement.name);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<boolean>(false);
	const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
	const [snackbarState, setSnackbarState] = useState<SnackbarState>({ message: "", color: "neutral" });

	const [confirmCancel, setConfirmCancel] = useState<boolean>(false);
	const [confirmTrash, setConfirmTrash] = useState<boolean>(false);

	const [trashed, setTrashed] = useState<boolean>(requirement.trashed);

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setError(false);
		setEditedName(e.target.value);
		requirement.name = e.target.value;
	};

	const handleSave = async () => {
		setLoading(true);
		try {
			const updatedRequirement = await updateRequirementDB(requirement);
			if (!updatedRequirement) {
				setError(true);
				return;
			} else {
				setError(false);
				setSnackbarState({
					message: "Wymaganie zostało zapisane",
					color: "success",
					startDecorator: <Icon icon="ph:check-circle-fill" width={24} />,
				});
				setSnackbarOpen(true);
			}
		} catch (error) {
			console.error("Error while updating requirement: ", error);
			setSnackbarState({
				message: "Wystąpił błąd podczas aktualizacji wymagania",
				color: "danger",
				startDecorator: <Icon icon="ph:x-bold" width={24} />,
			});
		} finally {
			setEdit(false);
			setLoading(false);
		}
	};
	const handleCancel = () => {
		setConfirmCancel(true);
	};

	const handleTrash = async () => {
		setLoading(true);
		try {
			await moveToTrash(requirement.id, user?.id);
			setSnackbarState({
				title: "Wymaganie zostało przeniesione do kosza",
				message: "Możesz je przywrócić w dowolnym momencie w ciągu 30 dni od teraz",
				color: "warning",
				startDecorator: <Icon icon="ph:info-fill" width={24} />,
			});
			setSnackbarOpen(true);
			setTrashed(true);
		} catch (error) {
			console.error("Error while moving requirement to trash: ", error);
			setSnackbarState({
				message: "Wystąpił błąd podczas przenoszenia wymagania do kosza",
				color: "danger",
				startDecorator: <Icon icon="ph:x-bold" width={24} />,
			});
			setSnackbarOpen(true);
		} finally {
			setLoading(false);
			setConfirmTrash(false);
		}
	};

	const handleRestore = async () => {
		setLoading(true);
		try {
			await restoreFromTrash(requirement._id!);
			setSnackbarState({
				message: "Wymaganie zostało przywrócone",
				color: "success",
				startDecorator: <Icon icon="ph:check-circle-fill" width={24} />,
			});
			setSnackbarOpen(true);
			setTrashed(false);
		} catch (error) {
			console.error("Error while restoring requirement: ", error);
			setSnackbarState({
				message: "Wystąpił błąd podczas przywracania wymagania",
				color: "danger",
				startDecorator: <Icon icon="ph:x-bold" width={24} />,
			});
		} finally {
			setEdit(false);
			setLoading(false);
		}
	};

	const Buttons = () => {
		return edit ? (
			<Stack direction="row" gap={1}>
				<Button variant="soft" color="primary" onClick={handleSave} loading={loading}>
					<Stack direction="row" gap={1} alignItems="center">
						Zapisz
						<Icon icon="ph:check-bold" />
					</Stack>
				</Button>
				<IconButton variant="soft" color="danger" onClick={handleCancel}>
					<Icon icon="ph:x-bold" />
				</IconButton>
			</Stack>
		) : (
			<Stack direction="row" gap={1}>
				<IconButton variant="soft" color="primary" onClick={() => setEdit(true)}>
					<Icon icon="ph:pencil-simple-fill" />
				</IconButton>
				<IconButton variant="soft" color="danger" onClick={() => setConfirmTrash(true)}>
					<Icon icon="ph:trash-fill" />
				</IconButton>
				{/* {!confirmTrash ? (
					<IconButton variant="soft" color="danger" onClick={() => setConfirmTrash(true)}>
						<Icon icon="ph:trash-fill" />
					</IconButton>
				) : (
					<Button variant="soft" color="danger" onClick={() => {}} loading={loading}>
						Na pewno?
					</Button>
				)} */}
			</Stack>
		);
	};

	return (
		<>
			<Stack gap={1}>
				<Stack direction="row" gap={1} justifyContent="space-between" width={"100%"}>
					<Stack gap={0.5} direction="row" alignItems={"center"} width={"100%"}>
						{trashed && (
							<Tooltip title="To wymaganie zostało przeniesione do kosza" arrow>
								<Typography color="danger">
									<Icon icon="ph:trash-fill" height={24} />
								</Typography>
							</Tooltip>
						)}
						<Typography level="title-lg" sx={{ fontWeight: 600, color: "text.tertiary" }}>{`[${requirement.id}]`}</Typography>
						{!edit && (
							<Typography level="title-lg" sx={{ fontWeight: 600 }}>
								{requirement.name}
							</Typography>
						)}
						{edit && error && (
							<Tooltip title={"Istnieje już wymaganie o tej nazwie!"} color="danger" placement="right" variant="soft" arrow>
								<FormControl>
									<Input
										size="lg"
										variant="plain"
										value={editedName}
										color={error ? "danger" : "primary"}
										sx={{ fontWeight: 600, width: "auto" }}
										onChange={handleNameChange}
										disabled={!edit}
									/>
								</FormControl>
							</Tooltip>
						)}{" "}
						{edit && !error && (
							<FormControl sx={{ width: "100%" }}>
								<Input
									size="lg"
									variant="plain"
									value={editedName}
									color={error ? "danger" : "primary"}
									sx={{ fontWeight: 600 }}
									onChange={handleNameChange}
									disabled={!edit}
								/>
							</FormControl>
						)}
					</Stack>
					{trashed ? (
						<Button
							variant="plain"
							color="primary"
							onClick={handleRestore}
							endDecorator={<Icon icon="ph:arrows-counter-clockwise-fill" height={24} />}
						>
							Przywróć
						</Button>
					) : (
						<Buttons />
					)}
				</Stack>
				{edit && !trashed && <RequirementFields requirement={requirement} updateRequirement={updateRequirement} />}
				<Typography level="body-md" sx={{ color: "text.secondary", fontWeight: 600 }}>
					Treść wymagania
				</Typography>
				<ParsedRequirementText parsedText={parsedText} color="neutral" />
				<Snackbar
					autoHideDuration={4000}
					open={snackbarOpen}
					variant="soft"
					color={snackbarState.color}
					onClose={() => {
						setSnackbarOpen(false);
					}}
					startDecorator={snackbarState.startDecorator}
					endDecorator={snackbarState.endDecorator}
				>
					<Stack direction="column" gap={1}>
						{snackbarState.title && <span>{snackbarState.title}</span>}
						<span>{snackbarState.message}</span>
					</Stack>
				</Snackbar>
			</Stack>
			<Snackbar
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
				sx={{ maxWidth: 360, display: "flex", alignItems: "flex-start" }}
				open={confirmCancel}
				variant="soft"
				color="warning"
				startDecorator={<Icon icon="ph:warning-circle-fill" width={24} />}
				onClose={() => {
					setConfirmCancel(false);
				}}
			>
				<div>
					<Typography level="title-lg" sx={{ fontWeight: 600 }}>
						Chwilka, na pewno?
					</Typography>
					<Typography sx={{ mt: 1, mb: 2 }}>Wprowadzone zmiany zostaną utracone</Typography>

					<Stack direction="row" spacing={1}>
						<Button
							variant="solid"
							color="warning"
							onClick={() => {
								resetRequirement();
								setEdit(false);
								setConfirmCancel(false);
							}}
						>
							Tak, na pewno
						</Button>
						<Button variant="outlined" color="warning" onClick={() => setConfirmCancel(false)}>
							Nie, zostaję
						</Button>
					</Stack>
				</div>
			</Snackbar>
			<Snackbar
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
				sx={{ maxWidth: 360, display: "flex", alignItems: "flex-start" }}
				open={confirmTrash}
				variant="soft"
				color="warning"
				startDecorator={<Icon icon="ph:warning-circle-fill" width={24} />}
				onClose={() => {
					setConfirmTrash(false);
				}}
			>
				<div>
					<Typography level="title-lg" sx={{ fontWeight: 600 }}>
						Chwilka, na pewno?
					</Typography>
					<Typography sx={{ mt: 1, mb: 2 }}>Wymaganie zostanie przeniesione do kosza</Typography>

					<Stack direction="row" spacing={1}>
						<Button
							variant="solid"
							color="warning"
							onClick={() => {
								handleTrash();
							}}
						>
							Usuń
						</Button>
						<Button
							variant="outlined"
							color="warning"
							onClick={() => {
								setConfirmTrash(false);
							}}
						>
							Anuluj
						</Button>
					</Stack>
				</div>
			</Snackbar>
		</>
	);
};

export default RequirementCard;
