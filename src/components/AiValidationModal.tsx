"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalDialog,
  Typography,
  CircularProgress,
  Button,
  Box,
  FormControl,
  FormLabel,
  Checkbox,
  Textarea,
  Stack,
  Divider,
  Snackbar,
  Alert,
} from "@mui/joy";
import { Warning, CheckCircle } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";

type Props = {
  open: boolean;
  onClose: (params?: {
    wasIgnoreClicked: boolean;
    feedback: string[];
    otherFeedback: string;
  }) => void;
  validationId: string;
  loading: boolean;
  original: string;
  suggestion: string;
  explanation: string;
  score: number;
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

const AiValidationModal = ({
  open,
  onClose,
  validationId,
  loading,
  original,
  suggestion,
  explanation,
  score,
}: Props) => {
  const icon = iconMap[score];
  const scoreText = scoreTextMap[score];
  const [feedback, setFeedback] = useState<string[]>([]);
  const [other, setOther] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setFeedback([]);
      setOther("");
    }
  }, [open]);

  const handleCheckboxChange = (value: string) => {
    setFeedback((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]
    );
  };

  const handleClose = async (action: "ignore" | "use" | "close" = "close") => {
    const wasIgnoreClicked = action === "ignore";
    const wasUseSuggestionClicked = action === "use";

    if (wasUseSuggestionClicked && suggestion) {
      try {
        await navigator.clipboard.writeText(suggestion);
        setCopySuccess(true);
      } catch (err) {
        console.error("❌ Failed to copy suggestion to clipboard", err);
      }
    }

    try {
      await fetch("/api/log-validation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: validationId,
          wasIgnoreClicked,
          wasUseSuggestionClicked,
          feedback,
          otherFeedback: other,
        }),
      });
    } catch (err) {
      console.error("❌ Failed to update log on close:", err);
    }

    onClose({ wasIgnoreClicked, feedback, otherFeedback: other });
  };

  const showSuggestion = score < 3 && suggestion;

  return (
    <>
      <Modal
        open={open}
        onClose={(_event, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            handleClose("ignore");
          } else {
            handleClose("close");
          }
        }}
      >
        <ModalDialog sx={{ maxWidth: "800px", overflowY: "auto", p: 3 }}>
          <Typography level="h4" display="flex" alignItems="center" gap={1}>
            {!loading && icon} Results of AI Validation
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={3} mt={2}>
              {scoreText && (
                <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                  {scoreText}
                </Typography>
              )}

              <Divider />

              <Box>
                <Typography level="title-md" sx={{ mb: 1 }}>
                  Your Requirement
                </Typography>
                <Box
                  sx={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    backgroundColor: "#f1f5f9",
                    p: 1.5,
                    borderRadius: "sm",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <ReactMarkdown>{original}</ReactMarkdown>
                </Box>
              </Box>

              {showSuggestion && (
                <>
                  <Box>
                    <Typography level="title-md" sx={{ mb: 1 }}>
                      Suggested Requirement
                    </Typography>
                    <Box
                      sx={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        backgroundColor: "#ecfdf5",
                        p: 1.5,
                        borderRadius: "sm",
                        border: "1px solid #d1fae5",
                      }}
                    >
                      <ReactMarkdown>{suggestion}</ReactMarkdown>
                    </Box>
                  </Box>

                  <Box>
                    <Typography level="title-md" sx={{ mb: 1 }}>
                      Explanation
                    </Typography>
                    <Box
                      sx={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        backgroundColor: "#fef9c3",
                        p: 1.5,
                        borderRadius: "sm",
                        border: "1px solid #fde68a",
                      }}
                    >
                      <ReactMarkdown>{explanation}</ReactMarkdown>
                    </Box>
                  </Box>

                  <Divider />

                  <FormControl>
                    <FormLabel sx={{ fontWeight: 600 }}>
                      Your Feedback
                    </FormLabel>
                    <Stack spacing={1} mt={1}>
                      {[
                        "It is not relevant",
                        "Suggestion is of low quality",
                        "I don’t like the way the requirement is documented",
                        "Incorrect to the requirement content",
                      ].map((label) => (
                        <Checkbox
                          key={label}
                          checked={feedback.includes(label)}
                          onChange={() => handleCheckboxChange(label)}
                          label={label}
                        />
                      ))}
                    </Stack>
                  </FormControl>

                  <FormControl>
                    <FormLabel sx={{ fontWeight: 600 }}>
                      Other Feedback
                    </FormLabel>
                    <Textarea
                      minRows={2}
                      placeholder="Other feedback..."
                      value={other}
                      onChange={(e) => setOther(e.target.value)}
                    />
                  </FormControl>

                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      color="neutral"
                      onClick={() => handleClose("ignore")}
                    >
                      Ignore
                    </Button>
                    <Button
                      variant="solid"
                      color="success"
                      onClick={() => handleClose("use")}
                    >
                      Use Suggested Requirement
                    </Button>
                  </Stack>
                </>
              )}
            </Stack>
          )}
        </ModalDialog>
      </Modal>

      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert variant="soft" color="success">
          📋 Suggested requirement copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default AiValidationModal;
