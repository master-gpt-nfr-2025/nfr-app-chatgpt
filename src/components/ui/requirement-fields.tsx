"use client";
import styles from "@/styles/template-form";
import {
	ChoiceRequirement,
	ChoiceRequirementOption,
	InputRequirement,
	OptionalRequirement,
	ReferenceRequirement,
	RepeatableRequirement,
	Requirement,
	RequirementElement,
	TextRequirement,
} from "@/types/requirement";
import { Box, Input, Select, Option, Button, List, ListItem, ListItemButton, Chip, ChipDelete, Stack } from "@mui/joy";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { getMatchingRequirements } from "@/lib/actions-requirement";
import { useUserContext } from "../../context/userContext";
import { AddRounded, CloseRounded } from "@mui/icons-material";
import ContentEditable from "react-contenteditable";
import sanitizeHtml from "sanitize-html";
import { useSearchParams } from "next/navigation";

type RequirementFieldsProps = {
	requirement: Requirement;
	updateRequirement: (fieldId: string, updatedData: Partial<RequirementElement>) => void;
};

const RequirementFields = React.memo(({ requirement, updateRequirement }: RequirementFieldsProps) => {
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Submitted: ", requirement);
	};

	const custom = useSearchParams().get("custom") === "true";

	// ============== SUBCOMPONENTS ==============

	interface FieldProps {
		updateData: (fieldId: string, updatedData: Partial<RequirementElement>) => void;
	}

	interface TextElementProps extends FieldProps {
		field: TextRequirement;
	}

	interface InputElementProps extends FieldProps {
		field: InputRequirement;
	}

	interface ChoiceElementProps extends FieldProps {
		field: ChoiceRequirement;
	}

	interface OptionalElementProps extends FieldProps {
		field: OptionalRequirement;
	}

	interface RepeatableElementProps extends FieldProps {
		field: RepeatableRequirement;
	}

	interface ReferenceElementProps extends FieldProps {
		field: ReferenceRequirement;
	}

	const TextElement = React.memo(({ field, updateData }: TextElementProps) => {
		const [content, setContent] = useState(field.value);

		const handleChange = useCallback((evt: any) => {
			const sanitizedContent = sanitizeHtml(evt.target.value);
			const plainText = sanitizedContent.replace(/<[^>]*>/g, "");
			setContent(plainText);
			updateData(field.id, { value: plainText });
		}, []);

		return (
			<ContentEditable
				html={content}
				onChange={handleChange}
				tagName="span"
				style={{
					display: "inline-block",
					minWidth: "1em",
					outline: "none",
					zIndex: 1,
					width: custom ? "100%" : "auto",
				}}
				className="editable"
			/>
		);
	});

	const InputElement = React.memo(({ field, updateData }: InputElementProps) => {
		const inputRef = useRef<HTMLInputElement>(null);

		const handleInputChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				const newValue = e.target.value;
				updateData(field.id, { value: newValue });
			},
			[field.id, updateData]
		);

		const maxWidth = () => {
			if (field.inputType === "number") {
				return 100;
			} else {
				return "auto";
			}
		};

		return (
			<Input
				sx={(styles.transition, { maxWidth: maxWidth() })}
				ref={inputRef}
				type={field.inputType}
				placeholder={field.placeholder}
				defaultValue={field.value}
				onChange={handleInputChange}
			/>
		);
	});

	const ChoiceElement = ({ field, updateData }: ChoiceElementProps) => {
		const [selected, setSelected] = useState(field.selectedOption);

		const handleChoiceChange = useCallback(
			(event: React.SyntheticEvent | null, newValue: string | null) => {
				setSelected(newValue!);
				updateData(field.id, { selectedOption: newValue! });
			},
			[field.id, updateData]
		);

		const renderSelectedOption = (options: (ChoiceRequirementOption | string)[]) => {
			return options.map((option) => {
				if (typeof option === "string") {
					return null;
				} else if (option.value === selected) {
					return (
						<Box key={option.id} sx={styles.horizontal}>
							{option.content.map((content) => renderField(content))}
						</Box>
					);
				}
			});
		};

		const maxLength = () => {
			let maxOptionLength = 0;
			const elements = [...field.options, field.placeholder];

			let optionLength = 0;
			elements.forEach((option) => {
				if (typeof option === "string") {
					optionLength = option.length;
				} else {
					optionLength = option.label.length;
				}
				if (optionLength > maxOptionLength) {
					maxOptionLength = optionLength;
				}
			});

			return maxOptionLength;
		};

		return (
			<Box sx={styles.horizontal}>
				<Select
					placeholder={field.placeholder}
					value={selected}
					onChange={handleChoiceChange}
					sx={{ width: maxLength() * 10 + 40, ...styles.transition, zIndex: 1 }}
				>
					{field.options.map((option, index) => {
						if (typeof option === "string") {
							return (
								<Option key={index} value={option} sx={styles.transition}>
									{option}
								</Option>
							);
						}
						return (
							<Option key={option.value} value={option.value} sx={styles.transition}>
								{option.label}
							</Option>
						);
					})}
				</Select>
				{renderSelectedOption(field.options)}
			</Box>
		);
	};

	const OptionalElement = ({ field, updateData }: OptionalElementProps) => {
		const [enabled, setEnabled] = useState(field.enabled);

		const handleEnable = () => {
			setEnabled(true);
			updateData(field.id, { enabled: true });
		};

		const handleDisable = () => {
			setEnabled(false);
			updateData(field.id, { enabled: false });
		};

		const renderContent = () => {
			if (!enabled) {
				return (
					<Button
						sx={(styles.transition, { fontWeight: 400 })}
						variant="soft"
						color="neutral"
						endDecorator={<AddRounded />}
						onClick={handleEnable}
					>
						{field.placeholder}
					</Button>
				);
			} else {
				return (
					<Box sx={styles.optionalField}>
						{field.content.map((nestedField) => renderField(nestedField))}
						<Box onClick={handleDisable} className="remove-button" sx={styles.removeButton}>
							<CloseRounded />
						</Box>
					</Box>
				);
			}
		};

		return renderContent();
	};

	const RepeatableElement = React.memo(({ field, updateData }: RepeatableElementProps) => {
		const [localInstances, setLocalInstances] = useState(field.instances);

		// Use useEffect to sync localInstances with field.instances
		useEffect(() => {
			setLocalInstances(field.instances);
		}, [field.instances]);

		const addInstance = useCallback(() => {
			const newInstance = field.content.map((element, index) => {
				const createNewElement = (el: RequirementElement, prefix: string): RequirementElement => {
					const updatedElement: RequirementElement = {
						...el,
						id: `${prefix}-${el.id}`,
					};

					if (updatedElement.elementType === "optionalReq" || updatedElement.elementType === "repeatableReq") {
						updatedElement.content = updatedElement.content.map((nestedEl) => createNewElement(nestedEl, updatedElement.id));
					}

					if (updatedElement.elementType === "choiceReq") {
						updatedElement.options = updatedElement.options.map((option) => {
							if (typeof option !== "string" && option.elementType === "groupReq") {
								return {
									...option,
									content: option.content.map((nestedEl) => createNewElement(nestedEl, updatedElement.id)),
								};
							}
							return option;
						});
					}

					if (updatedElement.elementType === "referenceReq") {
						return {
							...updatedElement,
							refElementID: "",
							refElementCustomID: "",
							refElementName: "",
						};
					}

					return updatedElement;
				};

				return createNewElement(element, `${field.id}-${field.instances.length}-${index}`);
			});

			const updatedInstances = [...localInstances, newInstance];
			setLocalInstances(updatedInstances);
			updateData(field.id, { instances: updatedInstances });
		}, [field.id, field.instances, updateData, localInstances]);

		const removeInstance = useCallback(
			(index: number) => {
				const updatedInstances = [...localInstances];
				updatedInstances.splice(index, 1);
				setLocalInstances(updatedInstances);
				updateData(field.id, { instances: updatedInstances });
			},
			[localInstances, field.id, updateData]
		);

		return (
			<Box sx={styles.horizontal}>
				{localInstances.map((instance, index) => (
					<Box sx={styles.optionalField} key={`${field.id}-${index}`}>
						{instance.map((nestedField) => renderField(nestedField))}
						<Box onClick={() => removeInstance(index)} className="remove-button" sx={styles.removeButton}>
							<CloseRounded />
						</Box>
					</Box>
				))}
				{localInstances.length < field.maxInstances && (
					<Button variant={field.required ? "outlined" : "soft"} color="neutral" endDecorator={<AddRounded />} onClick={addInstance}>
						{field.placeholder}
					</Button>
				)}
			</Box>
		);
	});

	const ReferenceElement = ({ field, updateData }: ReferenceElementProps) => {
		const [inputValue, setInputValue] = useState("");
		const [matchingRequirements, setMatchingRequirements] = useState<{ id: string; name: string; _id: string }[]>([]);
		const [selectedRequirement, setSelectedRequirement] = useState<{ id: string; name: string; _id: string } | null>(null);
		const [showSuggestions, setShowSuggestions] = useState(false);
		const inputRef = useRef<HTMLInputElement>(null);
		const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
		const { user } = useUserContext();

		const isReferenceEmpty = !field.refElementID && !field.refElementCustomID && !field.refElementName;

		useEffect(() => {
			const searchRequirements = async () => {
				if (inputValue.length > 0) {
					const results = await getMatchingRequirements(inputValue, user?.id);
					setMatchingRequirements(results);
					setShowSuggestions(true);
				} else {
					setShowSuggestions(false);
				}
			};

			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}

			debounceTimerRef.current = setTimeout(searchRequirements, 300);

			return () => {
				if (debounceTimerRef.current) {
					clearTimeout(debounceTimerRef.current);
				}
			};
		}, [inputValue]);

		useEffect(() => {
			if (!isReferenceEmpty) {
				setSelectedRequirement({
					_id: field.refElementID,
					id: field.refElementCustomID,
					name: field.refElementName,
				});
			} else {
				setSelectedRequirement(null);
			}
		}, [field.refElementID, field.refElementCustomID, field.refElementName]);

		const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
			setInputValue(e.target.value);
		}, []);

		const handleSelectRequirement = useCallback(
			(selected: { id: string; name: string; _id: string }) => {
				setSelectedRequirement(selected);
				updateData(field.id, {
					refElementID: selected._id,
					refElementCustomID: selected.id,
					refElementName: selected.name,
				});
				setInputValue("");
				setShowSuggestions(false);
			},
			[field.id, updateData]
		);

		const handleRemoveReference = useCallback(() => {
			setSelectedRequirement(null);
			updateData(field.id, {
				refElementID: "",
				refElementCustomID: "",
				refElementName: "",
			});
		}, [field.id, updateData]);

		return (
			<Box sx={{ position: "relative" }}>
				<Stack direction="row" spacing={0} alignItems="center">
					{isReferenceEmpty ? (
						<Input ref={inputRef} value={inputValue} onChange={handleInputChange} placeholder={field.placeholder} />
					) : (
						<Chip variant="soft" color="primary" endDecorator={<ChipDelete onDelete={handleRemoveReference} sx={{ mr: "0.3rem" }} />}>
							{selectedRequirement?.id}
						</Chip>
					)}
					{showSuggestions && (
						<List
							sx={{
								position: "absolute",
								width: "100%",
								maxHeight: "200px",
								overflowY: "auto",
								zIndex: 10,
								top: "100%",
								left: 0,
								backgroundColor: "background.paper",
								boxShadow: 1,
							}}
						>
							{matchingRequirements.map((req) => (
								<ListItem key={req._id}>
									<ListItemButton onClick={() => handleSelectRequirement(req)} variant="soft">
										{`[${req.id}] ${req.name}`}
									</ListItemButton>
								</ListItem>
							))}
						</List>
					)}
				</Stack>
			</Box>
		);
	};

	// ============== RENDER FIELDS ==============

	const renderField = useCallback(
		(field: RequirementElement) => {
			switch (field.elementType) {
				case "textReq":
					return <TextElement key={field.id} field={field} updateData={updateRequirement} />;
				case "inputReq":
					return <InputElement key={field.id} field={field} updateData={updateRequirement} />;
				case "choiceReq":
					return <ChoiceElement key={field.id} field={field} updateData={updateRequirement} />;
				case "optionalReq":
					return <OptionalElement key={field.id} field={field} updateData={updateRequirement} />;
				case "repeatableReq":
					return <RepeatableElement key={field.id} field={field} updateData={updateRequirement} />;
				case "referenceReq":
					return <ReferenceElement key={field.id} field={field} updateData={updateRequirement} />;
				default:
					return null;
			}
		},
		[updateRequirement]
	);

	// ============== RETURN ==============

	return (
		<form onSubmit={handleSubmit}>
			<Box sx={{ display: "flex", flexDirection: "column", gap: "1rem", justifyContent: "flex-start" }}>
				<Box sx={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", alignItems: "center" }}>
					{React.useMemo(() => requirement.content.map((field, index) => renderField(field)), [requirement.content, renderField])}
				</Box>
			</Box>
		</form>
	);
});

export default RequirementFields;
