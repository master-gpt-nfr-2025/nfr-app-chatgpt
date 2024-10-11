import React from "react";
import RequirementModel from "@/models/requirement.model";
import User from "@/models/user.model";
import { Avatar, Card, Stack, Tooltip, Typography } from "@mui/joy";
import { checkConnection } from "@/config/db";
import { Requirement } from "@/types/requirement";
import { User as UserType } from "@/types/user";
import InfoChip from "@/components/ui/info-chip";
import Link from "next/link";
import RequirementCard from "@/components/ui/requirement-card";
import { getInitials } from "@/lib/utils";
import Initials from "@/components/ui/initials";

interface IParams {
	params: {
		id: string;
	};
}

async function RequirementDetails({ params }: IParams) {
	const fetchRequirement = async () => {
		"use server";
		await checkConnection();
		await User.findOne();
		const requirement = await RequirementModel.findById(params.id).populate("createdBy").lean();
		return requirement;
	};

	const requirementDetails = await fetchRequirement();
	const requirementDetailsJSON = JSON.parse(JSON.stringify(requirementDetails));

	const createdBy: UserType = requirementDetailsJSON.createdBy as UserType;

	return (
		<>
			<Card variant="plain" sx={{ flex: 3, minHeight: "60vh" }}>
				<RequirementCard initialRequirement={JSON.parse(JSON.stringify(requirementDetails))} />
			</Card>
			<Card variant="plain" sx={{ flex: 1, minHeight: "20vh" }}>
				<Stack gap={1}>
					<Stack direction="row" gap={1} justifyContent="space-between">
						<Typography>Utworzone przez</Typography>
						<Initials name={createdBy.name} />
					</Stack>
					<Stack direction="row" gap={1} justifyContent="space-between">
						<Typography>Użyty szablon</Typography>
						<Link href={`/templates/${requirementDetailsJSON.templateId}`} style={{ textDecoration: "none" }}>
							<InfoChip
								content={`${requirementDetailsJSON.categoryId}/${requirementDetailsJSON.subcategoryId}/${requirementDetailsJSON.templateId}`.toUpperCase()}
								tooltipText={"Przejdź do szablonu"}
							/>
						</Link>
					</Stack>
				</Stack>
			</Card>
		</>
	);
}

export default RequirementDetails;
