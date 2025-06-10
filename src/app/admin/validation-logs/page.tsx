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
import type { ColorPaletteProp } from "@mui/joy/styles/types";
import { useUserContext } from "@/components/UserProvider";
import { useRouter } from "next/navigation";

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
    wasIgnoreClicked?: boolean;
    wasUseSuggestionClicked?: boolean;
    feedback?: string[];
    otherFeedback?: string;
};

export default function ValidationLogsPage() {
    const { user } = useUserContext();
    const router = useRouter();
    const [logs, setLogs] = useState<Log[]>([]);
    const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

        useEffect(() => {
        if (user && user.role !== "admin") {
            router.push("/unauthorized");
        }
    }, [user]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch("/api/log-validation");
                const text = await res.text();
                const data = JSON.parse(text);
                setLogs(data.logs || []);
            } catch (error) {
                console.error("❌ Failed to fetch logs:", error);
                setLogs([]);
            }
        };

        if (user?.role === "admin") {
            fetchLogs();
        }
    }, [user]);

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

    const getRatingColor = (rating: number): ColorPaletteProp => {
        const colors: ColorPaletteProp[] = ["danger", "danger", "warning", "warning", "success", "success"];
        return colors[rating] ?? "neutral";
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
            "wasIgnoreClicked",
            "wasUseSuggestionClicked",
            "feedback",
            "otherFeedback",
            "rawRequirement",
            "correctedRequirement",
            "timestamp",
        ];
        const csvRows = logs.map((log) =>
            header
                .map((key) => {
                    const val = (log as any)[key];
                    return `"${String(Array.isArray(val) ? val.join("; ") : val ?? "").replace(/"/g, '""')}"`;
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
            <Typography level="h2" sx={{ mb: 3, textAlign: "center" }}>
                Validation Logs
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 4 }}>
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

            <Sheet variant="outlined" sx={{ borderRadius: "md", boxShadow: "md", overflow: "auto" }}>
                <Table
                    borderAxis="xBetween"
                    stickyHeader
                    size="md"
                    variant="plain"
                    hoverRow
                    sx={{
                        minWidth: 1100,
                        "& th": {
                            backgroundColor: "background.level1",
                            fontWeight: "600",
                            whiteSpace: "nowrap",
                        },
                    }}
                >
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Template</th>
                            <th>Quality</th>
                            <th>Ignore Button?</th>
                            <th>Suggest Button?</th>
                            <th>Feedback</th>
                            <th>Original</th>
                            <th>Suggested</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedLogs.map((log, index) => {
                            const correctedKey = `corrected-${index}`;
                            const originalKey = `original-${index}`;
                            return (
                                <tr key={index}>
                                    <td><Tooltip title={log.userId}><Typography level="body-sm" sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.userId}</Typography></Tooltip></td>
                                    <td><Tooltip title={log.templateName || "—"}><Typography level="body-sm" sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.templateName || "—"}</Typography></Tooltip></td>
                                    <td><Tooltip variant="soft" color="neutral" title={<Stack spacing={0.5}><Typography level="body-xs">Unambiguous: {log.unambiguous}</Typography><Typography level="body-xs">Measurable: {log.measurable}</Typography><Typography level="body-xs">Individually Completed: {log.individuallyCompleted}</Typography></Stack>} arrow placement="top"><Chip variant="soft" color={log.validationScore >= 8 ? "success" : log.validationScore >= 5 ? "warning" : "danger"} sx={{ cursor: "help" }}>{log.validationScore}</Chip></Tooltip></td>
                                    <td><Chip variant="soft" color={log.wasIgnoreClicked ? "danger" : "neutral"}>{log.wasIgnoreClicked ? "Yes" : "No"}</Chip></td>
                                    <td><Chip variant="soft" color={log.wasUseSuggestionClicked ? "success" : "neutral"}>{log.wasUseSuggestionClicked ? "Yes" : "No"}</Chip></td>
                                    <td>
                                        {(log.feedback && log.feedback.length > 0) || log.otherFeedback ? (
                                            <Tooltip
                                                variant="outlined"
                                                arrow
                                                placement="top-start"
                                                title={
                                                    <Stack spacing={0.5} sx={{ maxWidth: 300 }}>
                                                        {(log.feedback?.length ?? 0) > 0 && (
                                                            <>
                                                                <Typography level="body-xs" fontWeight="bold">Feedback:</Typography>
                                                                <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                                                                    {log.feedback.map((f, i) => (
                                                                        <li key={i} style={{ fontSize: '12px', lineHeight: 1.4 }}>{f}</li>
                                                                    ))}
                                                                </ul>
                                                            </>
                                                        )}
                                                        {log.otherFeedback && (
                                                            <>
                                                                <Typography level="body-xs" fontWeight="bold">Other:</Typography>
                                                                <Typography level="body-xs" sx={{ wordBreak: 'break-word' }}>
                                                                    {log.otherFeedback}
                                                                </Typography>
                                                            </>
                                                        )}
                                                    </Stack>
                                                }
                                            >
                                                <Typography
                                                    level="body-sm"
                                                    sx={{
                                                        maxWidth: 150,
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                        cursor: "help",
                                                    }}
                                                >
                                                    {log.feedback?.length || log.otherFeedback ? "View" : "—"}
                                                </Typography>
                                            </Tooltip>
                                        ) : (
                                            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>—</Typography>
                                        )}
                                    </td>
                                    <td><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Tooltip title={log.rawRequirement} placement="top-start"><Typography level="body-sm" sx={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.rawRequirement}</Typography></Tooltip><Tooltip title="Copy original"><IconButton size="sm" variant="soft" onClick={() => handleCopy(log.rawRequirement || "", originalKey)}><ContentCopy fontSize="small" /></IconButton></Tooltip></Box></td>
                                    <td><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Tooltip title={log.correctedRequirement || "—"} placement="top-start"><Typography level="body-sm" sx={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.correctedRequirement || "—"}</Typography></Tooltip>{log.correctedRequirement && (<Tooltip title="Copy corrected"><IconButton size="sm" variant="soft" onClick={() => handleCopy(log.correctedRequirement!, correctedKey)}><ContentCopy fontSize="small" /></IconButton></Tooltip>)}</Box></td>
                                    <td><Typography level="body-xs">{new Date(log.timestamp).toLocaleString()}</Typography></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </Sheet>

            <Stack direction="row" justifyContent="center" sx={{ mt: 4 }}>
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
                    No validation logs found.
                </Typography>
            )}
        </Box>
    );
}
