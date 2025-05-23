"use client";
import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Stack,
  Typography,
} from "@mui/joy";
import { Icon } from "@iconify/react";

export type RequirementRecord = {
  NAME: string;
  REQUIREMENT: string;
};

export default function UploadAndValidatePage() {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [results, setResults] = useState<any[]>([]);
  const [stopFlag, setStopFlag] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setLog([]);
    setProgress(0);
    setResults([]);
    setStopFlag(false);

    const text = await file.text();
    let parsed: RequirementRecord[];
    try {
      parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("Invalid JSON format");
    } catch (err) {
      setLog(["❌ Failed to parse JSON"]);
      setLoading(false);
      return;
    }

    setTotal(parsed.length);

    for (let i = 0; i < parsed.length; i++) {
      if (stopFlag) {
        setLog((prev) => [...prev, "⛔️ Processing stopped by user."]);
        break;
      }

      const item = parsed[i];
      const name = item.NAME;
      const requirement = item.REQUIREMENT;
      const requirementText = `${name}:\n${requirement}`;

      setLog((prev) => [...prev, `📤 Validating ${name}`]);

      try {
        const validateRes = await fetch("/api/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemDescription: "Batch upload file",
            actors: [],
            requirement: requirementText,
          }),
        });

        if (validateRes.status === 500) {
          setLog((prev) => [...prev, `❌ Server error for ${name}`]);
          continue;
        }

        const validation = await validateRes.json();

        if (
          validation.analysis?.includes("Assistant run failed") ||
          validation.analysis?.includes("Server error")
        ) {
          setLog((prev) => [...prev, `⚠️ Error for ${name}: ${validation.analysis}`]);
          continue;
        }

        const corrected = (() => {
          const match = validation.analysis?.match(/(?:\*\*)?Corrected requirement(?:\*\*)?:\s*(.+)/i);
          return match ? match[1].trim() : undefined;
        })();

        await fetch("/api/log-validation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "batch-user",
            systemDescription: "Uploaded from file",
            rawRequirement: requirementText,
            templateName: name,
            validationResponse: validation.analysis,
            validationScore: validation.score ?? -1,
            correctedRequirement: corrected,
            unambiguous: validation.unambiguous ?? 0,
            measurable: validation.measurable ?? 0,
            individuallyCompleted: validation.individuallyCompleted ?? 0,
          }),
        });

        setResults((prev) => [
          ...prev,
          {
            requirement: requirementText,
            "AI is unambiguous": validation.unambiguous ?? 0,
            "AI is measurable": validation.measurable ?? 0,
            "AI is individually completed": validation.individuallyCompleted ?? 0,
          },
        ]);

        setLog((prev) => [...prev, `✅ Saved result for ${name}`]);
      } catch (err) {
        setLog((prev) => [...prev, `❌ Failed to process ${name}`]);
      }

      setProgress(i + 1);
    }

    setLoading(false);
  };

  const downloadResults = () => {
    const now = new Date();
    const timestamp = `${now.getDate().toString().padStart(2, "0")}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getFullYear()}-${now
      .getHours()
      .toString()
      .padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;

    const filename = `ai-validation-results-${timestamp}.json`;

    const blob = new Blob([JSON.stringify(results, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography level="h2" sx={{ mb: 3 }}>
        Upload & Validate JSON Requirements
      </Typography>

      <FormControl sx={{ mb: 3 }}>
        <Button
          component="label"
          variant="solid"
          color="primary"
          startDecorator={<Icon icon="ph:cloud-arrow-up-bold" width={20} />}
        >
          Upload JSON File
          <input
            hidden
            type="file"
            accept="application/json"
            onChange={handleFileUpload}
            disabled={loading}
          />
        </Button>
      </FormControl>

      {fileName && (
        <Typography level="body-sm" sx={{ mb: 2 }}>
          📄 Selected file: <strong>{fileName}</strong>
        </Typography>
      )}

      {loading && (
        <>
          <CircularProgress sx={{ my: 2 }} />
          <Typography level="body-sm" sx={{ mb: 1 }}>
            Processing {progress}/{total}...
          </Typography>
          <Button
            variant="outlined"
            color="danger"
            onClick={() => setStopFlag(true)}
          >
            Stop Processing
          </Button>
        </>
      )}

      {!loading && results.length > 0 && (
        <Button onClick={downloadResults} variant="outlined" color="success">
          Download AI Validation Results JSON
        </Button>
      )}

      <Stack spacing={1} sx={{ mt: 3 }}>
        {log.map((entry, idx) => (
          <Typography key={idx} level="body-sm">
            {entry}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
}
