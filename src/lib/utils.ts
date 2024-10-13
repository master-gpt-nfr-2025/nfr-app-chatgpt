import { Requirement, RequirementElement } from "@/types/requirement";
import { genSaltSync, hashSync } from "bcrypt-ts";

const parseRequirement = (requirement: Requirement): string => {
	const parseContent = (content: RequirementElement[]): string => {
		return content
			.map((field) => {
				switch (field.elementType) {
					case "textReq":
						return field.value;
					case "inputReq":
						return field.value.toString();
					case "choiceReq":
						return field.options
							.filter((option) => {
								if (typeof option === "string") {
									return option === field.selectedOption;
								} else {
									return option.value === field.selectedOption;
								}
							})
							.map((option) => {
								if (typeof option !== "string") {
									return parseContent(option.content);
								} else {
									return option;
								}
							})
							.join("");
					case "optionalReq":
						return field.enabled ? parseContent(field.content) : "";
					case "repeatableReq":
						const instances = field.instances.map((instance) => parseContent(instance));
						if (instances.length > 1) {
							const lastInstance = instances.pop();
							return instances.join(", ") + " oraz " + lastInstance;
						} else {
							return instances.join("");
						}
					case "referenceReq":
						return field.refElementCustomID;
					default:
						return "";
				}
			})
			.join(" ");
	};

	return (
		parseContent(requirement.content).trim().replace(" .", ".") + ".".replace("  ", " ").replace(" )", ")").replace(" %", "%").replace("..", ".")
	);
};

function getInitials(input: string): string {
	const words = input.trim().split(/\s+/);

	if (words.length === 1) {
		return words[0].substring(0, 2).toUpperCase();
	}

	return (words[0][0] + words[1][0]).toUpperCase();
}

function saltAndHashPassword(password: string): string {
	const salt = genSaltSync(10);
	const hash = hashSync(password, salt);

	return `${salt}:${hash}`;
}

export { parseRequirement, getInitials, saltAndHashPassword };
