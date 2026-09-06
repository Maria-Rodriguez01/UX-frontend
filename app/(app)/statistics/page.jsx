'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { BarChartRounded, CheckCircleRounded, EventAvailableRounded, TodayRounded } from '@mui/icons-material'
import { Box, Card, CardContent, Chip, LinearProgress, Stack, Typography } from '@mui/material'
import ErrorState from '../../../components/ErrorState'
import LoadingState from '../../../components/LoadingState'
import { getHabits } from '../../../services/habits'
import { frecuenciaLabel } from '../../../utils'

function unwrapCollection(response, key) {
  return Array.isArray(response) ? response : response?.[key] || response?.data || []
}

function MetricCard({ icon, label, value }) {
  return (
    <Card sx={{ flex: '1 1 210px' }}>
      <CardContent>
        <Stack alignItems="center" direction="row" justifyContent="space-between">
          <Typography color="text.secondary" variant="body2">{label}</Typography>
          {icon}
        </Stack>
        <Typography component="p" sx={{ mt: 1 }} variant="h4">{value}</Typography>
      </CardContent>
    </Card>
  )
}

export default function StatisticsPage() {
  const [habits, setHabits] = useState(null)
  const [error, setError] = useState(null)

  const loadStatistics = useCallback(async () => {
    try {
      const response = await getHabits()
      setError(null)
      setHabits({ habits: unwrapCollection(response, 'habits') })
    } catch (requestError) {
      setError(requestError.message || 'No pudimos cargar las estadísticas. Intenta nuevamente.')
    }
  }, [])

  const handleRetry = useCallback(() => {
    setError(null)
    loadStatistics()
  }, [loadStatistics])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response = await getHabits()
        if (cancelled) return
        setError(null)
        setHabits({ habits: unwrapCollection(response, 'habits') })
      } catch (requestError) {
        if (cancelled) return
        setError(requestError.message || 'No pudimos cargar las estadísticas. Intenta nuevamente.')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const metrics = useMemo(() => {
    if (!habits) return null
    const list = habits.habits
    const total = list.length
    const active = list.filter((habit) => habit.activo !== false)
    const activesPct = total ? Math.round((active.length / total) * 100) : 0

    const byFrecuencia = list.reduce((counts, habit) => {
      const key = habit.frecuencia || 'custom'
      counts[key] = (counts[key] || 0) + 1
      return counts
    }, {})

    return {
      total,
      active: active.length,
      inactive: total - active.length,
      activesPct,
      byFrecuencia: [
        { label: 'Diaria', count: byFrecuencia.daily || 0 },
        { label: 'Semanal', count: byFrecuencia.weekly || 0 },
        { label: 'Personalizada', count: byFrecuencia.custom || 0 },
      ],
      activeList: active,
    }
  }, [habits])

  return (
    <Stack component="section" spacing={3}>
      <Box>
        <Typography component="h1" variant="h4">Estadísticas</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>Consulta la información de tus hábitos.</Typography>
      </Box>

      {!habits && !error && <LoadingState message="Cargando estadísticas..." />}
      {error && <ErrorState message={error} onRetry={handleRetry} />}

      {metrics && (
        <>
          <Stack direction="row" flexWrap="wrap" gap={2}>
            <MetricCard icon={<BarChartRounded color="primary" />} label="Total de hábitos" value={metrics.total} />
            <MetricCard icon={<CheckCircleRounded color="success" />} label="Hábitos activos" value={metrics.active} />
            <MetricCard icon={<EventAvailableRounded color="secondary" />} label="Hábitos inactivos" value={metrics.inactive} />
            <MetricCard icon={<TodayRounded color="primary" />} label="Hábitos activos" value={`${metrics.activesPct}%`} />
          </Stack>

          <Card>
            <CardContent>
              <Stack alignItems={{ sm: 'center' }} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                <Typography component="h2" variant="h6">Distribución activos / inactivos</Typography>
                <Typography color="text.secondary" variant="body2">{metrics.activesPct}% activos</Typography>
              </Stack>
              <LinearProgress sx={{ mt: 2 }} value={metrics.activesPct} variant="determinate" />
            </CardContent>
          </Card>

          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography component="h2" variant="h6">Hábitos por frecuencia</Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {metrics.byFrecuencia.map((item) => (
                    <Box key={item.label}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                        <Typography>{item.label}</Typography>
                        <Typography color="text.secondary" variant="body2">{item.count}</Typography>
                      </Stack>
                      <LinearProgress value={metrics.total ? (item.count / metrics.total) * 100 : 0} variant="determinate" />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography component="h2" variant="h6">Hábitos activos</Typography>
                <Stack spacing={1.25} sx={{ mt: 2 }}>
                  {metrics.activeList.map((habit) => <Stack alignItems="center" direction="row" justifyContent="space-between" key={habit.id || habit._id}><Typography>{habit.nombre}</Typography><Chip label={frecuenciaLabel(habit.frecuencia)} size="small" variant="outlined" /></Stack>)}
                  {metrics.activeList.length === 0 && <Typography color="text.secondary">No tienes hábitos activos.</Typography>}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </>
      )}
    </Stack>
  )
}