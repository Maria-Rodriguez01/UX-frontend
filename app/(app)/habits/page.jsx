'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AddRounded, CheckCircleRounded, DeleteOutlineRounded, EditOutlined, SearchRounded } from '@mui/icons-material'
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
} from '@mui/material'
import { deleteHabit, getHabits } from '../../../services/habits'
import { getRecords } from '../../../services/records'
import { frecuenciaLabel, todayKey } from '../../../utils'
import { useCompleteHabit } from '../../../hooks/useCompleteHabit'
import ErrorState from '../../../components/ErrorState'
import EmptyState from '../../../components/EmptyState'
import FeedbackSnackbar from '../../../components/FeedbackSnackbar'
import LoadingState from '../../../components/LoadingState'

function unwrapRecords(response) {
  return Array.isArray(response) ? response : response?.records || []
}

function completedTodayIds(records) {
  return new Set(
    records.filter((record) => record.completado !== false).map((record) => record.habitoId || record.habito),
  )
}

export default function HabitsPage() {
  const [habits, setHabits] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [habitToDelete, setHabitToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [completedHabitIds, setCompletedHabitIds] = useState(() => new Set())

  const { completingId, complete } = useCompleteHabit({
    onCompleted: (habitId, { already } = {}) => {
      setCompletedHabitIds((currentIds) => new Set(currentIds).add(habitId))
      setFeedback({
        severity: 'success',
        message: already ? 'Este hábito ya estaba completado hoy.' : 'Hábito marcado como completado.',
      })
    },
    onError: (message) => {
      setFeedback({ severity: 'error', message })
    },
  })

  const loadHabits = useCallback(async () => {
    try {
      const response = await getHabits()
      const habitList = Array.isArray(response) ? response : response?.habits || response?.data || []
      setError(null)
      setHabits(habitList)
    } catch (requestError) {
      setError(requestError.message || 'No pudimos cargar tus hábitos. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadTodayRecords = useCallback(async () => {
    const response = await getRecords({ desde: todayKey(), hasta: todayKey() })
    setCompletedHabitIds(completedTodayIds(unwrapRecords(response)))
  }, [])

  const handleRetry = useCallback(() => {
    setError(null)
    setIsLoading(true)
    loadHabits()
    loadTodayRecords()
  }, [loadHabits, loadTodayRecords])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [response, recordsResponse] = await Promise.all([
          getHabits(),
          getRecords({ desde: todayKey(), hasta: todayKey() }),
        ])
        const habitList = Array.isArray(response) ? response : response?.habits || response?.data || []
        if (cancelled) return
        setError(null)
        setHabits(habitList)
        setCompletedHabitIds(completedTodayIds(unwrapRecords(recordsResponse)))
      } catch (requestError) {
        if (cancelled) return
        setError(requestError.message || 'No pudimos cargar tus hábitos. Intenta nuevamente.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleDelete() {
    if (!habitToDelete) return

    setIsDeleting(true)

    try {
      await deleteHabit(habitToDelete.id || habitToDelete._id)
      setHabitToDelete(null)
      setFeedback({ severity: 'success', message: 'Hábito eliminado correctamente.' })
      await loadHabits()
      await loadTodayRecords()
    } catch (requestError) {
      setFeedback({
        severity: 'error',
        message: requestError.message || 'No pudimos eliminar el hábito. Intenta nuevamente.',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredHabits = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return habits.filter((habit) => {
      const name = habit.nombre || ''
      const matchesSearch = name.toLowerCase().includes(normalizedSearch)
      const isActive = habit.activo !== false
      const matchesStatus = status === 'all' || (status === 'active' ? isActive : !isActive)
      return matchesSearch && matchesStatus
    })
  }, [habits, search, status])

  return (
    <Stack component="section" spacing={3}>
      <Stack
        alignItems={{ sm: 'center' }}
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography component="h1" variant="h4">Mis hábitos</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Organiza y da seguimiento a tus hábitos diarios.
          </Typography>
        </Box>
        <Button component={Link} href="/habits/new" startIcon={<AddRounded />} variant="contained">
          Crear hábito
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          label="Buscar hábito"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Escribe un nombre"
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRounded /></InputAdornment> } }}
          value={search}
        />
        <FormControl sx={{ minWidth: { md: 200 } }}>
          <InputLabel id="habit-status-label">Estado</InputLabel>
          <Select
            label="Estado"
            labelId="habit-status-label"
            onChange={(event) => setStatus(event.target.value)}
            value={status}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="active">Activos</MenuItem>
            <MenuItem value="inactive">Inactivos</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {isLoading && <LoadingState message="Cargando hábitos..." />}

      {error && <ErrorState message={error} onRetry={handleRetry} />}

      {!isLoading && !error && filteredHabits.length === 0 && (
        <EmptyState
          action={habits.length === 0 && <Button component={Link} href="/habits/new" variant="outlined">Crea tu primer hábito</Button>}
          description={habits.length === 0 ? 'Comienza con un hábito pequeño y dale seguimiento.' : 'Prueba con otro nombre o estado.'}
          title={habits.length === 0 ? 'Aún no tienes hábitos.' : 'No encontramos hábitos con esos filtros.'}
        />
      )}

      {!isLoading && !error && filteredHabits.length > 0 && (
        <Stack spacing={2}>
          {filteredHabits.map((habit) => {
            const isActive = habit.activo !== false
            const habitId = habit.id || habit._id
            const isCompleted = completedHabitIds.has(habitId)
            const isCompleting = completingId === habitId
            return (
              <Card key={habitId}>
                <CardContent>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                    <Box>
                      <Stack alignItems="center" direction="row" spacing={1}>
                        <Typography component="h2" variant="h6">{habit.nombre}</Typography>
                        <Chip color={isActive ? 'success' : 'default'} label={isActive ? 'Activo' : 'Inactivo'} size="small" />
                        {isCompleted && <Chip color="primary" label="Completado hoy" size="small" />}
                      </Stack>
                      {(habit.descripcion || habit.description) && <Typography color="text.secondary" sx={{ mt: 1 }}>{habit.descripcion || habit.description}</Typography>}
                      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
                        {(habit.categoria || habit.categoría) && <Chip label={habit.categoria || habit.categoría} size="small" variant="outlined" />}
                        {habit.frecuencia && <Chip label={frecuenciaLabel(habit.frecuencia)} size="small" variant="outlined" />}
                        {habit.prioridad && <Chip label={`Prioridad: ${habit.prioridad}`} size="small" variant="outlined" />}
                      </Stack>
                    </Box>
                    <Stack alignItems="center" direction="row" spacing={1}>
                      {isActive && (
                        <Button
                          disabled={!habitId || isCompleted || isCompleting}
                          onClick={() => complete(habit)}
                          size="small"
                          startIcon={isCompleting ? <CircularProgress size={16} /> : <CheckCircleRounded />}
                          variant={isCompleted ? 'outlined' : 'contained'}
                        >
                          {isCompleting ? 'Guardando...' : isCompleted ? 'Completado' : 'Completar'}
                        </Button>
                      )}
                      <Button component={Link} disabled={!habitId} href={`/habits/${habitId}/edit`} size="small" startIcon={<EditOutlined />} variant="outlined">Editar</Button>
                      <Button color="error" disabled={!habitId} onClick={() => setHabitToDelete(habit)} size="small" startIcon={<DeleteOutlineRounded />} variant="outlined">Eliminar</Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            )
          })}
        </Stack>
      )}

      <Dialog
        aria-describedby="delete-habit-description"
        onClose={isDeleting ? undefined : () => setHabitToDelete(null)}
        open={Boolean(habitToDelete)}
      >
        <DialogTitle>¿Eliminar hábito?</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-habit-description">
            Vas a eliminar <strong>{habitToDelete?.nombre}</strong>. Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={isDeleting} onClick={() => setHabitToDelete(null)}>Cancelar</Button>
          <Button color="error" disabled={isDeleting} onClick={handleDelete} variant="contained">
            {isDeleting ? <CircularProgress color="inherit" size={20} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      <FeedbackSnackbar feedback={feedback} onClose={() => setFeedback(null)} />
    </Stack>
  )
}
