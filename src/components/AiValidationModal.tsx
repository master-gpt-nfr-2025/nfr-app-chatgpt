// components/AiValidationModal.tsx
"use client";
import React from "react";
import { Modal, ModalDialog, Typography, CircularProgress } from "@mui/joy";

interface Props {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  result: string;
}

const AiValidationModal = ({ open, onClose, loading, result }: Props) => (
  <Modal open={open} onClose={onClose}>
    <ModalDialog sx={{ minWidth: "500px" }}>
      <Typography level="h4">AI Validation</Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Typography sx={{ whiteSpace: "pre-line", mt: 2 }}>{result}</Typography>
      )}
    </ModalDialog>
  </Modal>
);

export default AiValidationModal;
