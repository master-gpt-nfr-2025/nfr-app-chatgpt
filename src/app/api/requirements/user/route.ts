import { checkConnection } from "@/config/db";
import { NextRequest, NextResponse } from "next/server";
import RequirementModel from "@/models/requirement.model";

export async function GET(req: NextRequest) {
	try {
		await checkConnection();
		const result = await RequirementModel.aggregate([
			{
				$group: {
					_id: "$createdBy",
					count: { $sum: 1 },
				},
			},
			{
				$project: {
					userId: "$_id",
					count: 1,
					_id: 0,
				},
			},
		]);
		return NextResponse.json(result, { status: 200 });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ message: "Error", error }, { status: 500 });
	}
}
