'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from '@mui/material'
import { getFieldErrors, habitSchema } from '../utils/validation'

export const emptyHabitValues = {
  nombre: '',
  descripcion: '',
  categoria: '',
  frecuencia: '',
  prioridad: '',
  fechaInicio: '',
  fechaFin: '',
  activo: true,
}

export default function HabitForm({ cancelHref, initialValues, onSubmit, submitLabel }) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setValues(initialValues)
    setErrors({})
  }, [initialValues])

  function handleChange(event) {
    const { checked, name, type, value } = event.target
    setValues((currentValues) => ({
      ...currentValues,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const parsedValues = habitSchema.safeParse(values)

    if (!parsedValues.success) {
      setErrors(getFieldErrors(parsedValues.error))
      return
    }

    const { fechaFin, ...habit } = parsedValues.data
    setIsSubmitting(true)

    try {
      await onSubmit({ ...habit, ...(fechaFin ? { fechaFin } : {}) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box component="form" noValidate onSubmit={handleSubmit}>
      <Stack spacing={2.5}>
        <TextField error={Boolean(errors.nombre)} helperText={errors.nombre} label="Nombre" name="nombre" onChange={handleChange} required value={values.nombre} />
        <TextField error={Boolean(errors.descripcion)} helperText={errors.descripcion} label="Descripción" multiline minRows={3} name="descripcion" onChange={handleChange} value={values.descripcion} />
        <TextField error={Boolean(errors.categoria)} helperText={errors.categoria} label="Categoría" name="categoria" onChange={handleChange} required value={values.categoria} />
        <TextField error={Boolean(errors.frecuencia)} helperText={errors.frecuencia} label="Frecuencia" name="frecuencia" onChange={handleChange} required select value={values.frecuencia}>
          <MenuItem value="diaria">Diaria</MenuItem>
          <MenuItem value="semanal">Semanal</MenuItem>
          <MenuItem value="mensual">Mensual</MenuItem>
        </TextField>
        <TextField error={Boolean(errors.prioridad)} helperText={errors.prioridad} label="Prioridad" name="prioridad" onChange={handleChange} required select value={values.prioridad}>
          <MenuItem value="baja">Baja</MenuItem>
          <MenuItem value="media">Media</MenuItem>
          <MenuItem value="alta">Alta</MenuItem>
        </TextField>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
          <TextField error={Boolean(errors.fechaInicio)} helperText={errors.fechaInicio} label="Fecha de inicio" name="fechaInicio" onChange={handleChange} required slotProps={{ inputLabel: { shrink: true } }} type="date" value={values.fechaInicio} />
          <TextField error={Boolean(errors.fechaFin)} helperText={errors.fechaFin} label="Fecha de fin (opcional)" name="fechaFin" onChange={handleChange} slotProps={{ inputLabel: { shrink: true } }} type="date" value={values.fechaFin} />
        </Stack>
        <FormControlLabel control={<Switch checked={values.activo} name="activo" onChange={handleChange} />} label="Hábito activo" />
        <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="flex-end" spacing={1.5}>
          <Button component={Link} disabled={isSubmitting} href={cancelHref} variant="outlined">Cancelar</Button>
          <Button disabled={isSubmitting} type="submit" variant="contained">
            {isSubmitting ? <CircularProgress color="inherit" size={22} /> : submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
