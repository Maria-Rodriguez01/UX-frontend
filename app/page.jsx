"use client";

import Link from "next/link";
import { Box, Button, Container, Paper, Typography } from "@mui/material";

export default function HomePage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F7F3EA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 430,
            mx: "auto",
            px: { xs: 3, sm: 5 },
            py: { xs: 4, sm: 5 },
            borderRadius: 3,
            border: "1px solid #E8E5E0",
            backgroundColor: "#FFFFFF",
            textAlign: "center",
          }}
        >
          <Box
            component="img"
            src="/images/habittracker-logo.png"
            alt="Habit Tracker"
            sx={{
              width: 120,
              height: 120,
              objectFit: "contain",
              mx: "auto",
              mb: 2,
              display: "block",
            }}
          />

          <Typography
            component="h1"
            sx={{
              fontFamily: "Quicksand, sans-serif",
              fontSize: { xs: 34, sm: 38 },
              fontWeight: 700,
              color: "#29272D",
              lineHeight: 1.1,
              mb: 1.5,
            }}
          >
            Habit Tracker
          </Typography>

          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 16,
              lineHeight: 1.6,
              color: "#66616B",
              maxWidth: 320,
              mx: "auto",
              mb: 4,
            }}
          >
            Organiza tus hábitos, registra tu progreso y alcanza tus metas.
          </Typography>

          <Button
            component={Link}
            href="/login"
            fullWidth
            variant="contained"
            sx={{
              minHeight: 46,
              borderRadius: 2,
              backgroundColor: "#8B7BB8",
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              textTransform: "none",
              boxShadow: "none",
              mb: 1.5,
              "&:hover": {
                backgroundColor: "#7968A8",
                boxShadow: "none",
              },
            }}
          >
            Iniciar sesión
          </Button>

          <Button
            component={Link}
            href="/register"
            fullWidth
            variant="outlined"
            sx={{
              minHeight: 46,
              borderRadius: 2,
              borderColor: "#8B7BB8",
              color: "#8B7BB8",
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              textTransform: "none",
              "&:hover": {
                borderColor: "#7968A8",
                backgroundColor: "#F3EFF8",
              },
            }}
          >
            Registrarse
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
