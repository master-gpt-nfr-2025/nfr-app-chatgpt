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
import React, { useState } from "react";
import { useUserContext } from "../UserProvider";
import { saveRequirement } from "@/lib/actions-requirement";
import ParsedRequirementText from "../ui/parsed-requirement-text";
import RequirementFields from "../ui/requirement-fields";
import { useRequirementData } from "@/hooks/useRequirementData";
import DialogNavigationButtons from "../ui/dialog-navigation-buttons";
import { useRouter } from "next/navigation";
import { CheckRounded } from "@mui/icons-material";
import AiValidationModal from "@/components/AiValidationModal";

const systemDescription =
  "StudentDeal is a web-based platform designed for university students and partner enterprises...";
const actors = ["Guest", "Student", "Entrepreneur", "Admin", "payments.com", "eUniversity system"];

function renderRequirementContent(elements: RequirementElement[]): string {
  return elements
    .map((el) => {
      switch (el.elementType) {
        case "textReq":
          return el.value;
        case "inputReq":
          return `${el.placeholder}: ${el.value}`;
        case "choiceReq":
          return `${el.placeholder}: ${el.selectedOption}`;
        case "optionalReq":
          return el.enabled ? `${el.placeholder}: ` + renderRequirementContent(el.content) : "";
        case "repeatableReq":
          return `${el.placeholder}: ` + el.instances.map((i) => renderRequirementContent(i)).join(" | ");
        case "referenceReq":
          return `${el.placeholder}: Refers to ${el.refElementName}`;
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

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [reqID, setReqID] = useState<string | null>(null);
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [validationResult, setValidationResult] = useState("");

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

    const payload = {
      systemDescription,
      actors,
      requirement: `${requirement.name ?? "Unnamed Requirement"}:
${renderRequirementContent(requirement.content)}`,
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
    } catch (err) {
      console.error("❌ Validation error:", err);
      setValidationResult("Validation failed.");
    }

    setLoading(false);
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
        <AiValidationModal
          open={validationModalOpen}
          onClose={() => setValidationModalOpen(false)}
          loading={loading}
          result={validationResult}
        />
      </Stack>
    </>
  );
};

export default FillTemplate;
