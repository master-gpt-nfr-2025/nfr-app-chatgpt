import { checkConnection } from "@/config/db";
import RequirementModel from "@/models/requirement.model";
import Subcategory from "@/models/subcategory.model";
import { NextRequest, NextResponse } from "next/server";
import { ISubcategory } from "../subcategories/clear/route";
import { Requirement } from "@/types/requirement";
import { parseRequirement } from "@/lib/utils";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const parsed = searchParams.get("parsed") === "true";
		await checkConnection();

		const requirementsRaw = await RequirementModel.find().lean();
		const requirements: Requirement[] = JSON.parse(JSON.stringify(requirementsRaw));

		const subcategoriesRaw = await Subcategory.find().lean();
		const subcategories: ISubcategory[] = JSON.parse(JSON.stringify(subcategoriesRaw));

		if (parsed) {
			return NextResponse.json(
				requirements.map((requirement) => {
					return {
						autor: requirement.createdBy,
						name: requirement.name,
						subcategoryId: requirement.subcategoryId,
						id: requirement.id,
						requirementId: requirement._id,
						subcategoryName: subcategories.find((subcategory) => subcategory.subcategoryId === requirement.subcategoryId)
							?.subcategoryName,
						text: parseRequirement(requirement),
					};
				}),
				{ status: 200 }
			);
		} else {
			return NextResponse.json(requirements, { status: 200 });
		}
	} catch (error) {
		console.error(error);
		return NextResponse.json({ message: "Error", error }, { status: 500 });
	}
}

export async function DELETE() {
	try {
		await checkConnection();
		const requirements = await RequirementModel.find();

		for (const requirement of requirements) {
			await RequirementModel.findByIdAndDelete(requirement._id);
		}

		const subcategories = await Subcategory.find();
		const subcategoryData = subcategories as ISubcategory[];

		for (const subcategory of subcategoryData) {
			await Subcategory.updateOne({ subcategoryId: subcategory.subcategoryId }, { requirements: [] });
		}

		return NextResponse.json({ message: "Deleted all requirements and cleared subcategories:", data: subcategoryData }, { status: 201 });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ message: "Error", error }, { status: 500 });
	}
}

export async function PATCH(req: NextRequest) {
	try {
		const body = await req.json();
		const { oldSubcategoryID, newSubcategoryID, templateID } = body;

		await checkConnection();
		const requirements = await RequirementModel.find({ templateId: templateID, subcategoryId: oldSubcategoryID }).select(
			"categoryId subcategoryId name"
		);

		console.log(requirements);

		for (const requirement of requirements) {
			if (requirement.subcategoryId === oldSubcategoryID) {
				await RequirementModel.findByIdAndUpdate(requirement._id, {
					subcategoryId: newSubcategoryID,
					categoryId: `cat${newSubcategoryID[3]}`,
				});
			}
			const oldSubcategory = await Subcategory.findOne({ subcategoryId: oldSubcategoryID });
			oldSubcategory.requirements = oldSubcategory.requirements.filter((req: any) => req !== requirement._id);
			await oldSubcategory.save();

			const newSubcategory = await Subcategory.findOne({ subcategoryId: newSubcategoryID });
			newSubcategory.requirements.push(requirement._id);
			await newSubcategory.save();
		}
		return NextResponse.json({ message: "Updated all requirements", data: requirements }, { status: 201 });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ message: "Error", error }, { status: 500 });
	}
}
