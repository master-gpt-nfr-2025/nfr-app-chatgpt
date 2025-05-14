"use client";
import React from "react";
import {
  Modal,
  ModalDialog,
  Typography,
  CircularProgress,
  Button,
  Box,
} from "@mui/joy";
import { ContentCopy, CheckCircle, Warning } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";

type Props = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  result: string;
  score: number; // new: score from server (0–3)
  onCopy?: () => void;
  copyButton?: boolean;
};

const iconMap: Record<number, React.ReactNode> = {
  3: <CheckCircle sx={{ color: "#22c55e" }} />,   // green
  2: <Warning sx={{ color: "#facc15" }} />,       // yellow
  1: <Warning sx={{ color: "#fb923c" }} />,       // orange
  0: <Warning sx={{ color: "#ef4444" }} />        // red
};

const scoreTextMap: Record<number, string> = {
  3: "🎉 Great job! Your requirement is high quality!",
  2: "Fix recommended",
  1: "Should be fixed",
  0: "Must be fixed"
};

const AiValidationModal = ({
  open,
  onClose,
  loading,
  result,
  score,
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

            {showCopyButton && (
              <Button
                variant="soft"
                size="sm"
                startDecorator={<ContentCopy />}
                onClick={onCopy}
                sx={{ mt: 2 }}
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
