"use client";
import React, { useMemo } from "react";
import {
  Modal,
  ModalDialog,
  Typography,
  CircularProgress,
  Button,
  Box
} from "@mui/joy";
import { ContentCopy, CheckCircle, Warning } from "@mui/icons-material";

const getScoreFromResponse = (
  response: string
): {
  total: -1 | 0 | 1 | 2 | 3;
  icon: React.ReactNode | null;
  scoreText: string;
  cleanedResult: string;
  showCopyButton: boolean;
} => {
  const metrics = ["Unambiguous", "Measurable", "Individually Complete"];

  if (!response || !metrics.some(m => new RegExp(`${m}:\\s*\\d`).test(response))) {
    return {
      total: -1,
      icon: null,
      scoreText: "",
      cleanedResult: response,
      showCopyButton: false
    };
  }

  let total: 0 | 1 | 2 | 3 = 0;

  for (const metric of metrics) {
    const match = response.match(new RegExp(`${metric}:\\s*(\\d)`));
    if (match && match[1] === "1") {
      total = (total + 1) as 0 | 1 | 2 | 3;
    }
  }

  const icons: Record<0 | 1 | 2 | 3, React.ReactNode> = {
    3: <CheckCircle sx={{ color: "#22c55e" }} />, // green
    2: <Warning sx={{ color: "#facc15" }} />,     // yellow
    1: <Warning sx={{ color: "#fb923c" }} />,     // orange
    0: <Warning sx={{ color: "#ef4444" }} />      // red
  };

  const scoreText: Record<0 | 1 | 2 | 3, string> = {
    3: "High quality requirement",
    2: "Fix recommended",
    1: "Should be fixed",
    0: "Must be fixed"
  };

  const cleanedResult =
    total === 3
      ? response
          .replace(/^Corrected requirement:.*$/m, "")
          .replace(/^.*High-quality requirement confirmed\.*$/m, "")
          .trim()
      : response;

  return {
    total,
    icon: icons[total],
    scoreText: scoreText[total],
    cleanedResult,
    showCopyButton: total !== 3
  };
};

type Props = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  result: string;
  onCopy?: () => void;
  copyButton?: boolean;
};

const AiValidationModal = ({
  open,
  onClose,
  loading,
  result,
  onCopy,
  copyButton
}: Props) => {
  const { total, icon, scoreText, cleanedResult, showCopyButton } = useMemo(
    () => getScoreFromResponse(result),
    [result]
  );

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
                overflowY: "auto"
              }}
            >
              <Typography>{cleanedResult}</Typography>
            </Box>

            {copyButton && showCopyButton && (
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
