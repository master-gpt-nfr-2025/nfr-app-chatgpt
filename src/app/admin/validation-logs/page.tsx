"use client";

import {
  Box,
  Typography,
  Table,
  Sheet,
  Chip,
  Tooltip,
  IconButton,
  Stack,
  Button,
} from "@mui/joy";
import Pagination from "@mui/material/Pagination";
import { useEffect, useState } from "react";
import { ContentCopy, FileDownload, Download } from "@mui/icons-material";

type Log = {
  userId: string;
  templateName?: string;
  validationScore: number;
  rawRequirement?: string;
  correctedRequirement?: string;
  unambiguous: number;
  measurable: number;
  individuallyCompleted: number;
  timestamp: string;
  rating?: number;
};

export default function ValidationLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/log-validation");
        const text = await res.text();
        if (!text) {
          console.warn("⚠️ Empty response from /api/log-validation");
          setLogs([]);
          return;
        }
        const data = JSON.parse(text);
        setLogs(data.logs || []);
      } catch (error) {
        console.error("❌ Failed to fetch logs:", error);
        setLogs([]);
      }
    };

    fetchLogs();
  }, []);

  const paginatedLogs = logs.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(key);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (err) {
      console.error("❌ Copy failed:", err);
    }
  };

  const getRatingColor = (rating: number) => {
    const colors = ["danger", "danger", "warning", "warning", "success", "success"];
    return colors[rating] || "neutral";
  };

  const exportToJson = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, "validation-logs.json");
  };

  const exportToCsv = () => {
    const header = [
      "userId",
      "templateName",
      "validationScore",
      "unambiguous",
      "measurable",
      "individuallyCompleted",
      "rating",
      "rawRequirement",
      "correctedRequirement",
      "timestamp",
    ];
    const csvRows = logs.map((log) =>
      header
        .map((key) => {
          const val = (log as any)[key];
          return `"${String(val ?? "").replace(/"/g, '""')}"`;
        })
        .join(",")
    );
    const csvContent = [header.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, "validation-logs.csv");
  };

  const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ maxWidth: "100%", px: 2, py: 4 }}>
      <Typography level="h2" sx={{ mb: 2, textAlign: "center" }}>
        Validation Logs
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3, justifyContent: "center" }}>
        <Button
          variant="outlined"
          color="primary"
          startDecorator={<FileDownload />}
          onClick={exportToJson}
        >
          Export JSON
        </Button>
        <Button
          variant="outlined"
          color="neutral"
          startDecorator={<Download />}
          onClick={exportToCsv}
        >
          Export CSV
        </Button>
      </Stack>

      <Sheet
        variant="outlined"
        sx={{
          borderRadius: "md",
          boxShadow: "md",
          overflow: "auto",
        }}
      >
        <Table
          borderAxis="xBetween"
          stickyHeader
          size="md"
          variant="plain"
          hoverRow
          sx={{
            minWidth: 900,
            "& th": { backgroundColor: "background.surface" },
          }}
        >
          <thead>
            <tr>
              <th>User</th>
              <th>Template</th>
              <th>Quality score</th>
              <th>Rating</th>
              <th>Original requirement</th>
              <th>Adviced requirement</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map((log, index) => {
              const correctedKey = `corrected-${index}`;
              const originalKey = `original-${index}`;

              return (
                <tr key={index}>
                  <td>{log.userId}</td>
                  <td>{log.templateName || "—"}</td>
                  <td>
                    <Tooltip
                      variant="soft"
                      color="neutral"
                      title={
                        <Stack spacing={0.5}>
                          <Typography level="body-xs">
                            Unambiguous: {log.unambiguous ?? 0}
                          </Typography>
                          <Typography level="body-xs">
                            Measurable: {log.measurable ?? 0}
                          </Typography>
                          <Typography level="body-xs">
                            Individually Completed: {log.individuallyCompleted ?? 0}
                          </Typography>
                        </Stack>
                      }
                      arrow
                      placement="top"
                    >
                      <Chip
                        variant="soft"
                        color={
                          log.validationScore >= 8
                            ? "success"
                            : log.validationScore >= 5
                            ? "warning"
                            : "danger"
                        }
                        sx={{ cursor: "help" }}
                      >
                        {log.validationScore}
                      </Chip>
                    </Tooltip>
                  </td>
                  <td>
                    {log.rating !== undefined ? (
                      <Chip color={getRatingColor(log.rating)} variant="soft">
                        {log.rating}
                      </Chip>
                    ) : (
                      <Typography level="body-sm" sx={{ color: "text.tertiary" }}>—</Typography>
                    )}
                  </td>
                  <td>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Tooltip title={log.rawRequirement} placement="top-start">
                        <Typography
                          level="body-sm"
                          sx={{
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {log.rawRequirement}
                        </Typography>
                      </Tooltip>
                      <Tooltip title="Copy original">
                        <IconButton
                          size="sm"
                          variant="soft"
                          onClick={() =>
                            handleCopy(log.rawRequirement || "", originalKey)
                          }
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </td>
                  <td>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Tooltip
                        title={log.correctedRequirement || "—"}
                        placement="top-start"
                      >
                        <Typography
                          level="body-sm"
                          sx={{
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {log.correctedRequirement || "—"}
                        </Typography>
                      </Tooltip>
                      {log.correctedRequirement && (
                        <Tooltip title="Copy corrected">
                          <IconButton
                            size="sm"
                            variant="soft"
                            onClick={() =>
                              handleCopy(log.correctedRequirement!, correctedKey)
                            }
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </td>
                  <td>
                    <Typography level="body-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </Typography>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Sheet>

      <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
        <Pagination
          count={Math.ceil(logs.length / rowsPerPage)}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Stack>

      {logs.length === 0 && (
        <Typography
          level="body-md"
          sx={{ mt: 4, textAlign: "center", color: "text.secondary" }}
        >
          No validation logs.
        </Typography>
      )}
    </Box>
  );
}
