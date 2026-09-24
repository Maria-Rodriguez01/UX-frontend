"use client";

import { useState } from "react";
import Link from "next/link";

import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import { getFieldErrors, habitSchema } from "../utils/validation";

export const emptyHabitValues = {
  nombre: "",
  descripcion: "",
  categoria: "",
  frecuencia: "daily",
  prioridad: "baja",
  fechaInicio: "",
  fechaFin: "",
  activo: true,
  esCuantificable: true,
  cantidadObjetivo: "",
  unidadObjetivo: "",
};

const categoryOptions = ["Salud", "Recreativa", "Salud mental", "Otros"];

const unitOptions = [
  "Minutos",
  "Horas",
  "Litros",
  "Vasos",
  "Pasos",
  "Páginas",
  "Veces",
  "Kilómetros",
  "Repeticiones",
  "Unidades",
];

function getNextDate(dateString) {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + 1);

  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");

  return `${nextYear}-${nextMonth}-${nextDay}`;
}

export default function HabitForm({
  cancelHref,
  initialValues,
  onSubmit,
  submitLabel,
}) {
  const [values, setValues] = useState({
    ...emptyHabitValues,
    ...initialValues,
    frecuencia: initialValues?.frecuencia || "daily",
    prioridad: initialValues?.prioridad || "baja",
    activo: initialValues?.activo !== undefined ? initialValues.activo : true,
    esCuantificable:
      initialValues?.esCuantificable !== undefined
        ? initialValues.esCuantificable
        : true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearError(name) {
    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: undefined,
    }));
  }

  function handleChange(event) {
    const { checked, name, type, value } = event.target;

    setValues((currentValues) => {
      const newValues = {
        ...currentValues,
        [name]: type === "checkbox" ? checked : value,
      };

      if (
        name === "fechaInicio" &&
        newValues.fechaFin &&
        newValues.fechaFin <= value
      ) {
        newValues.fechaFin = "";
      }

      return newValues;
    });

    clearError(name);

    if (name === "fechaInicio") {
      clearError("fechaFin");
    }
  }

  function handleQuantifiableChange(event) {
    const checked = event.target.checked;

    setValues((currentValues) => ({
      ...currentValues,
      esCuantificable: checked,
      cantidadObjetivo: checked ? currentValues.cantidadObjetivo : "",
      unidadObjetivo: checked ? currentValues.unidadObjetivo : "",
    }));

    clearError("esCuantificable");
    clearError("cantidadObjetivo");
    clearError("unidadObjetivo");
  }

  function handleCategoryChange(_, newValue) {
    setValues((currentValues) => ({
      ...currentValues,
      categoria: newValue || "",
    }));

    clearError("categoria");
  }

  function handleUnitChange(_, newValue) {
    setValues((currentValues) => ({
      ...currentValues,
      unidadObjetivo: newValue || "",
    }));

    clearError("unidadObjetivo");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      values.fechaInicio &&
      values.fechaFin &&
      values.fechaFin <= values.fechaInicio
    ) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        fechaFin: "La fecha de fin debe ser posterior a la fecha de inicio.",
      }));

      return;
    }

    const valuesToValidate = {
      ...values,
      cantidadObjetivo: values.esCuantificable
        ? values.cantidadObjetivo
        : undefined,
      unidadObjetivo: values.esCuantificable
        ? values.unidadObjetivo
        : undefined,
    };

    const parsedValues = habitSchema.safeParse(valuesToValidate);

    if (!parsedValues.success) {
      setErrors(getFieldErrors(parsedValues.error));
      return;
    }

    const { fechaFin, ...habit } = parsedValues.data;

    setIsSubmitting(true);

    try {
      await onSubmit({
        ...habit,
        ...(fechaFin ? { fechaFin } : {}),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box component="form" noValidate onSubmit={handleSubmit}>
      <Stack spacing={3.5}>
        <TextField
          fullWidth
          required
          error={Boolean(errors.nombre)}
          helperText={errors.nombre}
          label="Nombre del hábito"
          name="nombre"
          onChange={handleChange}
          placeholder="Ej. Leer antes de dormir"
          value={values.nombre}
        />

        <TextField
          fullWidth
          error={Boolean(errors.descripcion)}
          helperText={errors.descripcion}
          label="Descripción"
          multiline
          minRows={3}
          name="descripcion"
          onChange={handleChange}
          placeholder="Describe brevemente tu hábito..."
          value={values.descripcion}
        />
        <Autocomplete
          freeSolo
          fullWidth
          options={categoryOptions}
          value={values.categoria || ""}
          onChange={handleCategoryChange}
          onInputChange={(_, newValue) => {
            setValues((currentValues) => ({
              ...currentValues,
              categoria: newValue,
            }));

            clearError("categoria");
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              required
              error={Boolean(errors.categoria)}
              helperText={errors.categoria}
              label="Categoría"
              placeholder="Selecciona o escribe una categoría"
            />
          )}
        />
        <Box
          sx={{
            border: "1px solid",
            borderColor: "#E8E5E0",
            borderRadius: 3,
            p: 2.5,
            backgroundColor: "#FAF8F4",
          }}
        >
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={values.esCuantificable}
                  name="esCuantificable"
                  onChange={handleQuantifiableChange}
                />
              }
              label={
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: "#29272D",
                    }}
                  >
                    Hábito cuantificable
                  </Typography>

                  <Typography
                    color="text.secondary"
                    variant="body2"
                    sx={{ mt: 0.25 }}
                  >
                    Define una cantidad que quieras alcanzar.
                  </Typography>
                </Box>
              }
            />

            {values.esCuantificable && (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  required
                  error={Boolean(errors.cantidadObjetivo)}
                  helperText={errors.cantidadObjetivo}
                  label="Cantidad objetivo"
                  name="cantidadObjetivo"
                  onChange={handleChange}
                  placeholder="Ej. 30"
                  type="number"
                  value={values.cantidadObjetivo}
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      step: "any",
                    },
                  }}
                />
                <Autocomplete
                  freeSolo
                  fullWidth
                  options={unitOptions}
                  value={values.unidadObjetivo || ""}
                  onChange={handleUnitChange}
                  onInputChange={(_, newValue) => {
                    setValues((currentValues) => ({
                      ...currentValues,
                      unidadObjetivo: newValue,
                    }));
                    clearError("unidadObjetivo");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      error={Boolean(errors.unidadObjetivo)}
                      helperText={errors.unidadObjetivo}
                      label="Unidad"
                      placeholder="Ej. minutos"
                    />
                  )}
                />
              </Stack>
            )}
          </Stack>
        </Box>

        <FormControl error={Boolean(errors.frecuencia)}>
          <FormLabel
            sx={{
              color: "#29272D",
              fontWeight: 700,
              mb: 1,
            }}
          >
            Frecuencia
          </FormLabel>

          <RadioGroup
            name="frecuencia"
            value={values.frecuencia}
            onChange={handleChange}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <FormControlLabel
                value="daily"
                control={<Radio />}
                label="Diaria"
              />

              <FormControlLabel
                value="weekly"
                control={<Radio />}
                label="Semanal"
              />

              <FormControlLabel
                value="monthly"
                control={<Radio />}
                label="Mensual"
              />

              <FormControlLabel
                value="custom"
                control={<Radio />}
                label="Personalizada"
              />
            </Stack>
          </RadioGroup>

          {errors.frecuencia && (
            <FormHelperText>{errors.frecuencia}</FormHelperText>
          )}
        </FormControl>

        <FormControl error={Boolean(errors.prioridad)}>
          <FormLabel
            sx={{
              color: "#29272D",
              fontWeight: 700,
              mb: 1,
            }}
          >
            Prioridad
          </FormLabel>

          <RadioGroup
            name="prioridad"
            value={values.prioridad}
            onChange={handleChange}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <FormControlLabel value="baja" control={<Radio />} label="Baja" />

              <FormControlLabel
                value="media"
                control={<Radio />}
                label="Media"
              />

              <FormControlLabel value="alta" control={<Radio />} label="Alta" />
            </Stack>
          </RadioGroup>

          {errors.prioridad && (
            <FormHelperText>{errors.prioridad}</FormHelperText>
          )}
        </FormControl>

        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              color: "#29272D",
              mb: 1.5,
            }}
          >
            Duración
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  mb: 0.75,
                  color: "#29272D",
                }}
              >
                Fecha de inicio *
              </Typography>

              <TextField
                fullWidth
                required
                error={Boolean(errors.fechaInicio)}
                helperText={errors.fechaInicio}
                name="fechaInicio"
                onChange={handleChange}
                type="date"
                value={values.fechaInicio}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  mb: 0.75,
                  color: "#29272D",
                }}
              >
                Fecha de fin
              </Typography>

              <TextField
                fullWidth
                error={Boolean(errors.fechaFin)}
                helperText={
                  errors.fechaFin || "Debe ser posterior a la fecha de inicio"
                }
                name="fechaFin"
                onChange={handleChange}
                type="date"
                value={values.fechaFin}
                slotProps={{
                  htmlInput: {
                    min: getNextDate(values.fechaInicio),
                  },
                }}
              />
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            borderTop: "1px solid",
            borderColor: "#E8E5E0",
            pt: 2,
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={values.activo}
                name="activo"
                onChange={handleChange}
              />
            }
            label="Hábito activo"
          />
        </Box>

        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          spacing={1.5}
          sx={{
            justifyContent: "flex-end",
            pt: 1,
          }}
        >
          <Button
            component={Link}
            disabled={isSubmitting}
            href={cancelHref}
            variant="outlined"
          >
            Cancelar
          </Button>

          <Button disabled={isSubmitting} type="submit" variant="contained">
            {isSubmitting ? (
              <CircularProgress color="inherit" size={22} />
            ) : (
              submitLabel
            )}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
