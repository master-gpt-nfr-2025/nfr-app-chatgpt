import { Box, Button, Card, Stack, Typography } from "@mui/joy";
import React from "react";
import Category from "@/models/category.model";
import Subcategory from "@/models/subcategory.model";
import Template from "@/models/template.model";
import TemplateTree from "@/components/ui/template-tree";
import connect from "@/config/db";
import Link from "next/link";
import { Add } from "@mui/icons-material";

export default async function TemplatesLayout({ children }: { children: React.ReactNode }) {
	const fetchCategories = async () => {
		"use server";
		await connect();
		await Subcategory.findOne();
		await Template.findOne();
		const categories = await Category.find().populate({
			path: "subcategories",
			select: "subcategoryName subcategoryId templates",
			populate: {
				path: "templates",
				select: "name id custom",
				model: "Template",
			},
		});
		return categories;
	};

	const categories = await fetchCategories();

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: "1rem", zIndex: 0 }}>
			<Typography level="h3">Katalog szablonów</Typography>
			<Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
				<Typography level="body-md">
					Przeglądaj wszystkie dostępne szablony. Możesz również tworzyć wymagania bezpośrednio z wybranego szablonu
				</Typography>
				<Link href={"/create-requirement?custom=true"}>
					<Button variant="outlined" startDecorator={<Add />}>
						Dodaj wymaganie bez szablonu
					</Button>
				</Link>
			</Stack>
			<Stack gap={2} justifyContent="flex-start" direction={"row"} alignItems={"flex-start"}>
				<Card variant="plain" sx={{ flex: 2 }}>
					<TemplateTree categories={JSON.parse(JSON.stringify(categories))} />
				</Card>
				{children}
			</Stack>
		</Box>
	);
}
