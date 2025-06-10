// app/project-description/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Box, Button, Textarea, Typography } from "@mui/joy";

export default function ProjectDescription() {
  const [description, setDescription] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem("projectDescription");
    if (cached) {
      setDescription(cached);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("projectDescription", description);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 2, px: 2 }}>
      <Typography level="h3" sx={{ mb: 2 }}>
        Opis systemu
      </Typography>
      <Textarea
        minRows={10}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Wprowadź tutaj pełny opis systemu, który będzie używany podczas walidacji wymagań."
      />
      <Button onClick={handleSave} sx={{ mt: 2 }}>
        {saved ? "Zapisano ✅" : "Zapisz opis"}
      </Button>
    </Box>
  );
}
