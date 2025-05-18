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
} from "@mui/joy";
import { useEffect, useState } from "react";
import { ContentCopy } from "@mui/icons-material";

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
};

export default function ValidationLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

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

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(key);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (err) {
      console.error("❌ Copy failed:", err);
    }
  };

  return (
    <Box sx={{ maxWidth: "100%", px: 2, py: 4 }}>
      <Typography level="h2" sx={{ mb: 3, textAlign: "center" }}>
        Validation Logs
      </Typography>

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
              <th>Original Template</th>
              <th>Adviced Template</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => {
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
                      <Tooltip title="Kopiuj oryginalne">
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
                        <Tooltip title="Kopiuj poprawione">
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

      {logs.length === 0 && (
        <Typography
          level="body-md"
          sx={{ mt: 4, textAlign: "center", color: "text.secondary" }}
        >
          Brak logów walidacji.
        </Typography>
      )}
    </Box>
  );
}
