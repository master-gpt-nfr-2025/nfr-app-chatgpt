"use client";
import { useCreateRequirementFormContext } from "@/context/createRequirementDialogContext";
import { KeyboardArrowLeftRounded, KeyboardArrowRightRounded, AddRounded } from "@mui/icons-material";
import { Button, Stack } from "@mui/joy";
import React, { forwardRef } from "react";

type DialogNavigationButtonsProps = {
	nextActive?: boolean;
	submit?: boolean;
	loading?: boolean;
	nextVisible?: boolean;
};

const DialogNavigationButtons = forwardRef<HTMLDivElement, DialogNavigationButtonsProps>(
	({ nextActive, submit, loading, nextVisible = true }: DialogNavigationButtonsProps, ref) => {
		const { next, back, isFirstStep, isLastStep, currentStepIndex, setActiveStep } = useCreateRequirementFormContext();

		const handleBack = () => {
			setActiveStep(currentStepIndex - 1);
			back();
		};

		const handleNext = () => {
			setActiveStep(currentStepIndex + 1);
			next();
		};

		return (
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
					<Button onClick={handleNext} endDecorator={<AddRounded />} type="submit" loading={loading}>
						Zapisz wymaganie
					</Button>
				)}
			</Stack>
		);
	}
);

export default DialogNavigationButtons;
