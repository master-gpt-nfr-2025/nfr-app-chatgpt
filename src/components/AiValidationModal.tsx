"use client";
import React from "react";
import {
  Modal,
  ModalDialog,
  Typography,
  CircularProgress,
  Button
} from "@mui/joy";
import { ContentCopy } from "@mui/icons-material";

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
}: Props) => (
  <Modal open={open} onClose={onClose}>
    <ModalDialog sx={{ minWidth: "500px" }}>
      <Typography level="h4">AI Validation</Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Typography sx={{ whiteSpace: "pre-line", mt: 2 }}>{result}</Typography>
          {copyButton && result && (
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

export default AiValidationModal;
