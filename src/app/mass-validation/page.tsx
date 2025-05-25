"use client";
import { useState, useRef, SetStateAction } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Stack,
  Typography
} from "@mui/joy";
import { Icon } from "@iconify/react";
import Pagination from "@mui/material/Pagination";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [summary, setSummary] = useState<{ Q_M: string; Q_U: string; Q_IC: string } | null>(null);
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
    } catch (err) {
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

        tempResults.push({
          requirement: requirementText,
          unambiguous: validation.unambiguous ?? 0,
          measurable: validation.measurable ?? 0,
          individuallyCompleted: validation.individuallyCompleted ?? 0,
        });

        setLog((prev) => [...prev, `✅ Saved result for ${name}`]);
      } catch (err) {
        setLog((prev) => [...prev, `❌ Failed to process ${name}`]);
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

  const paginatedLogs = log.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
          <Button variant="outlined" color="danger" onClick={stopProcessing}>
            Stop Processing
          </Button>
        </>
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
            onChange={(_: any, page: SetStateAction<number>) => setCurrentPage(page)}
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
