"use client";
import { TrashedItemType } from "@/app/(secured)/trash/page";
import { removeRequirement, restoreFromTrash } from "@/lib/actions-requirement";
import { Icon } from "@iconify/react";
import { Button, Stack, Table, Typography, IconButton, Snackbar, Box } from "@mui/joy";
import React, { useState } from "react";
import Initials from "./initials";
import { useRouter } from "next/navigation";

type TrashedItemsProps = {
	items: TrashedItemType[];
};

type TrashedActionsProps = {
	itemId: string;
	index: number;
	elements: TrashedItemType[];
};

type SnackbarState = {
	message: string;
	color?: "success" | "warning" | "danger" | "neutral" | "primary";
	title?: string;
	startDecorator?: React.ReactNode;
	endDecorator?: React.ReactNode;
};

const TrashedItems = ({ items }: TrashedItemsProps) => {
	const router = useRouter();
	const TrashedActions = ({ itemId, index, elements }: TrashedActionsProps) => {
		const [loading, setLoading] = useState<boolean>(false);

		const handleRestore = async () => {
			try {
				await restoreFromTrash(itemId);
				setSnackbarState({
					message: "Wymaganie zostało przywrócone",
					color: "success",
					startDecorator: <Icon icon="ph:check-circle-fill" width={24} />,
				});
				elements.splice(index, 1);
				setSnackbarOpen(true);
				// setTrashed(false);
			} catch (error) {
				console.error("Error while restoring requirement: ", error);
				setSnackbarState({
					message: "Wystąpił błąd podczas przywracania wymagania",
					color: "danger",
					startDecorator: <Icon icon="ph:x-bold" width={24} />,
				});
			} finally {
				// setEdit(false);
			}
		};

		const handleDelete = async () => {
			await removeRequirement(itemId);
			elements.splice(index, 1);
			setSnackbarState({
				message: "Wymaganie zostało usunięte",
				color: "warning",
				startDecorator: <Icon icon="ph:info-fill" width={24} />,
			});
			setSnackbarOpen(true);
		};

		const handleGoto = () => {
			router.push(`/requirements/${itemId}`);
		};

		return (
			<Stack direction={"row"} gap={1}>
				<Button
					variant="soft"
					color="primary"
					onClick={handleRestore}
					endDecorator={<Icon icon="ph:arrows-counter-clockwise-fill" height={24} />}
				>
					Przywróć
				</Button>

				<IconButton variant="soft" color="primary" onClick={handleGoto} loading={loading}>
					<Icon icon="ph:eye-bold" />
				</IconButton>
				<IconButton variant="soft" color="danger" onClick={handleDelete} loading={loading}>
					<Icon icon="ph:trash-fill" />
				</IconButton>
			</Stack>
		);
	};

	const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
	const [snackbarState, setSnackbarState] = useState<SnackbarState>({ message: "", color: "neutral" });

	const formatTime = (time: Date) => {
		const hours = time.getHours();
		const minutes = time.getMinutes();
		return `${time.toLocaleDateString()}, ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
	};

	return (
		<Box sx={{ height: "calc(100vh - 88px - 11.5rem)" }}>
			<Table>
				<thead>
					<tr>
						<th style={{ width: "35%" }}>Nazwa</th>
						<th>Typ</th>
						<th>Utworzono</th>
						<th>Usunięto</th>
						<th>Akcje</th>
					</tr>
				</thead>
				<tbody>
					{items.map((row, index, rows) => (
						<tr key={row.id}>
							<td>
								<Stack direction={"row"} gap={1}>
									<Typography sx={{ color: "text.tertiary", fontWeight: 600 }}>[{row.id}]</Typography>
									<Typography>{row.name}</Typography>
								</Stack>
							</td>
							<td>{"Wymaganie"}</td>
							<td>
								<Stack direction={"row"} gap={1} alignItems={"center"}>
									<Initials name={row.createdBy.name} subtitle={row.createdBy._id} />
									{row.createdAt ? formatTime(new Date(row.trashedAt)) : "-"}
								</Stack>
							</td>
							<td>
								<Typography sx={{ fontWeight: 600, color: "text.tertiary" }}>{formatTime(new Date(row.trashedAt))}</Typography>
							</td>
							<td>
								<TrashedActions itemId={row._id} index={index} elements={rows} />
							</td>
						</tr>
					))}
				</tbody>
			</Table>
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
		</Box>
	);
};

export default TrashedItems;
