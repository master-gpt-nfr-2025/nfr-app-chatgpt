import { Card, Stack, Typography } from "@mui/joy";
import RequirementModel from "@/models/requirement.model";
import React from "react";
import connect from "@/config/db";
import TrashedItems from "@/components/ui/trashed-items";
import UserModel from "@/models/user.model";
import { cookies } from "next/headers";
import { User } from "@/types/user";

export type TrashedItemType = {
	_id: string;
	id: string;
	name: string;
	createdAt: Date;
	createdBy: {
		_id: string;
		name: string;
		role: "admin" | "user";
	};
	trashedAt: Date;
	trashedBy: string;
};

const Trash = async () => {
	const fetchTrashedItems = async (userId?: string) => {
		"use server";
		await connect();
		const response = await UserModel.findById(userId).lean();
		const currentUser: User = JSON.parse(JSON.stringify(response));
		if (userId && currentUser.role === "admin") {
			const items = await RequirementModel.find({
				trashed: true,
			}).populate("createdBy", "name");
			return items;
		} else if (userId) {
			const items = await RequirementModel.find({
				createdBy: userId,
				trashed: true,
			}).populate("createdBy", "name");
			return items;
		} else {
			return [];
		}
	};

	const cookieStore = cookies();
	const userId = cookieStore.get("userId")?.value;

	const items = await fetchTrashedItems(userId);
	const itemsJSON = JSON.parse(JSON.stringify(items));

	return (
		<Stack direction={"column"} gap={2}>
			<Typography level="h3">Kosz</Typography>
			<Typography level="body-md">Elementy widoczne poniżej są automatycznie usuwane trwale po 30 dniach od przeniesienia do kosza</Typography>
			<Stack gap={1} alignItems="flex-start" direction="row">
				<Card variant="plain">
					<TrashedItems items={itemsJSON as TrashedItemType[]} />
				</Card>
			</Stack>
		</Stack>
	);
};

export default Trash;
