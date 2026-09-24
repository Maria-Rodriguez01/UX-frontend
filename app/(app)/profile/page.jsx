"use client";

import { useEffect, useState } from "react";

import {
  CalendarTodayRounded,
  EmailRounded,
  PersonRounded,
} from "@mui/icons-material";

import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

function formatDate(value) {
  if (!value) {
    return "No disponible";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No disponible";
  }

  return new Intl.DateTimeFormat("es-HN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }

    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <Stack component="section" spacing={3}>
        <Typography component="h1" variant="h4">
          Mi perfil
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 6,
          }}
        >
          <CircularProgress />
        </Box>
      </Stack>
    );
  }

  const nombre = user?.nombre || "No disponible";

  const correo = user?.correo || "No disponible";

  const fechaCreada = user?.fechaRegistro || user?.createdAt;

  return (
    <Stack
      component="section"
      spacing={3}
      sx={{
        maxWidth: 800,
        mx: "auto",
        width: "100%",
      }}
    >
      <Box>
        <Typography component="h1" variant="h4">
          Mi perfil
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Información de tu cuenta.
        </Typography>
      </Box>

      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
            sx={{
              alignItems: {
                xs: "flex-start",
                sm: "center",
              },
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#EEE9FA",
                color: "#8B7BB8",
                flexShrink: 0,
              }}
            >
              <PersonRounded
                sx={{
                  fontSize: 38,
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                }}
              >
                {nombre}
              </Typography>

              <Chip
                label="Cuenta activa"
                color="success"
                size="small"
                sx={{
                  mt: 0.75,
                }}
              />
            </Box>
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Stack spacing={2.5}>
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: "center",
              }}
            ></Stack>

            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#F7F3EA",
                  color: "#8B7BB8",
                  flexShrink: 0,
                }}
              >
                <EmailRounded />
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Correo electrónico
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 600,
                    wordBreak: "break-word",
                  }}
                >
                  {correo}
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#F7F3EA",
                  color: "#8B7BB8",
                  flexShrink: 0,
                }}
              >
                <CalendarTodayRounded />
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Fecha de creación
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  {formatDate(fechaCreada)}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
