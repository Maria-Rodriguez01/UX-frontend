"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

import LocalFireDepartmentRounded from "@mui/icons-material/LocalFireDepartmentRounded";
import EmojiEventsRounded from "@mui/icons-material/EmojiEventsRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import TrendingUpRounded from "@mui/icons-material/TrendingUpRounded";
import BarChartRounded from "@mui/icons-material/BarChartRounded";
import CalendarMonthRounded from "@mui/icons-material/CalendarMonthRounded";
import WaterDropRounded from "@mui/icons-material/WaterDropRounded";

import { getHabits } from "../../../services/habits";
import { getRecords } from "../../../services/records";
import { todayKey } from "../../../utils";

const cardSx = {
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "none",
};

const contentSx = {
  p: 1.5,
  "&:last-child": { pb: 1.5 },
};

function dateKey(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function habitId(record) {
  if (record.habitoId) return record.habitoId;
  if (typeof record.habito === "string") return record.habito;
  return record.habito?.id || record.habito?._id || null;
}

function daysBetween(a, b) {
  return Math.round(
    (new Date(`${a}T00:00:00`) - new Date(`${b}T00:00:00`)) / 86400000,
  );
}

function getStreak(id, records) {
  const days = [
    ...new Set(
      records
        .filter((r) => habitId(r) === id && r.completado === true)
        .map((r) => dateKey(r.fecha)),
    ),
  ].sort((a, b) => b.localeCompare(a));

  if (!days.length) return { current: 0, best: 0 };

  let best = 1;
  let sequence = 1;

  for (let i = 1; i < days.length; i++) {
    if (daysBetween(days[i - 1], days[i]) === 1) {
      sequence++;
      best = Math.max(best, sequence);
    } else {
      sequence = 1;
    }
  }

  let current = 0;
  const today = todayKey();

  if (days[0] === today || daysBetween(today, days[0]) === 1) {
    current = 1;

    for (let i = 1; i < days.length; i++) {
      if (daysBetween(days[i - 1], days[i]) === 1) {
        current++;
      } else {
        break;
      }
    }
  }

  return { current, best };
}

export default function DashboardPage() {
  const [habits, setHabits] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const today = todayKey();
        const date = new Date(`${today}T00:00:00`);
        date.setDate(date.getDate() - 365);

        const [habitsResponse, recordsResponse] = await Promise.all([
          getHabits(),
          getRecords({
            desde: date.toISOString().slice(0, 10),
            hasta: today,
          }),
        ]);

        setHabits(
          Array.isArray(habitsResponse)
            ? habitsResponse
            : habitsResponse?.data || habitsResponse?.habits || [],
        );

        setRecords(
          Array.isArray(recordsResponse)
            ? recordsResponse
            : recordsResponse?.data || recordsResponse?.records || [],
        );
      } catch (err) {
        setError(err.message || "No pudimos cargar el dashboard.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const activeHabits = useMemo(
    () => habits.filter((h) => h.activo !== false && !h.eliminado),
    [habits],
  );

  const today = todayKey();

  const todayRecords = useMemo(
    () =>
      records.filter(
        (r) => dateKey(r.fecha) === today && r.completado === true,
      ),
    [records, today],
  );

  const progress = useMemo(() => {
    const result = {};

    activeHabits.forEach((habit) => {
      const id = habit.id || habit._id;

      const habitRecords = todayRecords.filter((r) => habitId(r) === id);

      if (habit.esCuantificable === false) {
        result[id] = habitRecords.length ? 100 : 0;
        return;
      }

      const total = habitRecords.reduce(
        (sum, r) => sum + Number(r.cantidad || 0),
        0,
      );

      const objective = Number(habit.cantidadObjetivo || 0);

      result[id] =
        objective > 0
          ? Math.min((total / objective) * 100, 100)
          : habitRecords.length
            ? 100
            : 0;
    });

    return result;
  }, [activeHabits, todayRecords]);

  const completed = activeHabits.filter(
    (h) => (progress[h.id || h._id] || 0) >= 100,
  ).length;

  const pending = Math.max(activeHabits.length - completed, 0);

  const todayProgress = activeHabits.length
    ? Math.round((completed / activeHabits.length) * 100)
    : 0;

  const streaks = useMemo(
    () =>
      activeHabits
        .map((habit) => ({
          habit,
          ...getStreak(habit.id || habit._id, records),
        }))
        .filter((x) => x.current > 0 || x.best > 0),
    [activeHabits, records],
  );

  const currentStreak = streaks.reduce(
    (best, item) =>
      item.current > best.days
        ? {
            days: item.current,
            habit: item.habit,
          }
        : best,
    { days: 0, habit: null },
  );

  const bestStreak = streaks.reduce(
    (best, item) =>
      item.best > best.days
        ? {
            days: item.best,
            habit: item.habit,
          }
        : best,
    { days: 0, habit: null },
  );

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">Cargando dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography color="error">{error}</Typography>

        <Button component={Link} href="/habits" variant="contained">
          Ir a hábitos
        </Button>
      </Box>
    );
  }

  const metrics = [
    {
      label: "Hábitos activos",
      value: activeHabits.length,
      icon: <BarChartRounded />,
      color: "#8B7BB8",
      bg: "#EEE9FA",
    },
    {
      label: "Completados hoy",
      value: completed,
      icon: <CheckCircleRounded />,
      color: "#6F8F72",
      bg: "#E8F5EC",
    },
    {
      label: "Pendientes",
      value: pending,
      icon: <CalendarMonthRounded />,
      color: "#D66A24",
      bg: "#FFF0E5",
    },
    {
      label: "Progreso de hoy",
      value: `${todayProgress}%`,
      icon: <TrendingUpRounded />,
      color: "#8B7BB8",
      bg: "#EEE9FA",
    },
  ];

  const streakCards = [
    {
      title: "Racha actual",
      days: currentStreak.days,
      habit: currentStreak.habit?.nombre,
      icon: <LocalFireDepartmentRounded />,
      color: "#E96920",
      bg: "#FFF0E5",
      border: "#F1DCC9",
      cardBg: "linear-gradient(135deg,#FFF9F4,#FFFDFB)",
      text: currentStreak.habit
        ? "¡Sigue así!"
        : "Completa hábitos para comenzar.",
    },
    {
      title: "Mejor racha",
      days: bestStreak.days,
      habit: bestStreak.habit?.nombre,
      icon: <EmojiEventsRounded />,
      color: "#7565A8",
      bg: "#EEE9FA",
      border: "#E4DFF4",
      cardBg: "linear-gradient(135deg,#F9F7FF,#FFFFFF)",
      text: bestStreak.habit ? "Tu mejor marca hasta ahora." : "Sin historial.",
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1450,
        mx: "auto",
        py: { xs: 1.5, md: 2 },
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography
          sx={{
            fontSize: {
              xs: "1.7rem",
              md: "2rem",
            },
            fontWeight: 700,
            lineHeight: 1.1,
            color: "#29272D",
          }}
        >
          ¡Bienvenid@!
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Aquí tienes tu progreso de hoy.
        </Typography>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2,1fr)",
            sm: "repeat(4,1fr)",
          },
          gap: 1.25,
          mb: 1.5,
        }}
      >
        {metrics.map((item) => (
          <Card key={item.label} sx={cardSx}>
            <CardContent sx={contentSx}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: item.bg,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{ lineHeight: 1 }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "190px minmax(0,1fr)",
          },
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gap: 1.5,
          }}
        >
          {streakCards.map((item) => (
            <Card
              key={item.title}
              sx={{
                ...cardSx,
                borderColor: item.border,
                background: item.cardBg,
              }}
            >
              <CardContent sx={contentSx}>
                <Stack spacing={0.5}>
                  <Box
                    sx={{
                      width: 45,
                      height: 45,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: item.bg,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        color: item.color,
                      }}
                    >
                      {item.icon}
                    </Box>
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {item.title}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {item.days}{" "}
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "0.9rem",
                        fontWeight: 400,
                      }}
                    >
                      {item.days === 1 ? "día" : "días"}
                    </Typography>
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    noWrap
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.habit || "Sin historial"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.text}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
        <Box
          sx={{
            display: "grid",
            gap: 1.5,
          }}
        >
          <Card sx={cardSx}>
            <CardContent sx={contentSx}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1.5,
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    alignItems: "center",
                    minWidth: 0,
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
                      backgroundColor: "#EEE9FA",
                      flexShrink: 0,
                    }}
                  >
                    <CalendarMonthRounded
                      sx={{
                        color: "#8B7BB8",
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{ lineHeight: 1.2 }}
                    >
                      Hábitos de hoy
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      Tu lista de hábitos para hoy.
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  component={Link}
                  href="/habits"
                  size="small"
                  sx={{
                    ml: "auto",
                    pl: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  Ver todos →
                </Button>
              </Box>
              <Stack spacing={0.75}>
                {activeHabits.slice(0, 5).map((habit) => {
                  const id = habit.id || habit._id;
                  const value = progress[id] || 0;
                  const done = value >= 100;
                  return (
                    <Box
                      key={id}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0,1fr) auto",
                        alignItems: "center",
                        gap: 1.5,
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: "#FAF9F7",
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          sx={{
                            alignItems: "center",
                            mb: 0.5,
                          }}
                        >
                          {habit.categoria === "salud" && (
                            <WaterDropRounded
                              sx={{
                                fontSize: 17,
                                color: "#55A8D8",
                              }}
                            />
                          )}
                          <Typography variant="body2" fontWeight={700} noWrap>
                            {habit.nombre}
                          </Typography>
                          {done && (
                            <Chip
                              label="Listo"
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.65rem",
                                backgroundColor: "#6F8F72",
                                color: "#fff",
                              }}
                            />
                          )}
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(value, 100)}
                          sx={{
                            height: 5,
                            borderRadius: 5,
                            backgroundColor: "#E8E5E0",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: "#8B7BB8",
                            },
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          minWidth: 42,
                          textAlign: "right",
                        }}
                      >
                        {Math.round(value)}%
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
              {activeHabits.length > 5 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 1 }}
                >
                  Mostrando 5 de {activeHabits.length} hábitos.
                </Typography>
              )}
            </CardContent>
          </Card>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: 1.5,
            }}
          >
            <Card sx={cardSx}>
              <CardContent sx={contentSx}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    alignItems: "center",
                    mb: 1,
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
                      backgroundColor: "#EEE9FA",
                    }}
                  >
                    <TrendingUpRounded sx={{ color: "#8B7BB8" }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{ lineHeight: 1.2 }}
                    >
                      Progreso de hoy
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {completed} de {activeHabits.length} hábitos completados.
                    </Typography>
                  </Box>
                </Stack>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    py: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 130,
                      height: 130,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: `conic-gradient(
                        #8B7BB8 ${todayProgress}%,
                        #E8E5E0 ${todayProgress}% 100%
                      )`,
                    }}
                  >
                    <Box
                      sx={{
                        width: 96,
                        height: 96,
                        borderRadius: "50%",
                        backgroundColor: "background.paper",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "1.5rem",
                          fontWeight: 700,
                          lineHeight: 1,
                        }}
                      >
                        {todayProgress}%
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        Completado
                      </Typography>
                    </Box>
                  </Box>
                  <Stack spacing={1}>
                    {[
                      ["#8B7BB8", "Completados", completed],
                      ["#E8E5E0", "Pendientes", pending],
                    ].map(([color, label, value]) => (
                      <Stack
                        key={label}
                        direction="row"
                        spacing={0.75}
                        sx={{
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor: color,
                          }}
                        />

                        <Typography variant="caption">{label}</Typography>

                        <Typography variant="body2" fontWeight={700}>
                          {value}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
                <Box
                  sx={{
                    mt: 1,
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: "#F6F2FC",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {todayProgress === 100
                      ? "¡Excelente! Completaste todos tus hábitos de hoy."
                      : "Sigue avanzando para completar tus hábitos de hoy."}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            <Card sx={cardSx}>
              <CardContent
                sx={{
                  ...contentSx,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
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
                      backgroundColor: "#EEE9FA",
                    }}
                  >
                    <BarChartRounded sx={{ color: "#8B7BB8" }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{ lineHeight: 1.2 }}
                    >
                      Ver estadísticas
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      Analiza tu progreso y cumplimiento.
                    </Typography>
                  </Box>
                </Stack>
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      height: 75,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: "#F6F2FC",
                      alignItems: "flex-end",
                    }}
                  >
                    {[30, 45, 60, 85].map((height) => (
                      <Box
                        key={height}
                        sx={{
                          width: 13,
                          height: `${height}%`,
                          borderRadius: "5px 5px 0 0",
                          backgroundColor: "#A99BCB",
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    textAlign: "center",
                    mb: 1,
                  }}
                >
                  Descubre tus tendencias, reportes y mucho más.
                </Typography>
                <Button
                  component={Link}
                  href="/statistics"
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Ver estadísticas →
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
