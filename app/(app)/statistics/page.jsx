"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  BarChartRounded,
  CheckCircleRounded,
  EventAvailableRounded,
  TodayRounded,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

import { getHabits } from "../../../services/habits";
import { getRecords } from "../../../services/records";

import ErrorState from "../../../components/ErrorState";
import EmptyState from "../../../components/EmptyState";
import LoadingState from "../../../components/LoadingState";

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfWeek(date) {
  const result = new Date(date);
  const day = result.getDay();
  const difference = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + difference);
  result.setHours(0, 0, 0, 0);

  return result;
}

function endOfWeek(date) {
  const result = startOfWeek(date);

  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);

  return result;
}

function startOfMonth(date) {
  const result = new Date(date.getFullYear(), date.getMonth(), 1);

  result.setHours(0, 0, 0, 0);

  return result;
}

function endOfMonth(date) {
  const result = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  result.setHours(23, 59, 59, 999);

  return result;
}

function getDaysBetween(start, end) {
  const days = [];
  const current = new Date(start);

  current.setHours(0, 0, 0, 0);

  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

function getMonthName(date) {
  return new Intl.DateTimeFormat("es-ES", {
    month: "long",
  }).format(date);
}

function getCalendarDays(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const startingDay = firstDay === 0 ? 6 : firstDay - 1;

  const days = [];

  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  return days;
}

function getCompletedRecords(records) {
  return records.filter((record) => record.completado === true);
}

function MetricCard({ icon, label, value }) {
  return (
    <Card
      sx={{
        width: "100%",
        minWidth: 0,
        height: "100%",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <CardContent
        sx={{
          height: "100%",
          minHeight: {
            xs: 125,
            sm: 140,
          },
          p: {
            xs: 2,
            sm: 2.5,
            md: 3,
          },
          "&:last-child": {
            pb: {
              xs: 2,
              sm: 2.5,
              md: 3,
            },
          },
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography
            color="text.secondary"
            variant="body2"
            sx={{
              fontSize: {
                xs: 13,
                sm: 14,
              },
            }}
          >
            {label}
          </Typography>

          {icon}
        </Stack>

        <Typography
          component="p"
          variant="h4"
          sx={{
            mt: 1.5,
            fontWeight: 700,
            fontSize: {
              xs: "1.8rem",
              sm: "2.125rem",
            },
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

function BarChart({ data, maxValue }) {
  const safeMax = Math.max(maxValue, 1);

  return (
    <Stack
      direction="row"
      spacing={{
        xs: 0.75,
        sm: 1.5,
      }}
      sx={{
        height: 280,
        alignItems: "flex-end",
        justifyContent: "space-between",
        pt: 3,
        minWidth: 0,
      }}
    >
      {data.map((item) => {
        const height =
          item.value === 0 ? 0 : Math.max(8, (item.value / safeMax) * 210);

        return (
          <Stack
            key={item.label}
            spacing={1}
            sx={{
              flex: 1,
              height: "100%",
              alignItems: "center",
              justifyContent: "flex-end",
              minWidth: 0,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                minHeight: 18,
              }}
            >
              {item.value}
            </Typography>

            <Box
              sx={{
                width: {
                  xs: "70%",
                  sm: "55%",
                },
                maxWidth: 44,
                height,
                minHeight: item.value === 0 ? 4 : undefined,
                borderRadius: "8px 8px 2px 2px",
                backgroundColor: "primary.main",
                transition: "height 0.3s ease",
              }}
            />

            <Typography
              color="text.secondary"
              variant="caption"
              sx={{
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}

export default function StatisticsPage() {
  const [habits, setHabits] = useState([]);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStatistics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const today = new Date();

      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);

      const [habitsResponse, recordsResponse] = await Promise.all([
        getHabits(),
        getRecords({
          desde: formatDate(monthStart),
          hasta: formatDate(monthEnd),
        }),
      ]);

      const habitList = Array.isArray(habitsResponse)
        ? habitsResponse
        : habitsResponse?.habits || habitsResponse?.data || [];

      const recordList = Array.isArray(recordsResponse)
        ? recordsResponse
        : recordsResponse?.records || recordsResponse?.data || [];

      setHabits(habitList);
      setRecords(recordList);
    } catch (requestError) {
      setError(
        requestError.message ||
          "No pudimos cargar las estadísticas. Intenta nuevamente.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const statistics = useMemo(() => {
    const today = new Date();

    const todayKey = formatDate(today);

    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);

    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    const completedRecords = getCompletedRecords(records);

    const completedToday = completedRecords.filter(
      (record) => formatDate(new Date(record.fecha)) === todayKey,
    );

    const completedThisWeek = completedRecords.filter((record) => {
      const date = new Date(record.fecha);

      return date >= weekStart && date <= weekEnd;
    });

    const completedThisMonth = completedRecords.filter((record) => {
      const date = new Date(record.fecha);

      return date >= monthStart && date <= monthEnd;
    });

    const weekDays = getDaysBetween(weekStart, weekEnd);

    const weeklyData = weekDays.map((date) => {
      const key = formatDate(date);

      const value = completedThisWeek.filter(
        (record) => formatDate(new Date(record.fecha)) === key,
      ).length;

      const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

      return {
        label: dayNames[date.getDay() === 0 ? 6 : date.getDay() - 1],
        value,
      };
    });

    const calendarDays = getCalendarDays(today);

    const calendarData = calendarDays.map((date) => {
      if (!date) {
        return null;
      }

      const key = formatDate(date);

      const completed = completedThisMonth.filter(
        (record) => formatDate(new Date(record.fecha)) === key,
      ).length;

      return {
        date,
        day: date.getDate(),
        key,
        completed,
      };
    });

    const maxDailyCompleted = Math.max(
      ...calendarData.filter(Boolean).map((item) => item.completed),
      1,
    );

    const activeHabits = habits.filter((habit) => habit.activo !== false);

    const weeklyTotal = completedThisWeek.length;

    const monthlyTotal = completedThisMonth.length;

    const weeklyAverage =
      weeklyData.reduce((total, item) => total + item.value, 0) / 7;

    const possibleWeekly = activeHabits.length * 7;

    const weeklyPercentage =
      possibleWeekly > 0
        ? Math.min(100, Math.round((weeklyTotal / possibleWeekly) * 100))
        : 0;

    const daysInMonth = getDaysBetween(monthStart, monthEnd).length;

    const possibleMonthly = activeHabits.length * daysInMonth;

    const monthlyPercentage =
      possibleMonthly > 0
        ? Math.min(100, Math.round((monthlyTotal / possibleMonthly) * 100))
        : 0;

    return {
      activeHabits: activeHabits.length,
      completedToday: completedToday.length,
      weeklyTotal,
      monthlyTotal,
      weeklyAverage: weeklyAverage.toFixed(1),
      weeklyPercentage,
      monthlyPercentage,
      weeklyData,
      calendarData,
      maxDailyCompleted,
      hasRecords: records.length > 0,
    };
  }, [habits, records]);

  if (isLoading) {
    return <LoadingState message="Cargando estadísticas..." />;
  }

  if (error) {
    return (
      <Stack
        component="section"
        spacing={3}
        sx={{
          width: "100%",
          minWidth: 0,
        }}
      >
        <Box>
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontSize: {
                xs: "1.8rem",
                sm: "2.125rem",
              },
            }}
          >
            Estadísticas
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Consulta el progreso de tus hábitos.
          </Typography>
        </Box>

        <ErrorState message={error} onRetry={loadStatistics} />
      </Stack>
    );
  }

  if (habits.length === 0) {
    return (
      <Stack
        component="section"
        spacing={3}
        sx={{
          width: "100%",
          minWidth: 0,
        }}
      >
        <Box>
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontSize: {
                xs: "1.8rem",
                sm: "2.125rem",
              },
            }}
          >
            Estadísticas
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Consulta el progreso de tus hábitos.
          </Typography>
        </Box>

        <EmptyState
          action={
            <Button component={Link} href="/habits/new" variant="outlined">
              Crear mi primer hábito
            </Button>
          }
          description="Cuando empieces a registrar hábitos, aquí podrás ver tu progreso diario, semanal y mensual."
          title="Aún no tienes hábitos."
        />
      </Stack>
    );
  }

  const weeklyMax = Math.max(
    ...statistics.weeklyData.map((item) => item.value),
    1,
  );

  return (
    <Stack
      component="section"
      spacing={3}
      sx={{
        width: "100%",
        minWidth: 0,
      }}
    >
      <Box>
        <Typography
          component="h1"
          variant="h4"
          sx={{
            fontSize: {
              xs: "1.8rem",
              sm: "2.125rem",
            },
          }}
        >
          Estadísticas
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Mira cómo estás avanzando con tus hábitos.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: {
            xs: 1.5,
            sm: 2,
          },
          width: "100%",
        }}
      >
        <MetricCard
          icon={<TodayRounded color="primary" />}
          label="Hábitos realizados hoy"
          value={statistics.completedToday}
        />

        <MetricCard
          icon={<CheckCircleRounded color="success" />}
          label="Esta semana"
          value={statistics.weeklyTotal}
        />

        <MetricCard
          icon={<BarChartRounded color="primary" />}
          label="Este mes"
          value={statistics.monthlyTotal}
        />

        <MetricCard
          icon={<EventAvailableRounded color="secondary" />}
          label="Promedio diario"
          value={statistics.weeklyAverage}
        />
      </Box>

      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={3}
        sx={{
          width: "100%",
          minWidth: 0,
        }}
      >
        <Card
          sx={{
            flex: 1,
            minWidth: 0,
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
            <Typography
              component="h2"
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: {
                  xs: "1.1rem",
                  sm: "1.25rem",
                },
              }}
            >
              Hábitos realizados esta semana
            </Typography>

            <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
              Cantidad de hábitos completados cada día.
            </Typography>

            <Box
              sx={{
                width: "100%",
                overflow: "hidden",
              }}
            >
              <BarChart data={statistics.weeklyData} maxValue={weeklyMax} />
            </Box>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                mt: 2,
                alignItems: "center",
              }}
            >
              <CheckCircleRounded color="success" fontSize="small" />

              <Typography color="text.secondary" variant="body2">
                {statistics.weeklyTotal} hábitos realizados esta semana
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: 1,
            minWidth: 0,
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
              direction="row"
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
                gap: 1,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  component="h2"
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: {
                      xs: "1.1rem",
                      sm: "1.25rem",
                    },
                  }}
                >
                  Hábitos realizados este mes
                </Typography>

                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{ mt: 0.5 }}
                >
                  {getMonthName(new Date()).charAt(0).toUpperCase() +
                    getMonthName(new Date()).slice(1)}{" "}
                  {new Date().getFullYear()}
                </Typography>
              </Box>

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
                <TodayRounded
                  sx={{
                    color: "#8B7BB8",
                  }}
                />
              </Box>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                gap: 0.5,
                mb: 0.75,
              }}
            >
              {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
                <Typography
                  key={`${day}-${index}`}
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    textAlign: "center",
                    fontWeight: 700,
                    py: 0.25,
                  }}
                >
                  {day}
                </Typography>
              ))}
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                gap: 0.5,
              }}
            >
              {statistics.calendarData.map((item, index) => {
                if (!item) {
                  return (
                    <Box
                      key={`empty-${index}`}
                      sx={{
                        minHeight: 48,
                      }}
                    />
                  );
                }

                const intensity = item.completed / statistics.maxDailyCompleted;

                const isToday = item.key === formatDate(new Date());

                return (
                  <Box
                    key={item.key}
                    sx={{
                      minHeight: 48,
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderColor: isToday ? "#8B7BB8" : "#E8E5E0",
                      backgroundColor:
                        item.completed === 0
                          ? "#FAF9F7"
                          : `rgba(139, 123, 184, ${0.12 + intensity * 0.55})`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: isToday ? 700 : 600,
                        color: isToday ? "#8B7BB8" : "#29272D",
                        lineHeight: 1,
                      }}
                    >
                      {item.day}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "0.58rem",
                        mt: 0.4,
                        fontWeight: 700,
                        color: item.completed > 0 ? "#6F5FA3" : "#AAA6A0",
                        lineHeight: 1,
                      }}
                    >
                      {item.completed}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            <Box
              sx={{
                mt: 1.5,
                p: 1,
                borderRadius: 1.5,
                backgroundColor: "#F6F2FC",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Box>
                <Typography
                  color="text.secondary"
                  sx={{
                    fontSize: "0.65rem",
                  }}
                >
                  Total del mes
                </Typography>

                <Typography
                  sx={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                  }}
                >
                  {statistics.monthlyTotal}{" "}
                  {statistics.monthlyTotal === 1
                    ? "hábito realizado"
                    : "hábitos realizados"}
                </Typography>
              </Box>

              <TodayRounded
                sx={{
                  color: "#8B7BB8",
                  fontSize: 24,
                }}
              />
            </Box>

            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                alignItems: "center",
                justifyContent: "flex-end",
                mt: 0.75,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.6rem",
                }}
                color="text.secondary"
              >
                Menos
              </Typography>

              {[0.15, 0.3, 0.45, 0.6].map((opacity) => (
                <Box
                  key={opacity}
                  sx={{
                    width: 9,
                    height: 9,
                    borderRadius: 0.5,
                    backgroundColor: `rgba(139, 123, 184, ${opacity})`,
                  }}
                />
              ))}

              <Typography
                sx={{
                  fontSize: "0.6rem",
                }}
                color="text.secondary"
              >
                Más
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, minmax(0, 1fr))",
          },
          gap: 3,
          width: "100%",
        }}
      >
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
            <Typography
              component="h2"
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
            >
              Cumplimiento semanal
            </Typography>

            <Typography
              sx={{
                mt: 2,
                fontSize: "2rem",
                fontWeight: 700,
              }}
            >
              {statistics.weeklyPercentage}%
            </Typography>

            <Typography color="text.secondary" variant="body2">
              De las oportunidades de completar tus hábitos activos durante la
              semana.
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  width: "100%",
                  height: 10,
                  borderRadius: 999,
                  backgroundColor: "rgba(139, 123, 184, 0.15)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${statistics.weeklyPercentage}%`,
                    height: "100%",
                    borderRadius: 999,
                    backgroundColor: "primary.main",
                    transition: "width 0.3s ease",
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

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
            <Typography
              component="h2"
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
            >
              Cumplimiento mensual
            </Typography>

            <Typography
              sx={{
                mt: 2,
                fontSize: "2rem",
                fontWeight: 700,
              }}
            >
              {statistics.monthlyPercentage}%
            </Typography>

            <Typography color="text.secondary" variant="body2">
              De las oportunidades de completar tus hábitos activos durante el
              mes.
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  width: "100%",
                  height: 10,
                  borderRadius: 999,
                  backgroundColor: "rgba(139, 123, 184, 0.15)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${statistics.monthlyPercentage}%`,
                    height: "100%",
                    borderRadius: 999,
                    backgroundColor: "success.main",
                    transition: "width 0.3s ease",
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}
