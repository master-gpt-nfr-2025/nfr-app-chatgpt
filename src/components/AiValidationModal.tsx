"use client";
import React from "react";
import {
  Modal,
  ModalDialog,
  Typography,
  CircularProgress,
  Button,
  Box,
  FormControl,
  FormLabel,
} from "@mui/joy";
import { ContentCopy, CheckCircle, Warning } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";

type Props = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  result: string;
  score: number;
  rating?: number;
  onRatingChange?: (val: number) => void;
  onCopy?: () => void;
  copyButton?: boolean;
};

const iconMap: Record<number, React.ReactNode> = {
  3: <CheckCircle sx={{ color: "#22c55e" }} />,
  2: <Warning sx={{ color: "#facc15" }} />,
  1: <Warning sx={{ color: "#fb923c" }} />,
  0: <Warning sx={{ color: "#ef4444" }} />,
};

const scoreTextMap: Record<number, string> = {
  3: "🎉 Great job! Your requirement is high quality!",
  2: "Fix recommended",
  1: "Should be fixed",
  0: "Must be fixed",
};

const ratingLabels = [
  { value: 0, label: "Very Poor", color: "#ef4444" },
  { value: 1, label: "Poor", color: "#f97316" },
  { value: 2, label: "Fair", color: "#facc15" },
  { value: 3, label: "Good", color: "#84cc16" },
  { value: 4, label: "Very Good", color: "#22c55e" },
  { value: 5, label: "Excellent", color: "#10b981" },
];

const AiValidationModal = ({
  open,
  onClose,
  loading,
  result,
  score,
  rating,
  onRatingChange,
  onCopy,
  copyButton,
}: Props) => {
  const icon = iconMap[score];
  const scoreText = scoreTextMap[score];
  const showCopyButton = copyButton && score !== 3;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ maxWidth: "90vw", overflowY: "auto" }}>
        <Typography level="h4" display="flex" alignItems="center" gap={1}>
          {!loading && icon} AI Validation
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : (
          <>
            {scoreText && (
              <Typography level="body-sm" sx={{ mt: 1, color: "text.secondary" }}>
                {scoreText}
              </Typography>
            )}
            <Box
              sx={{
                mt: 2,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                maxHeight: "60vh",
                overflowY: "auto",
              }}
            >
              <ReactMarkdown>{result}</ReactMarkdown>
            </Box>

            {/* Rating buttons */}
            <FormControl sx={{ mt: 3 }}>
              <FormLabel sx={{ fontWeight: "600", mb: 1 }}>How would you rate the AI response (0–5)</FormLabel>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {ratingLabels.map((item) => (
                  <Button
                    key={item.value}
                    size="sm"
                    variant={rating === item.value ? "solid" : "soft"}
                    onClick={() => onRatingChange?.(item.value)}
                    sx={{
                      backgroundColor: rating === item.value ? item.color : "#f1f5f9",
                      color: rating === item.value ? "#fff" : "#000",
                      "&:hover": {
                        backgroundColor: item.color,
                        color: "#fff",
                      },
                      minWidth: 90,
                      textTransform: "none",
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            </FormControl>

            {showCopyButton && (
              <Button
                variant="soft"
                size="sm"
                startDecorator={<ContentCopy />}
                onClick={onCopy}
                sx={{ mt: 3 }}
              >
                Copy Corrected Requirement
              </Button>
            )}
          </>
        )}
      </ModalDialog>
    </Modal>
  );
};

export default AiValidationModal;
