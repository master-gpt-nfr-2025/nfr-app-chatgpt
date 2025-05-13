"use client";
import FillTemplate from "@/components/createRequirementDialog/fill-template";
import SelectCategory from "@/components/createRequirementDialog/select-category";
import SelectTemplate from "@/components/createRequirementDialog/select-template";
import { CreateRequirementForm } from "@/context/createRequirementDialogContext";
import { fetchCategories } from "@/lib/actions-categories";
import {
  fetchCustomTemplateForSubcategory,
  fetchTemplateDetails,
  fetchTemplatesForSubcategory,
} from "@/lib/actions-templates";
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
    console.log("🔘 Subcategory selected:", subcategory);
    setSelectedSubcategory(subcategory);
  };

  useEffect(() => {
    const fetchCategoriesData = async () => {
      const data = await fetchCategories();
      console.log("📚 Categories fetched:", data);
      setCategories(data);
      setLoadingCategories(false);
    };
    fetchCategoriesData();
  }, []);

  const handleTemplateSelect = (templateId: string | null) => {
    console.log("📄 Template selected:", templateId);
    setSelectedTemplate(templateId);
  };

  useEffect(() => {
    const fetchTemplatesData = async () => {
      if (!selectedSubcategory) return;
      setLoadingTemplates(true);
      if (customRequirement) {
        const data = await fetchCustomTemplateForSubcategory(selectedSubcategory.subcategoryId);
        setTemplates([data]);
        setSelectedTemplate(data._id);
      } else {
        const data = await fetchTemplatesForSubcategory(selectedSubcategory.subcategoryId);
        setTemplates(data);
      }
      setLoadingTemplates(false);
    };
    fetchTemplatesData();
  }, [selectedSubcategory]);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!selectedTemplate) return;
      const data = await fetchTemplateDetails(selectedTemplate);
      const fields = await mapTemplate(data);
      setTemplateFields(fields);
    };
    fetchTemplate();
  }, [selectedTemplate]);

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 88px - 11.5rem)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <CreateRequirementForm custom={customRequirement}>
        {[
          <SelectCategory
            key="select-category"
            categories={categories}
            selectedSubcategory={selectedSubcategory}
            onSubcategorySelect={handleSubcategorySelect}
            loading={loadingCategories}
          />,
          !customRequirement && (
            <SelectTemplate
              key="select-template"
              templates={templates}
              subcategoryName={selectedSubcategory?.subcategoryName}
              selectedTemplate={selectedTemplate}
              onTemplateSelect={handleTemplateSelect}
              loading={loadingTemplates}
            />
          ),
          templateFields && (
            <FillTemplate
              key="fill-template"
              initialRequirement={templateFields}
              subcategoryName={selectedSubcategory?.subcategoryName}
            />
          ),
        ].filter(Boolean)}
      </CreateRequirementForm>
    </Box>
  );
};

export default CreateRequirement;
