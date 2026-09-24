"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  AddRounded,
  CategoryRounded,
  CheckCircleRounded,
  DeleteOutlineRounded,
  EditOutlined,
  MedicationLiquidRounded,
  SpaRounded,
  SearchRounded,
  SelfImprovementRounded,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { deleteHabit, getHabits } from "../../../services/habits";
import { getRecords } from "../../../services/records";
import { frecuenciaLabel, todayKey } from "../../../utils";
import { useCompleteHabit } from "../../../hooks/useCompleteHabit";

import ErrorState from "../../../components/ErrorState";
import EmptyState from "../../../components/EmptyState";
import LoadingState from "../../../components/LoadingState";

function getCategoryIcon(category) {
  const normalizedCategory = (category || "").trim().toLowerCase();

  if (normalizedCategory === "salud") {
    return <MedicationLiquidRounded />;
  }

  if (normalizedCategory === "salud mental") {
    return <SpaRounded />;
  }

  if (normalizedCategory === "recreativa") {
    return <SelfImprovementRounded />;
  }

  return <CategoryRounded />;
}

function unwrapRecords(response) {
  return Array.isArray(response) ? response : response?.records || [];
}

function completedTodayIds(records) {
  return new Set(
    records
      .filter((record) => record.completado === true)
      .map((record) => record.habitoId || record.habito),
  );
}

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [todayRecords, setTodayRecords] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("nameAsc");

  const [habitToDelete, setHabitToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [habitToComplete, setHabitToComplete] = useState(null);
  const [completionAmount, setCompletionAmount] = useState("");

  const [feedback, setFeedback] = useState(null);

  const [completedHabitIds, setCompletedHabitIds] = useState(() => new Set());

  const loadHabits = useCallback(async () => {
    try {
      const response = await getHabits();

      const habitList = Array.isArray(response)
        ? response
        : response?.habits || response?.data || [];

      setError(null);
      setHabits(habitList);
    } catch (requestError) {
      setError(
        requestError.message ||
          "No pudimos cargar tus hábitos. Intenta nuevamente.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTodayRecords = useCallback(async () => {
    try {
      const response = await getRecords({
        desde: todayKey(),
        hasta: todayKey(),
      });

      const records = unwrapRecords(response);

      setTodayRecords(records);
      setCompletedHabitIds(completedTodayIds(records));
    } catch {
      setTodayRecords([]);
      setCompletedHabitIds(new Set());
    }
  }, []);

  const { completingId, complete } = useCompleteHabit({
    onCompleted: (habitId, { already } = {}) => {
      setFeedback({
        severity: "success",
        message: already
          ? "Este hábito ya estaba completado hoy."
          : "Progreso registrado correctamente.",
      });
    },

    onError: (message) => {
      setFeedback({
        severity: "error",
        message,
      });
    },
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [habitsResponse, recordsResponse] = await Promise.all([
          getHabits(),
          getRecords({
            desde: todayKey(),
            hasta: todayKey(),
          }),
        ]);

        const habitList = Array.isArray(habitsResponse)
          ? habitsResponse
          : habitsResponse?.habits || habitsResponse?.data || [];

        const records = unwrapRecords(recordsResponse);

        if (cancelled) {
          return;
        }

        setError(null);
        setHabits(habitList);
        setTodayRecords(records);
        setCompletedHabitIds(completedTodayIds(records));
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError.message ||
            "No pudimos cargar tus hábitos. Intenta nuevamente.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);

    loadHabits();
    loadTodayRecords();
  }, [loadHabits, loadTodayRecords]);

  function handleCompleteClick(habit) {
    if (!habit || habit.activo === false) {
      return;
    }

    if (habit.esCuantificable !== false) {
      setHabitToComplete(habit);
      setCompletionAmount("");
      return;
    }

    complete(habit);
  }

  async function handleCompleteHabit() {
    if (!habitToComplete) {
      return;
    }

    const amount = Number(completionAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setFeedback({
        severity: "error",
        message: "Debes ingresar una cantidad válida.",
      });

      return;
    }

    await complete(habitToComplete, amount);

    await loadTodayRecords();

    setHabitToComplete(null);
    setCompletionAmount("");
  }

  async function handleDelete() {
    if (!habitToDelete) {
      return;
    }

    const habitId = habitToDelete.id || habitToDelete._id;

    setIsDeleting(true);

    try {
      await deleteHabit(habitId);

      setHabitToDelete(null);

      setFeedback({
        severity: "success",
        message: "Hábito eliminado correctamente.",
      });

      await loadHabits();
      await loadTodayRecords();
    } catch (requestError) {
      setFeedback({
        severity: "error",
        message:
          requestError.message ||
          "No pudimos eliminar el hábito. Intenta nuevamente.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredHabits = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return habits.filter((habit) => {
      const name = habit.nombre || "";

      const matchesSearch = name.toLowerCase().includes(normalizedSearch);

      const isActive = habit.activo !== false;

      const matchesStatus =
        status === "all" ||
        (status === "active" && isActive) ||
        (status === "inactive" && !isActive);

      return matchesSearch && matchesStatus;
    });
  }, [habits, search, status]);

  const sortedHabits = useMemo(() => {
    const priorityValues = {
      alta: 3,
      media: 2,
      baja: 1,
    };

    function getProgress(habit) {
      const habitId = habit.id || habit._id;

      const record = todayRecords.find(
        (item) => (item.habitoId || item.habito) === habitId,
      );

      const amount = Number(record?.cantidad) || 0;
      const target = Number(habit.cantidadObjetivo) || 0;

      if (target <= 0) {
        return 0;
      }

      return amount / target;
    }

    return [...filteredHabits].sort((a, b) => {
      switch (sortBy) {
        case "nameAsc":
          return (a.nombre || "").localeCompare(b.nombre || "", "es", {
            sensitivity: "base",
          });

        case "nameDesc":
          return (b.nombre || "").localeCompare(a.nombre || "", "es", {
            sensitivity: "base",
          });

        case "priorityHigh":
          return (
            (priorityValues[b.prioridad] || 0) -
            (priorityValues[a.prioridad] || 0)
          );

        case "priorityLow":
          return (
            (priorityValues[a.prioridad] || 0) -
            (priorityValues[b.prioridad] || 0)
          );

        case "progressHigh":
          return getProgress(b) - getProgress(a);

        case "progressLow":
          return getProgress(a) - getProgress(b);

        case "recent":
          return (
            new Date(b.fechaInicio || 0).getTime() -
            new Date(a.fechaInicio || 0).getTime()
          );

        case "oldest":
          return (
            new Date(a.fechaInicio || 0).getTime() -
            new Date(b.fechaInicio || 0).getTime()
          );

        default:
          return 0;
      }
    });
  }, [filteredHabits, sortBy, todayRecords]);

  return (
    <Stack
      component="section"
      spacing={{
        xs: 2,
        sm: 3,
      }}
      sx={{
        width: "100%",
        minWidth: 0,
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
            xs: "stretch",
            sm: "center",
          },
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
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
            Mis hábitos
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
              fontSize: {
                xs: 14,
                sm: 16,
              },
            }}
          >
            Organiza y da seguimiento a tus hábitos diarios.
          </Typography>
        </Box>

        <Button
          component={Link}
          href="/habits/new"
          startIcon={<AddRounded />}
          variant="contained"
          sx={{
            alignSelf: {
              xs: "stretch",
              sm: "auto",
            },
            whiteSpace: "nowrap",
          }}
        >
          Crear hábito
        </Button>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
          },
          gap: 2,
          width: "100%",
        }}
      >
        <Box
          sx={{
            gridColumn: {
              xs: "auto",
              sm: "1 / -1",
            },
          }}
        >
          <TextField
            fullWidth
            label="Buscar hábito"
            placeholder="Escribe un nombre"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <FormControl fullWidth>
          <InputLabel id="habit-status-label">Estado</InputLabel>

          <Select
            label="Estado"
            labelId="habit-status-label"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="active">Activos</MenuItem>
            <MenuItem value="inactive">Inactivos</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="habit-sort-label">Ordenar por</InputLabel>

          <Select
            label="Ordenar por"
            labelId="habit-sort-label"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <MenuItem value="nameAsc">Nombre A-Z</MenuItem>

            <MenuItem value="nameDesc">Nombre Z-A</MenuItem>

            <MenuItem value="priorityHigh">Prioridad: alta → baja</MenuItem>

            <MenuItem value="priorityLow">Prioridad: baja → alta</MenuItem>

            <MenuItem value="progressHigh">Progreso: mayor → menor</MenuItem>

            <MenuItem value="progressLow">Progreso: menor → mayor</MenuItem>

            <MenuItem value="recent">Más recientes</MenuItem>

            <MenuItem value="oldest">Más antiguos</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {isLoading && <LoadingState message="Cargando hábitos..." />}

      {error && <ErrorState message={error} onRetry={handleRetry} />}

      {!isLoading && !error && sortedHabits.length === 0 && (
        <EmptyState
          action={
            habits.length === 0 && (
              <Button component={Link} href="/habits/new" variant="outlined">
                Crea tu primer hábito
              </Button>
            )
          }
          description={
            habits.length === 0
              ? "Comienza con un hábito pequeño y dale seguimiento."
              : "Prueba con otro nombre, estado u orden."
          }
          title={
            habits.length === 0
              ? "Aún no tienes hábitos."
              : "No encontramos hábitos con esos filtros."
          }
        />
      )}
      {!isLoading && !error && sortedHabits.length > 0 && (
        <Stack spacing={2}>
          {sortedHabits.map((habit) => {
            const habitId = habit.id || habit._id;

            const isActive = habit.activo !== false;

            const category = habit.categoria || habit.categoría || "";

            const todayRecord = todayRecords.find(
              (record) => (record.habitoId || record.habito) === habitId,
            );

            const currentAmount = Number(todayRecord?.cantidad) || 0;

            const targetAmount = Number(habit.cantidadObjetivo) || 0;

            const progressPercentage =
              habit.esCuantificable && targetAmount > 0
                ? Math.min(
                    100,
                    Math.round((currentAmount / targetAmount) * 100),
                  )
                : 0;

            const isCompleted =
              habit.esCuantificable !== false
                ? progressPercentage >= 100
                : completedHabitIds.has(habitId);

            const isCompleting = completingId === habitId;

            return (
              <Card
                key={habitId}
                sx={{
                  width: "100%",
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
                    direction={{
                      xs: "column",
                      xl: "row",
                    }}
                    spacing={{
                      xs: 2,
                      xl: 3,
                    }}
                    sx={{
                      width: "100%",
                      minWidth: 0,
                      alignItems: {
                        xs: "stretch",
                        xl: "center",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.5,
                        minWidth: 0,
                        flex: {
                          xl: 1,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: {
                            xs: 44,
                            sm: 48,
                          },
                          height: {
                            xs: 44,
                            sm: 48,
                          },
                          borderRadius: 2.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          backgroundColor: "#EEE9FA",
                          color: "#8B7BB8",
                        }}
                      >
                        {getCategoryIcon(category)}
                      </Box>

                      <Box
                        sx={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            alignItems: "center",
                            flexWrap: "wrap",
                            rowGap: 0.5,
                          }}
                        >
                          <Typography
                            component="h2"
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              minWidth: 0,
                              wordBreak: "break-word",
                            }}
                          >
                            {habit.nombre}
                          </Typography>

                          <Chip
                            color={isActive ? "success" : "default"}
                            label={isActive ? "Activo" : "Inactivo"}
                            size="small"
                          />

                          {isCompleted && (
                            <Chip
                              color="primary"
                              label="Completado hoy"
                              size="small"
                            />
                          )}
                        </Stack>
                        {(habit.descripcion || habit.description) && (
                          <Typography
                            color="text.secondary"
                            sx={{
                              mt: 0.5,
                              wordBreak: "break-word",
                            }}
                          >
                            {habit.descripcion || habit.description}
                          </Typography>
                        )}
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            mt: 1.5,
                            flexWrap: "wrap",
                            rowGap: 1,
                          }}
                        >
                          {category && (
                            <Chip
                              label={category}
                              size="small"
                              variant="outlined"
                            />
                          )}

                          {habit.frecuencia && (
                            <Chip
                              label={frecuenciaLabel(habit.frecuencia)}
                              size="small"
                              variant="outlined"
                            />
                          )}

                          {habit.prioridad && (
                            <Chip
                              label={`Prioridad: ${habit.prioridad}`}
                              size="small"
                              variant="outlined"
                            />
                          )}

                          {habit.esCuantificable && habit.cantidadObjetivo && (
                            <Chip
                              label={`${habit.cantidadObjetivo} ${
                                habit.unidadObjetivo || ""
                              }`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      </Box>
                    </Box>

                    {habit.esCuantificable && targetAmount > 0 && (
                      <Box
                        sx={{
                          width: "100%",
                          maxWidth: {
                            xs: "100%",
                            xl: 360,
                          },
                          flexShrink: 0,
                        }}
                      >
                        <Stack
                          direction="row"
                          sx={{
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 0.75,
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            Progreso de hoy
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {currentAmount} / {targetAmount}{" "}
                            {habit.unidadObjetivo || ""}
                          </Typography>
                        </Stack>
                        <Box
                          sx={{
                            width: "100%",
                            height: 9,
                            borderRadius: 999,
                            backgroundColor: "#E8E5E0",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              width: `${progressPercentage}%`,
                              height: "100%",
                              borderRadius: 999,
                              backgroundColor:
                                progressPercentage >= 100
                                  ? "#6F8F72"
                                  : "#8B7BB8",
                              transition: "width 0.4s ease",
                            }}
                          />
                        </Box>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                            display: "block",
                          }}
                        >
                          {progressPercentage}% completado
                        </Typography>
                      </Box>
                    )}
                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      spacing={1}
                      sx={{
                        width: {
                          xs: "100%",
                          xl: "auto",
                        },
                        flexShrink: 0,
                        alignItems: {
                          xs: "stretch",
                          sm: "center",
                        },
                        justifyContent: {
                          xs: "stretch",
                          xl: "flex-end",
                        },
                        flexWrap: {
                          xs: "nowrap",
                          sm: "wrap",
                        },
                      }}
                    >
                      {isActive && (
                        <Button
                          disabled={!habitId || isCompleting || isCompleted}
                          onClick={() => handleCompleteClick(habit)}
                          size="small"
                          startIcon={
                            isCompleting ? (
                              <CircularProgress size={16} />
                            ) : (
                              <CheckCircleRounded />
                            )
                          }
                          variant={isCompleted ? "outlined" : "contained"}
                          sx={{
                            whiteSpace: "nowrap",
                          }}
                        >
                          {isCompleting
                            ? "Guardando..."
                            : isCompleted
                              ? "Completado"
                              : habit.esCuantificable && currentAmount > 0
                                ? "Registrar progreso"
                                : "Completar"}
                        </Button>
                      )}

                      <Button
                        component={Link}
                        disabled={!habitId}
                        href={`/habits/${habitId}/edit`}
                        size="small"
                        startIcon={<EditOutlined />}
                        variant="outlined"
                        sx={{
                          whiteSpace: "nowrap",
                        }}
                      >
                        Editar
                      </Button>

                      <Button
                        color="error"
                        disabled={!habitId}
                        onClick={() => setHabitToDelete(habit)}
                        size="small"
                        startIcon={<DeleteOutlineRounded />}
                        variant="outlined"
                        sx={{
                          whiteSpace: "nowrap",
                        }}
                      >
                        Eliminar
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      <Dialog
        open={Boolean(habitToComplete)}
        onClose={() => {
          if (!completingId) {
            setHabitToComplete(null);
            setCompletionAmount("");
          }
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Registrar progreso</DialogTitle>

        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            ¿Cuánto has progresado de <strong>{habitToComplete?.nombre}</strong>
            ?
          </Typography>

          <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
            Objetivo:{" "}
            <strong>
              {habitToComplete?.cantidadObjetivo}{" "}
              {habitToComplete?.unidadObjetivo || ""}
            </strong>
          </Typography>

          <TextField
            autoFocus
            fullWidth
            type="number"
            label={`Cantidad${
              habitToComplete?.unidadObjetivo
                ? ` (${habitToComplete.unidadObjetivo})`
                : ""
            }`}
            value={completionAmount}
            onChange={(event) => setCompletionAmount(event.target.value)}
            slotProps={{
              htmlInput: {
                min: 0,
                step: "any",
              },
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button
            disabled={Boolean(completingId)}
            onClick={() => {
              setHabitToComplete(null);
              setCompletionAmount("");
            }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            disabled={Boolean(completingId) || !completionAmount}
            onClick={handleCompleteHabit}
          >
            {completingId ? (
              <CircularProgress color="inherit" size={20} />
            ) : (
              "Registrar"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        aria-describedby="delete-habit-description"
        open={Boolean(habitToDelete)}
        onClose={isDeleting ? undefined : () => setHabitToDelete(null)}
      >
        <DialogTitle>¿Eliminar hábito?</DialogTitle>

        <DialogContent>
          <DialogContentText id="delete-habit-description">
            Vas a eliminar <strong>{habitToDelete?.nombre}</strong>. Esta acción
            no se puede deshacer.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button disabled={isDeleting} onClick={() => setHabitToDelete(null)}>
            Cancelar
          </Button>

          <Button
            color="error"
            disabled={isDeleting}
            onClick={handleDelete}
            variant="contained"
          >
            {isDeleting ? (
              <CircularProgress color="inherit" size={20} />
            ) : (
              "Eliminar"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
