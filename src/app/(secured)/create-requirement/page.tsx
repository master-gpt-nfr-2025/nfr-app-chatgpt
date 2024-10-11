"use client";
import FillTemplate from "@/components/createRequirementDialog/fill-template";
import SelectCategory from "@/components/createRequirementDialog/select-category";
import SelectTemplate from "@/components/createRequirementDialog/select-template";
import { CreateRequirementForm } from "@/context/createRequirementDialogContext";
import { fetchCategories } from "@/lib/actions-categories";
import { fetchCustomTemplateForSubcategory, fetchTemplateDetails, fetchTemplatesForSubcategory } from "@/lib/actions-templates";
import { Box } from "@mui/joy";
import React, { useEffect, useRef, useState } from "react";
import { mapTemplate } from "@/lib/mapping";
import { Requirement } from "@/types/requirement";
import { useSearchParams } from "next/navigation";

export type CategoryType = {
	_id: string;
	categoryName: string;
	subcategories: {
		_id: string;
		subcategoryName: string;
		subcategoryId: string;
		description: string;
		icon: string;
	}[];
};

const CreateRequirement = () => {
	const navigationButtonsRef = useRef<HTMLDivElement>(null);
	const [loadingCategories, setLoadingCategories] = useState(true);
	const [loadingTemplates, setLoadingTemplates] = useState(false);

	const [categories, setCategories] = useState<CategoryType[]>([]);
	const [selectedSubcategory, setSelectedSubcategory] = useState<{ subcategoryId: string; subcategoryName: string } | null>(null);
	const [templates, setTemplates] = useState<any[]>([]);
	const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
	const [templateFields, setTemplateFields] = useState<Requirement | null>(null);

	const searchParams = useSearchParams();

	const customRequirement = searchParams.get("custom") === "true";

	const handleSubcategorySelect = (subcategory: { subcategoryId: string; subcategoryName: string } | null) => {
		setSelectedSubcategory(subcategory);
	};

	useEffect(() => {
		const fetchCategoriesData = async () => {
			const data = await fetchCategories();
			setCategories(data);
		};
		setLoadingCategories(true);
		fetchCategoriesData();
		setLoadingCategories(false);
	}, []);

	const handleTemplateSelect = (templateId: string | null) => {
		setSelectedTemplate(templateId);
	};

	useEffect(() => {
		const fetchTemplatesData = async () => {
			if (customRequirement && selectedSubcategory) {
				const data = await fetchCustomTemplateForSubcategory(selectedSubcategory.subcategoryId);
				setTemplates([data]);
				setSelectedTemplate(data._id);
			} else if (selectedSubcategory) {
				const data = await fetchTemplatesForSubcategory(selectedSubcategory.subcategoryId);
				setTemplates(data);
			}
		};
		fetchTemplatesData();
	}, [selectedSubcategory]);

	useEffect(() => {
		const fetchTemplate = async () => {
			if (selectedTemplate) {
				const data = await fetchTemplateDetails(selectedTemplate);
				const fields = await mapTemplate(data);
				setTemplateFields(fields);
			}
		};
		fetchTemplate();
	}, [selectedTemplate]);

	const steps = [
		<SelectCategory
			key={Math.random() * 100 + "st"}
			categories={categories}
			selectedSubcategory={selectedSubcategory}
			onSubcategorySelect={handleSubcategorySelect}
			loading={loadingCategories}
		/>,
		<SelectTemplate
			key={Math.random() * 100 + "nd"}
			templates={templates}
			subcategoryName={selectedSubcategory?.subcategoryName}
			selectedTemplate={selectedTemplate}
			onTemplateSelect={handleTemplateSelect}
			loading={loadingTemplates}
		/>,
		templateFields ? (
			<FillTemplate
				key={Math.random() * 100 + "rd"}
				initialRequirement={templateFields}
				subcategoryName={selectedSubcategory?.subcategoryName}
			/>
		) : (
			<></>
		),
	];

	const stepsCustom = [
		<SelectCategory
			key={Math.random() * 100 + "st"}
			categories={categories}
			selectedSubcategory={selectedSubcategory}
			onSubcategorySelect={handleSubcategorySelect}
			loading={loadingCategories}
		/>,
		templateFields ? (
			<FillTemplate
				key={Math.random() * 100 + "rd"}
				initialRequirement={templateFields}
				subcategoryName={selectedSubcategory?.subcategoryName}
			/>
		) : (
			<></>
		),
	];

	return (
		<Box
			sx={{
				minHeight: "calc(100vh - 88px - 11.5rem)",
			}}
		>
			<CreateRequirementForm custom={customRequirement}>{customRequirement ? stepsCustom : steps}</CreateRequirementForm>
		</Box>
	);
};

export default CreateRequirement;
