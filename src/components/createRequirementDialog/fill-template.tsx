"use client";
import { Requirement, RequirementElement } from "@/types/requirement";
import {
	Button,
	Chip,
	FormControl,
	FormHelperText,
	FormLabel,
	Input,
	Snackbar,
	Stack,
	Typography,
} from "@mui/joy";
import React, { useEffect, useState } from "react";
import { useUserContext } from "../UserProvider";
import { saveRequirement } from "@/lib/actions-requirement";
import { logValidationResult } from "@/lib/ai-validation-log";

import ParsedRequirementText from "../ui/parsed-requirement-text";
import RequirementFields from "../ui/requirement-fields";
import { useRequirementData } from "@/hooks/useRequirementData";
import DialogNavigationButtons from "../ui/dialog-navigation-buttons";
import { useRouter } from "next/navigation";
import { CheckRounded, ContentCopy } from "@mui/icons-material";
import AiValidationModal from "@/components/AiValidationModal";

//const systemDescription = localStorage.getItem("projectDescription") || "";

//   "StudentDeal is a web-based platform designed for university students and partner enterprises, similar to popular platforms like Amazon, Allegro, and eBay. It allows verified university students to purchase goods and services at discounted prices, while sellers—trusted companies verified by the university—gain access to a young customer base with long-term potential.\n\n" +
//   "To develop the StudentDeal system, we are following the standard software development lifecycle. The process began by identifying the project's business assumptions—specifically, the need for a secure, student-focused e-commerce platform that benefits both students and businesses. We then initiated an iterative process of requirements gathering, focusing first on functional requirements (what the system should do), and currently emphasizing the elicitation of non-functional requirements (how the system should behave). These requirements will serve as the foundation for the system's design and implementation.\n\n" +
//   "The core business assumptions of StudentDeal include:\n" +
//   "- Providing a secure online marketplace for students through the verification of both buyers and sellers.\n" +
//   "- Ensuring students can trust sellers due to university validation.\n" +
//   "- Ensuring sellers can trust buyers as verified students.\n" +
//   "- Offering students significant discounts on products and services.\n" +
//   "- Helping sellers reach a valuable future customer base.\n\n" +
//   "The platform's motto is: \"Stop looking for discounts, shop at StudentDeal for the best prices 24 hours 7 days a week.\"\n\n" +
//   "Students will find offers for both products (e.g., watches, shoes) and services (e.g., beauty treatments), all at exclusive student prices. StudentDeal is designed with scalability in mind: initially launching for our university students, then expanding to other universities in the city, and ultimately to students across the country. At first, only existing business partners of the university will be able to post offers, but over time, the seller base will expand.\n\n" +
//   "Functional requirements of the StudentDeal system include:\n" +
//   "- Students can browse offers, place orders, and make payments through an external payment system.\n" +
//   "- Students can view their purchase history.\n" +
//   "- Entrepreneurs can create, update, and remove offers, change offer availability status, view transaction history, and manage settlements.\n" +
//   "- Guests (non-logged-in users) can browse offers and register for an account.\n" +
//   "- Both students and entrepreneurs can log in/out, update account details, and delete their accounts.\n" +
//   "- The system integrates with the university’s student information system to periodically verify student status.\n" +
//   "- An administrator can activate or deactivate users and generate monthly platform usage and transaction reports.\n\n" +
//   "The study will primarily focus on the third phase of the software development process: the elicitation and analysis of non-functional requirements, which are essential for ensuring system reliability, performance, and security.";
const actors = ["Guest", "Student", "Entrepreneur", "Admin", "payments.com", "eUniversity system"];

function renderRequirementContent(elements: RequirementElement[]): string {

	return elements
		.map((el) => {
			console.log("element type:", el.elementType);
			switch (el.elementType) {
				case "textReq":
					return el.value;
				case "inputReq":
					return el.value;
				case "choiceReq":
					return el.selectedOption;
				case "optionalReq":
					return el.enabled ? renderRequirementContent(el.content) : "";
				case "repeatableReq":
					return el.instances.map((i) => renderRequirementContent(i)).join(" | ");
				case "referenceReq":
					return el.refElementName;
				default:
					return "";
			}
		})
		.filter(Boolean)
		.join("\n");
}

type FillTemplateProps = {
	initialRequirement: Requirement;
	subcategoryName?: string;
};

