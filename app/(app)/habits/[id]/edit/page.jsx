'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowBackRounded } from '@mui/icons-material'
import { Alert, Box, Button, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material'
import FeedbackSnackbar from '../../../../../components/FeedbackSnackbar'
import HabitForm, { emptyHabitValues } from '../../../../../components/HabitForm'
import { getHabit, updateHabit } from '../../../../../services/habits'

function formatDate(value) {
  return value ? String(value).slice(0, 10) : ''
}

export default function EditHabitPage() {
  const { id } = useParams()
  const router = useRouter()
  const [habit, setHabit] = useState(null)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const loadHabit = useCallback(async () => {
    try {
      const response = await getHabit(id)
      setError(null)
      setHabit({
        nombre: response.nombre || '',
        descripcion: response.descripcion || response.description || '',
        categoria: response.categoria || response.categoría || '',
        frecuencia: response.frecuencia || '',
        prioridad: response.prioridad || '',
        fechaInicio: formatDate(response.fechaInicio),
        fechaFin: formatDate(response.fechaFin),
        activo: response.activo !== false,
      })
    } catch (requestError) {
      setError(requestError.message || 'No pudimos cargar el hábito. Intenta nuevamente.')
    }
  }, [id])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response = await getHabit(id)
        if (cancelled) return
        setError(null)
        setHabit({
          nombre: response.nombre || '',
          descripcion: response.descripcion || response.description || '',
          categoria: response.categoria || response.categoría || '',
          frecuencia: response.frecuencia || '',
          prioridad: response.prioridad || '',
          fechaInicio: formatDate(response.fechaInicio),
          fechaFin: formatDate(response.fechaFin),
          activo: response.activo !== false,
        })
      } catch (requestError) {
        if (cancelled) return
        setError(requestError.message || 'No pudimos cargar el hábito. Intenta nuevamente.')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  const handleRetry = useCallback(() => {
    setError(null)
    loadHabit()
  }, [loadHabit])

  async function handleUpdate(values) {
    try {
      await updateHabit(id, values)
      setFeedback({ severity: 'success', message: 'Hábito actualizado correctamente.' })
      window.setTimeout(() => router.push('/habits'), 700)
    } catch (requestError) {
      setFeedback({
        severity: 'error',
        message: requestError.message || 'No pudimos actualizar el hábito. Intenta nuevamente.',
      })
    }
  }

  return (
    <Stack component="section" spacing={3} sx={{ maxWidth: 760, mx: 'auto' }}>
      <Box>
        <Button component={Link} href="/habits" startIcon={<ArrowBackRounded />} variant="text">Volver a mis hábitos</Button>
        <Typography component="h1" sx={{ mt: 1 }} variant="h4">Editar hábito</Typography>
      </Box>

      {!habit && !error && <Stack spacing={2} sx={{ py: 8, alignItems: 'center' }}><CircularProgress /><Typography color="text.secondary">Cargando hábito...</Typography></Stack>}
      {error && <Alert action={<Button color="inherit" onClick={handleRetry} size="small">Reintentar</Button>} severity="error">{error}</Alert>}
      {habit && <Card><CardContent sx={{ p: { xs: 2, sm: 3 } }}><HabitForm cancelHref="/habits" initialValues={habit || emptyHabitValues} onSubmit={handleUpdate} submitLabel="Guardar cambios" /></CardContent></Card>}

      <FeedbackSnackbar feedback={feedback} onClose={() => setFeedback(null)} />
    </Stack>
  )
}
