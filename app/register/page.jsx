"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import { register } from "../../services/auth";
import FeedbackSnackbar from "../../components/FeedbackSnackbar";
import { getFieldErrors, registerSchema } from "../../utils/validation";

export default function RegisterPage() {
  const router = useRouter();

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: undefined,
    }));
  }

  function handleEmailDomain(domain) {
    setValues((currentValues) => {
      const currentEmail = currentValues.email.trim();

      const username = currentEmail.split("@")[0];

      return {
        ...currentValues,
        email: username ? `${username}${domain}` : domain,
      };
    });

    setErrors((currentErrors) => ({
      ...currentErrors,
      email: undefined,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const parsedValues = registerSchema.safeParse(values);

    if (!parsedValues.success) {
      setErrors(getFieldErrors(parsedValues.error));
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await register({
        nombre: parsedValues.data.name,
        correo: parsedValues.data.email,
        contraseña: parsedValues.data.password,
      });

      setFeedback({
        severity: "success",
        message:
          "Tu cuenta fue creada correctamente. Ahora puedes iniciar sesión.",
      });

      window.setTimeout(() => {
        router.replace("/login");
      }, 800);
    } catch (error) {
      setFeedback({
        severity: "error",
        message:
          error.message || "No pudimos crear tu cuenta. Intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

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
            maxWidth: 400,
            mx: "auto",
            px: { xs: 3, sm: 4 },
            py: 4,
            borderRadius: 3,
            border: "1px solid #E8E5E0",
            backgroundColor: "#FFFFFF",
          }}
        >
          <Box
            component="img"
            src="/images/habittracker-logo.png"
            alt="Habit Tracker"
            sx={{
              width: 85,
              height: 85,
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
              fontWeight: 700,
              fontSize: { xs: 30, sm: 32 },
              lineHeight: 1.15,
              color: "#29272D",
              textAlign: "center",
              mb: 1,
            }}
          >
            Crea tu cuenta
          </Typography>

          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 16,
              lineHeight: 1.5,
              color: "#29272D",
              textAlign: "center",
              mb: 3.5,
            }}
          >
            Empieza a construir tus hábitos.
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nombre"
              name="name"
              value={values.name}
              onChange={handleChange}
              error={Boolean(errors.name)}
              helperText={errors.name}
              autoComplete="name"
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              sx={{
                mb: 2.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              label="Correo electrónico"
              name="email"
              value={values.email}
              onChange={handleChange}
              error={Boolean(errors.email)}
              helperText={errors.email}
              autoComplete="email"
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              sx={{
                mb: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <Box
              sx={{
                display: "flex",
                flexWrap: "nowrap",
                gap: 0.8,
                mb: 2.5,
                overflowX: "auto",
                pb: 0.5,
              }}
            >
              {["@gmail.com", "@outlook.com", "@hotmail.com"].map((domain) => (
                <Chip
                  key={domain}
                  label={domain}
                  variant="outlined"
                  size="small"
                  onClick={() => handleEmailDomain(domain)}
                  sx={{
                    flexShrink: 0,
                    cursor: "pointer",
                    borderColor: "#B9B2C9",
                    color: "#29272D",
                    backgroundColor: "#FFFFFF",
                    "&:hover": {
                      backgroundColor: "#F3EFF8",
                      borderColor: "#8B7BB8",
                    },
                  }}
                />
              ))}
            </Box>

            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              error={Boolean(errors.password)}
              helperText={errors.password}
              autoComplete="new-password"
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              sx={{
                mb: 2.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              label="Confirmar contraseña"
              name="confirmPassword"
              type="password"
              value={values.confirmPassword}
              onChange={handleChange}
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword}
              autoComplete="new-password"
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              sx={{
                mb: 2.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                minHeight: 44,
                borderRadius: 2,
                backgroundColor: "#8B7BB8",
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#7968A8",
                  boxShadow: "none",
                },
              }}
            >
              {isSubmitting ? (
                <CircularProgress
                  size={22}
                  sx={{
                    color: "#FFFFFF",
                  }}
                />
              ) : (
                "Crear cuenta"
              )}
            </Button>

            <Button
              component={Link}
              href="/"
              fullWidth
              variant="text"
              sx={{
                mt: 1,
                color: "#8B7BB8",
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                textTransform: "none",
              }}
            >
              Cancelar
            </Button>
          </Box>

          <Box
            sx={{
              mt: 3,
              pt: 2.5,
              borderTop: "1px solid #E8E5E0",
              textAlign: "center",
            }}
          >
            <Typography
              component="span"
              sx={{
                fontSize: 14,
                color: "#29272D",
              }}
            >
              ¿Ya tienes una cuenta?{" "}
            </Typography>

            <Button
              component={Link}
              href="/login"
              variant="text"
              sx={{
                minWidth: 0,
                p: 0,
                color: "#8B7BB8",
                fontFamily: "Inter, sans-serif",
                fontSize: 14,
                fontWeight: 700,
                textTransform: "none",
                textDecoration: "underline",
                "&:hover": {
                  backgroundColor: "transparent",
                  color: "#7968A8",
                  textDecoration: "underline",
                },
              }}
            >
              Inicia sesión
            </Button>
          </Box>
        </Paper>
      </Container>

      <FeedbackSnackbar feedback={feedback} onClose={() => setFeedback(null)} />
    </Box>
  );
}
