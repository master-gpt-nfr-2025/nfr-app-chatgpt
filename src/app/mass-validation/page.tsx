"use client";
import { useState, useRef, SetStateAction } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Stack,
  Typography,
  Checkbox,
} from "@mui/joy";
import { Icon } from "@iconify/react";
import Pagination from "@mui/material/Pagination";

export type RequirementRecord = {
  NAME: string;
  REQUIREMENT: string;
  CATEGORY: string; // subcategoryId
};

export default function UploadAndValidatePage() {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [results, setResults] = useState<any[]>([]);
  const [summary, setSummary] = useState<{ Q_M: string; Q_U: string; Q_IC: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [useSystemDesc, setUseSystemDesc] = useState(false);
  const [useTemplates, setUseTemplates] = useState(false); // ✅ New checkbox state

  const itemsPerPage = 20;
  const stopRef = useRef(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setLog([]);
    setProgress(0);
    setResults([]);
    setSummary(null);
    setCurrentPage(1);
    stopRef.current = false;

    const text = await file.text();
    let parsed: RequirementRecord[];
    try {
      parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("Invalid JSON format");
    } catch {
      setLog(["❌ Failed to parse JSON"]);
      setLoading(false);
      return;
    }

    setTotal(parsed.length);
    const tempResults: any[] = [];

    for (let i = 0; i < parsed.length; i++) {
      if (stopRef.current) {
        setLog((prev) => [...prev, "⛔️ Processing stopped by user."]);
        break;
      }

      const { NAME, REQUIREMENT, CATEGORY } = parsed[i];
      const requirementText = `${NAME}:\n${REQUIREMENT}`;
      setLog((prev) => [...prev, `📤 Validating ${NAME}`]);

      try {
        let renderedTemplates = "";
        if (useTemplates && CATEGORY) {
          setLog((prev) => [...prev, `🔎 Fetching templates for subcategoryId: ${CATEGORY}`]);
          const res = await fetch(`/api/templates/${CATEGORY}`);
          const data = await res.json();

          if (data && data.renderedTemplates) {
            renderedTemplates = data.renderedTemplates;
            setLog((prev) => [...prev, `✅ Templates fetched and rendered for subcategoryId: ${CATEGORY}`]);
            console.log("📝 Rendered Templates:\n", renderedTemplates);
          } else {
            setLog((prev) => [...prev, `⚠️ No templates found for subcategoryId: ${CATEGORY}`]);
          }
        } else if (useTemplates) {
          setLog((prev) => [...prev, "⚠️ No categoryId found for this requirement"]);
        }

        const body: any = {
          requirement: requirementText,
          actors: [],
        };
        if (useSystemDesc) body.systemDescription = localStorage.getItem("projectDescription") || "";
        if (renderedTemplates) body.templates = [renderedTemplates];

        const validateRes = await fetch("/api/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (validateRes.status === 500) {
          setLog((prev) => [...prev, `❌ Server error for ${NAME}`]);
          continue;
        }

        const validation = await validateRes.json();
        if (validation.analysis?.includes("Assistant run failed") || validation.analysis?.includes("Server error")) {
          setLog((prev) => [...prev, `⚠️ Error for ${NAME}: ${validation.analysis}`]);
          continue;
        }

        tempResults.push({
          requirement: requirementText,
          unambiguous: validation.unambiguous ?? 0,
          measurable: validation.measurable ?? 0,
          individuallyCompleted: validation.individuallyCompleted ?? 0,
        });

        setLog((prev) => [...prev, `✅ Processed ${NAME}`]);
      } catch (err) {
        console.error("❌ Processing error:", err);
        setLog((prev) => [...prev, `❌ Failed to process ${NAME}`]);
      }

      setProgress(i + 1);
    }

    setResults(tempResults);
    calculateQuality(tempResults);
    setLoading(false);
  };

  const calculateQuality = (data: any[]) => {
    const totalCount = data.length || 1;
    const countM = data.filter((d) => d.measurable === 1).length;
    const countU = data.filter((d) => d.unambiguous === 1).length;
    const countIC = data.filter((d) => d.individuallyCompleted === 1).length;

    setSummary({
      Q_M: `${countM} / ${totalCount} = ${(countM / totalCount * 100).toFixed(1)}%`,
      Q_U: `${countU} / ${totalCount} = ${(countU / totalCount * 100).toFixed(1)}%`,
      Q_IC: `${countIC} / ${totalCount} = ${(countIC / totalCount * 100).toFixed(1)}%`,
    });
  };

  const stopProcessing = () => {
    stopRef.current = true;
  };

  const downloadResults = () => {
    const now = new Date();
    const timestamp = `${now.getDate().toString().padStart(2, "0")}-${(now.getMonth() + 1)
      .toString().padStart(2, "0")}-${now.getFullYear()}-${now.getHours().toString().padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now.getSeconds().toString().padStart(2, "0")}`;
    const filename = `ai-validation-results-${timestamp}.json`;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const paginatedLogs = log.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Box sx={{ p: 4 }}>
      <Typography level="h2" sx={{ mb: 3 }}>
        Upload & Validate JSON Requirements
      </Typography>

      <Stack spacing={2} sx={{ mb: 3 }}>
        <Checkbox
          label="Include system description"
          checked={useSystemDesc}
          onChange={(e) => setUseSystemDesc(e.target.checked)}
        />
        <Checkbox
          label="Use templates (by subcategoryId)"
          checked={useTemplates}
          onChange={(e) => setUseTemplates(e.target.checked)}
        />
        <FormControl>
          <Button
            component="label"
            variant="solid"
            color="primary"
            startDecorator={<Icon icon="ph:cloud-arrow-up-bold" width={20} />}
          >
            Upload JSON File
            <input hidden type="file" accept="application/json" onChange={handleFileUpload} disabled={loading} />
          </Button>
        </FormControl>
      </Stack>

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
          <Button variant="outlined" color="danger" onClick={stopProcessing}>
            Stop Processing
          </Button>
        </>
      )}

      {!loading && results.length > 0 && (
        <Button onClick={downloadResults} variant="outlined" color="success" sx={{ mt: 3 }}>
          Download AI Validation Results JSON
        </Button>
      )}

      <Stack spacing={1} sx={{ mt: 3 }}>
        {paginatedLogs.map((entry, idx) => (
          <Typography key={idx} level="body-sm">
            {entry}
          </Typography>
        ))}
      </Stack>

      {log.length > itemsPerPage && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
          <Pagination
            count={Math.ceil(log.length / itemsPerPage)}
            page={currentPage}
            onChange={(_, page: SetStateAction<number>) => setCurrentPage(page)}
          />
        </Stack>
      )}

      {summary && (
        <Box sx={{ mt: 4, p: 2, border: "1px solid", borderColor: "divider", borderRadius: "md" }}>
          <Typography level="h4" sx={{ mb: 2 }}>
            📊 Quality Metrics Summary
          </Typography>
          <Typography level="body-sm">Q(M) Measurability: {summary.Q_M}</Typography>
          <Typography level="body-sm">Q(U) Unambiguity: {summary.Q_U}</Typography>
          <Typography level="body-sm">Q(IC) Individual Completeness: {summary.Q_IC}</Typography>
        </Box>
      )}
    </Box>
  );
}