const FillTemplate = ({ initialRequirement, subcategoryName }: FillTemplateProps) => {
	const { requirement, parsedText, updateRequirement } = useRequirementData(initialRequirement);
	const { user } = useUserContext();
	const router = useRouter();
	const [systemDescription, setSystemDescription] = useState("");

	useEffect(() => {
		const cachedDescription = localStorage.getItem("projectDescription");
		if (cachedDescription) {
			setSystemDescription(cachedDescription);
		}
	}, []);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [errorText, setErrorText] = useState("");
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [reqID, setReqID] = useState<string | null>(null);
	const [validationModalOpen, setValidationModalOpen] = useState(false);
	const [validationResult, setValidationResult] = useState("");
	const [copied, setCopied] = useState(false);
	const [validationScore, setValidationScore] = useState(-1);
	const [rating, setRating] = useState<number>(-1);
	const [logId, setLogId] = useState<string | null>(null);

	const [name, setName] = useState<string>(requirement.name);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setName(e.target.value);
		setErrorText("");
		setError(false);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		if (!name) {
			setError(true);
			setErrorText("Nazwa wymagania jest obowiązkowa!");
			return;
		}
		requirement.name = name;
		requirement.createdAt = new Date();
		requirement.createdThrough = "creator";
		if (user) {
			requirement.createdBy = user.id;
		}
		try {
			const createdRequirementID = await saveRequirement(requirement, user?.id);
			if (!createdRequirementID) {
				setError(true);
				setErrorText("Wymaganie o podanej nazwie już istnieje!");
				setLoading(false);
				return;
			} else {
				setReqID(createdRequirementID);
				setSnackbarOpen(true);
				setError(false);
				setErrorText("");
			}
			router.push(`/requirements/${createdRequirementID}`);
			setLoading(false);
		} catch (error) {
			console.error(error);
			setError(true);
			setErrorText("Wystąpił błąd podczas tworzenia wymagania!");
			setLoading(false);
		}
	};

	const handleValidate = async () => {
		setValidationModalOpen(true);
		setValidationResult("");
		setLoading(true);
		setValidationScore(-1);

		const rawRequirement = `${renderRequirementContent(requirement.content)}`;
		const templateUsed = !requirement.custom ? initialRequirement.name : "(custom template)";

		console.log("📄 Template used:", templateUsed);
		console.log("🧾 Raw requirement content:\n", rawRequirement);

		const payload = {
			systemDescription,
			actors,
			requirement: rawRequirement,
		};


		console.log("📤 Validating with payload:", payload);

		try {
			const response = await fetch("/api/validate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			const data = await response.json();
			console.log("✅ Validation response:", data);
			setValidationResult(data.analysis ?? data.error ?? "No result");
			setValidationScore(data.score ?? -1);
			const logRes = await fetch("/api/log-validation", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: user?.id ?? "unknown",
					systemDescription,
					rawRequirement: `${name ?? "Unnamed Requirement"}:\n${renderRequirementContent(requirement.content)}`,
					templateName: !requirement.custom ? initialRequirement.name : undefined,
					validationResponse: data.analysis ?? data.error ?? "No result",
					validationScore: data.score ?? -1,
					rating: rating !== -1 ? rating : undefined,
					correctedRequirement: (() => {
						const match = (data.analysis ?? "").match(/(?:\*\*)?Corrected requirement(?:\*\*)?:\s*(.+)/i);
						return match ? match[1].trim() : undefined;
					})(),
					unambiguous: data.unambiguous ?? 0,
					measurable: data.measurable ?? 0,
					individuallyCompleted: data.individuallyCompleted ?? 0,
					wasIgnoreClicked: false,            
  					wasUseSuggestionClicked: false,  
				}),
			});
			const logData = await logRes.json();
			if (logData?.id) setLogId(logData.id);

		} catch (err) {
			console.error("❌ Validation error:", err);
			setValidationResult("Validation failed.");
			setValidationScore(0);
		}

		setLoading(false);
	};

	const handleModalClose = async ({ wasIgnoreClicked, wasUseSuggestionClicked }) => {
		console.log("Was Ignore Clicked?", wasIgnoreClicked);
		console.log("Was Use Suggested Clicked?", wasUseSuggestionClicked);
		setValidationModalOpen(false);
		//if (logId) {
			try {
				await fetch("/api/log-validation", {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						id: logId, rating,
						wasIgnoreClicked,
						wasUseSuggestionClicked,
					}),
				});
				console.log("Buttons info updated");
			} catch (err) {
				console.error("❌ Failed to update button info:", err);
			}
		//}
	};


	const handleCopy = async ({ wasIgnoreClicked, wasUseSuggestionClicked }) => {
		if (validationResult) {
			const match = validationResult.match(/(?:\*\*)?Corrected requirement(?:\*\*)?:\s*(.+)/i);
			const corrected = match ? match[1].trim() : validationResult.trim();

			await navigator.clipboard.writeText(corrected);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);

			//if (logId) {
			try {
				await fetch("/api/log-validation", {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						id: logId, rating,
						wasIgnoreClicked,
						wasUseSuggestionClicked,
					}),
				});
				console.log("Buttons info updated");
			} catch (err) {
				console.error("❌ Failed to update button info:", err);
			}
		//}
		}
	};



	const handleGotoRequirement = () => {
		setLoading(true);
		setSnackbarOpen(false);
		if (reqID) {
			router.push(`/requirements/${reqID}`);
		}
		setLoading(false);
	};

	return (
		<>
			<Typography level="title-lg" textColor={"neutral.600"} textAlign={"center"}>
				{`Wybrana podkategoria - ${subcategoryName}`} {" "}
			</Typography>
			{!requirement.custom && (
				<Typography level="title-md" textColor={"neutral.600"} textAlign={"center"}>
					{`Szablon - ${initialRequirement.name}`} {" "}
				</Typography>
			)}
			<Stack gap={2}>
				<Stack gap={2}>
					<Stack gap={1}>
						<Typography level="body-md" sx={{ color: "text.secondary", fontWeight: 600 }}>
							{`${requirement.custom ? "Treść wymagania" : "Uzupełnij szablon wymagania"}`}
						</Typography>
						<RequirementFields requirement={requirement} updateRequirement={updateRequirement} />
					</Stack>
					{!requirement.custom && (
						<>
							<Stack gap={1}>
								<Typography level="body-md" sx={{ color: "text.secondary", fontWeight: 600 }}>
									Wymaganie
								</Typography>
								<ParsedRequirementText parsedText={parsedText} />
							</Stack>
							<Stack gap={1}>
								<Typography level="body-md" sx={{ color: "text.secondary" }}>
									Legenda
								</Typography>
								<Stack direction="row" spacing={1}>
									<Chip color="neutral" variant="outlined">
										Pola obowiązkowe
									</Chip>
									<Chip color="neutral" variant="soft">
										Pola opcjonalne
									</Chip>
								</Stack>
							</Stack>
						</>
					)}
				</Stack>
				<form onSubmit={handleSubmit}>
					<FormControl error={error} sx={{ mb: "1rem" }}>
						<FormLabel sx={{ fontWeight: "600" }} htmlFor="requirement-name">
							Nazwa wymagania
						</FormLabel>
						<Input placeholder="Nazwa wymagania" variant="soft" value={name} onChange={handleChange} />
						<FormHelperText>{errorText}</FormHelperText>
					</FormControl>
					<DialogNavigationButtons submit loading={loading} />
				</form>

				<Button onClick={handleValidate} color="primary" variant="solid" sx={{ width: "fit-content" }}>
					Validate with AI
				</Button>

				<AiValidationModal
					open={validationModalOpen}
					onClose={handleModalClose}
					loading={loading}
					original={renderRequirementContent(requirement.content)}
					suggestion={(() => {
						const match = validationResult.match(/(?:\*\*)?Suggested requirement(?:\*\*)?:\s*(.+)/i);
						return match ? match[1].trim() : "";
					})()}
					explanation={(() => {
						const match = validationResult.match(/(?:\*\*)?Explanation(?:\*\*)?:\s*(.+)/i);
						return match ? match[1].trim() : "";
					})()}
					score={validationScore}
					onUseSuggestion={handleCopy}
				/>



				<Snackbar
					autoHideDuration={4000}
					open={snackbarOpen}
					variant="soft"
					color={"success"}
					onClose={() => setSnackbarOpen(false)}
					startDecorator={<CheckRounded />}
					endDecorator={
						reqID ? (
							<Button onClick={handleGotoRequirement} size="sm" variant="soft" color="success" loading={loading}>
								Zobacz
							</Button>
						) : null
					}
				>
					<Stack direction="column" gap={1}>
						<span>Wymaganie zostało utworzone</span>
					</Stack>
				</Snackbar>

				{copied && (
					<Snackbar
						autoHideDuration={2000}
						open={copied}
						variant="soft"
						color="primary"
						onClose={() => setCopied(false)}
						startDecorator={<ContentCopy />}
					>
						Poprawione wymaganie zostało skopiowane do schowka
					</Snackbar>
				)}
			</Stack>
		</>
	);
};

export default FillTemplate;
