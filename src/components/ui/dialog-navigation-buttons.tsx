"use client";
import {
	KeyboardArrowLeftRounded,
	KeyboardArrowRightRounded,
	AddRounded,
	Close as CloseIcon,
	ContentCopy as ContentCopyIcon,
	AutoAwesome as AutoAwesomeIcon,
} from "@mui/icons-material";
import {
	Button,
	Stack,
	Tooltip,
	IconButton,
	DialogTitle,
	DialogContent,
	DialogActions,
	CircularProgress,
	Typography,
} from "@mui/joy";
import React, { forwardRef, useState } from "react";
import { useCreateRequirementFormContext } from "@/context/createRequirementDialogContext";
import { Dialog } from "@mui/material";

type DialogNavigationButtonsProps = {
	nextActive?: boolean;
	submit?: boolean;
	loading?: boolean;
	nextVisible?: boolean;
};

const DialogNavigationButtons = forwardRef<HTMLDivElement, DialogNavigationButtonsProps>(
	({ nextActive, submit, loading, nextVisible = true }: DialogNavigationButtonsProps, ref) => {
		const {
			next,
			back,
			isFirstStep,
			isLastStep,
			currentStepIndex,
			setActiveStep,
		} = useCreateRequirementFormContext();

		const [aiDialogOpen, setAiDialogOpen] = useState(false);
		const [aiValidationResult, setAiValidationResult] = useState<string | null>(null);
		const [validating, setValidating] = useState(false);

		const handleBack = () => {
			setActiveStep(currentStepIndex - 1);
			back();
		};

		const handleNext = () => {
			setActiveStep(currentStepIndex + 1);
			next();
		};

		const handleAIValidation = async () => {
			setAiDialogOpen(true);
			setValidating(true);
			try {
				const result = ""
				setAiValidationResult(result);
			} catch (error) {
				setAiValidationResult("Validation failed: " + (error as Error).message);
			}
			setValidating(false);
		};

		return (
			<>
				<Stack direction={"row"} gap={1} ref={ref}>
					{!isFirstStep && !loading && (
						<Button onClick={handleBack} startDecorator={<KeyboardArrowLeftRounded />} variant="outlined">
							Wstecz
						</Button>
					)}
					{!isLastStep && nextVisible && (
						<Button onClick={handleNext} endDecorator={<KeyboardArrowRightRounded />} disabled={!nextActive}>
							Dalej
						</Button>
					)}
					{isLastStep && nextVisible && submit && (
						<>
							<Button onClick={handleNext} endDecorator={<AddRounded />} type="submit" loading={loading}>
								Zapisz wymaganie
							</Button>
							<Tooltip title="AI Walidacja">
								<IconButton onClick={handleAIValidation} color="primary">
									<AutoAwesomeIcon />
								</IconButton>
							</Tooltip>
						</>
					)}
				</Stack>

				<Dialog open={aiDialogOpen} onClose={() => setAiDialogOpen(false)} maxWidth="md">
				<DialogTitle
	sx={{
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		textAlign: "center",
		fontWeight: "bold",
		fontSize: "1.25rem",
	}}
>
	Analiza wymagania
</DialogTitle>


	<DialogContent sx={{ py: 2, px: 4 }}>
		{validating ? (
			<Stack alignItems="center" justifyContent="center" height="100px">
				<CircularProgress />
			</Stack>
		) : (
			<Typography whiteSpace="pre-wrap" textAlign="justify">
				{aiValidationResult}
			</Typography>
		)}
	</DialogContent>

	<DialogActions sx={{ justifyContent: "center", gap: 2, px: 6, pb: 4 }}>
		<Button
			startDecorator={<CloseIcon />}
			onClick={() => setAiDialogOpen(false)}
			color="danger"
			variant="solid"
		>
			Zamknij
		</Button>
		<Button
			startDecorator={<ContentCopyIcon />}
			onClick={() => navigator.clipboard.writeText(aiValidationResult || "")}
			variant="soft"
			color="success"
		>
			Kopiuj
		</Button>
	</DialogActions>
</Dialog>
			</>
		);
	}
);

export default DialogNavigationButtons;
