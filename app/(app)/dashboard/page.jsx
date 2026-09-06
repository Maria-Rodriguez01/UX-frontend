'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { BarChartRounded, CheckCircleRounded, EmojiEventsRounded, TodayRounded } from '@mui/icons-material'
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
    <Card sx={{ flex: '1 1 180px' }}>
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

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const loadDashboard = useCallback(async () => {
    try {
      const habitsResponse = await getHabits()
      setError(null)
      setData({ habits: unwrapCollection(habitsResponse, 'habits') })
    } catch (requestError) {
      setError(requestError.message || 'No pudimos cargar el Dashboard. Intenta nuevamente.')
    }
  }, [])

  const handleRetry = useCallback(() => {
    setError(null)
    loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const habitsResponse = await getHabits()
        if (cancelled) return
        setError(null)
        setData({ habits: unwrapCollection(habitsResponse, 'habits') })
      } catch (requestError) {
        if (cancelled) return
        setError(requestError.message || 'No pudimos cargar el Dashboard. Intenta nuevamente.')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const dashboard = useMemo(() => {
    if (!data) return null
    const total = data.habits.length
    const activeHabits = data.habits.filter((habit) => habit.activo !== false)
    const inactiveCount = total - activeHabits.length

    const byFrecuencia = data.habits.reduce((counts, habit) => {
      const key = habit.frecuencia || 'custom'
      counts[key] = (counts[key] || 0) + 1
      return counts
    }, {})

    return {
      total,
      activeHabits,
      inactiveCount,
      activesPct: total ? Math.round((activeHabits.length / total) * 100) : 0,
      byFrecuencia: [
        { label: 'Diaria', count: byFrecuencia.daily || 0 },
        { label: 'Semanal', count: byFrecuencia.weekly || 0 },
        { label: 'Personalizada', count: byFrecuencia.custom || 0 },
      ],
    }
  }, [data])

  return (
    <Stack component="section" spacing={3}>
      <Box>
        <Typography component="h1" variant="h4">Dashboard</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>Así va el progreso de tus hábitos.</Typography>
      </Box>

      {!data && !error && <LoadingState message="Cargando Dashboard..." />}
      {error && <ErrorState message={error} onRetry={handleRetry} />}

      {dashboard && (
        <>
          <Stack direction="row" flexWrap="wrap" gap={2}>
            <MetricCard icon={<TodayRounded color="primary" />} label="Total de hábitos" value={dashboard.total} />
            <MetricCard icon={<CheckCircleRounded color="success" />} label="Hábitos activos" value={dashboard.activeHabits.length} />
            <MetricCard icon={<BarChartRounded color="primary" />} label="Hábitos inactivos" value={dashboard.inactiveCount} />
            <MetricCard icon={<EmojiEventsRounded color="secondary" />} label="Hábitos activos" value={`${dashboard.activesPct}%`} />
          </Stack>

          {dashboard.total === 0 ? (
            <Card><CardContent sx={{ py: 6, textAlign: 'center' }}><Typography component="h2" variant="h6">Aún no tienes hábitos.</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Crea tu primer hábito para comenzar a ver tu progreso.</Typography></CardContent></Card>
          ) : (
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography component="h2" variant="h6">Hábitos activos</Typography>
                  <Stack spacing={1.25} sx={{ mt: 2 }}>
                    {dashboard.activeHabits.map((habit) => <Stack alignItems="center" direction="row" justifyContent="space-between" key={habit.id || habit._id}><Typography>{habit.nombre}</Typography><Chip label={frecuenciaLabel(habit.frecuencia)} size="small" variant="outlined" /></Stack>)}
                    {dashboard.activeHabits.length === 0 && <Typography color="text.secondary">No tienes hábitos activos.</Typography>}
                  </Stack>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography component="h2" variant="h6">Hábitos por frecuencia</Typography>
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    {dashboard.byFrecuencia.map((item) => (
                      <Stack key={item.label} spacing={0.5}>
                        <Stack alignItems="center" direction="row" justifyContent="space-between">
                          <Typography color="text.secondary" variant="body2">{item.label}</Typography>
                          <Typography color="text.secondary" variant="body2">{item.count}</Typography>
                        </Stack>
                        <LinearProgress value={dashboard.total ? (item.count / dashboard.total) * 100 : 0} variant="determinate" />
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          )}
        </>
      )}
    </Stack>
  )
}