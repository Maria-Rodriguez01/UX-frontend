"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { login } from "../../services/auth";
import FeedbackSnackbar from "../../components/FeedbackSnackbar";
import { saveSession } from "../../services/session";
import { getFieldErrors, loginSchema } from "../../utils/validation";

export default function LoginPage() {
  const router = useRouter();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const parsedValues = loginSchema.safeParse(values);

    if (!parsedValues.success) {
      setErrors(getFieldErrors(parsedValues.error));
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await login(parsedValues.data);
      saveSession(response?.access_token, response?.user);

      setFeedback({
        severity: "success",
        message: "Sesión iniciada correctamente.",
      });
      window.setTimeout(() => router.replace("/dashboard"), 500);
    } catch (error) {
      setFeedback({
        severity: "error",
        message:
          error.message || "No pudimos iniciar sesión. Intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box
      component="main"
      sx={{
        alignItems: "center",
        display: "flex",
        minHeight: "100vh",
        py: 3,
      }}
    >
      <Container maxWidth="xs">
        <Paper component="section" sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack alignItems="center" spacing={1} sx={{ mb: 4 }}>
            <Box
              component="img"
              src="/images/habittracker-logo.png"
              alt="Habit Tracker"
              sx={{
                width: 56,
                height: 56,
                objectFit: "contain",
              }}
            />
            <Typography component="h1" variant="h4">
              Bienvenido de vuelta
            </Typography>
            <Typography align="center" color="text.secondary">
              Inicia sesión para continuar con tus hábitos.
            </Typography>
          </Stack>

          <Box component="form" noValidate onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                autoComplete="email"
                error={Boolean(errors.email)}
                helperText={errors.email}
                label="Correo electrónico"
                name="email"
                onChange={handleChange}
                type="email"
                value={values.email}
              />
              <TextField
                autoComplete="current-password"
                error={Boolean(errors.password)}
                helperText={errors.password}
                label="Contraseña"
                name="password"
                onChange={handleChange}
                type="password"
                value={values.password}
              />
              <Button
                disabled={isSubmitting}
                size="large"
                type="submit"
                variant="contained"
              >
                {isSubmitting ? (
                  <CircularProgress color="inherit" size={22} />
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={() => router.push("/")}
                variant="text"
              >
                Cancelar
              </Button>
            </Stack>
          </Box>

          <Typography
            align="center"
            color="text.secondary"
            sx={{ mt: 3 }}
            variant="body2"
          >
            ¿No tienes una cuenta? <Link href="/register">Crea una cuenta</Link>
          </Typography>
        </Paper>
      </Container>

      <FeedbackSnackbar feedback={feedback} onClose={() => setFeedback(null)} />
    </Box>
  );
}
