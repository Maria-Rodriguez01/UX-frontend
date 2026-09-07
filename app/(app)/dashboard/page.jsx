'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BarChartRounded, CheckCircleRounded, EmojiEventsRounded, EventAvailableRounded, TodayRounded } from '@mui/icons-material'
import { Box, Button, Card, CardContent, Chip, CircularProgress, LinearProgress, Stack, Typography } from '@mui/material'
import { getHabits } from '../../../services/habits'
import { getDailyStatistics, getMonthlyStatistics, getWeeklyStatistics } from '../../../services/statistics'
import { pct, todayKey } from '../../../utils'
import { useCompleteHabit } from '../../../hooks/useCompleteHabit'
import ErrorState from '../../../components/ErrorState'
import EmptyState from '../../../components/EmptyState'
import FeedbackSnackbar from '../../../components/FeedbackSnackbar'
import LoadingState from '../../../components/LoadingState'

function unwrapCollection(response, key) {
  return Array.isArray(response) ? response : response?.[key] || response?.data || []
}

function MetricCard({ icon, label, value }) {
  return (
    <Card sx={{ flex: '1 1 180px' }}>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography color="text.secondary" variant="body2">{label}</Typography>
          {icon}
        </Stack>
        <Typography component="p" sx={{ mt: 1 }} variant="h4">{value}</Typography>
      </CardContent>
    </Card>
  )
}

function PeriodProgress({ completados, totalDias, habits }) {
  if (!totalDias) {
    return <Typography color="text.secondary">Todavía no hay progreso registrado.</Typography>
  }
  return (
    <>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography color="text.secondary" variant="body2">{completados} de {totalDias} completados</Typography>
        <Typography color="text.secondary" variant="body2">{pct(completados, totalDias)}%</Typography>
      </Stack>
      <LinearProgress sx={{ mt: 1.5 }} value={pct(completados, totalDias)} variant="determinate" />
      <Stack spacing={1} sx={{ mt: 2 }}>
        {habits.map((habit) => (
          <Stack direction="row" key={habit.id} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2">{habit.nombre}</Typography>
            <Typography color="text.secondary" variant="body2">{habit.completados}/{habit.totalDias}</Typography>
          </Stack>
        ))}
      </Stack>
    </>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const loadDashboard = useCallback(async () => {
    const [, daily, weekly, monthly] = await Promise.all([
      getHabits(),
      getDailyStatistics(todayKey()),
      getWeeklyStatistics(todayKey()),
      getMonthlyStatistics(todayKey()),
    ])
    setError(null)
    setData({ habits: daily.habits, daily, weekly, monthly })
  }, [])

  const handleRetry = useCallback(() => {
    setError(null)
    loadDashboard()
  }, [loadDashboard])

  const { completingId, complete } = useCompleteHabit({
    onCompleted: (habitId, { already } = {}) => {
      setFeedback({
        severity: 'success',
        message: already ? 'Este hábito ya estaba completado hoy.' : 'Hábito marcado como completado.',
      })
      loadDashboard()
    },
    onError: (message) => {
      setFeedback({ severity: 'error', message })
    },
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [habitsResponse, daily, weekly, monthly] = await Promise.all([
          getHabits(),
          getDailyStatistics(todayKey()),
          getWeeklyStatistics(todayKey()),
          getMonthlyStatistics(todayKey()),
        ])
        if (cancelled) return
        const habitList = unwrapCollection(habitsResponse, 'habits')
        setError(null)
        setData({ habits: habitList, daily, weekly, monthly })
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

    const dayHabits = data.daily?.habits || []

    return {
      total,
      activeHabits,
      inactiveCount,
      activesPct: total ? Math.round((activeHabits.length / total) * 100) : 0,
      hasNoHabits: total === 0,
      hasNoDayProgress: dayHabits.length === 0,
      dayHabits,
      completadosHoy: data.daily?.completados ?? 0,
      pendientesHoy: data.daily?.pendientes ?? 0,
      pctHoy: data.daily ? pct(data.daily.completados, data.daily.habitsCount) : 0,
      weekly: data.weekly,
      monthly: data.monthly,
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
          <Stack direction="row" gap={2} sx={{ flexWrap: 'wrap' }}>
            <MetricCard icon={<TodayRounded color="primary" />} label="Total de hábitos" value={dashboard.total} />
            <MetricCard icon={<CheckCircleRounded color="success" />} label="Hábitos activos" value={dashboard.activeHabits.length} />
            <MetricCard icon={<EmojiEventsRounded color="primary" />} label="Completados hoy" value={dashboard.completadosHoy} />
            <MetricCard icon={<EventAvailableRounded color="secondary" />} label="Pendientes hoy" value={dashboard.pendientesHoy} />
            <MetricCard icon={<BarChartRounded color="primary" />} label="Progreso de hoy" value={`${dashboard.pctHoy}%`} />
          </Stack>

          {dashboard.hasNoHabits ? (
            <EmptyState
              action={<Button component={Link} href="/habits/new" variant="outlined">Crea tu primer hábito</Button>}
              description="Comienza con un hábito pequeño y dale seguimiento."
              title="Aún no tienes hábitos."
            />
          ) : (
            <>
              <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography component="h2" variant="h6">Hábitos del día</Typography>
                    {dashboard.hasNoDayProgress ? (
                      <Typography color="text.secondary" sx={{ mt: 2 }}>Sin hábitos para hoy.</Typography>
                    ) : (
                      <Stack spacing={1.25} sx={{ mt: 2 }}>
                        {dashboard.dayHabits.map((habit) => {
                          const isCompleting = completingId === habit.id
                          return (
                            <Stack direction="row" key={habit.id} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography>{habit.nombre}</Typography>
                              {habit.completado ? (
                                <Chip color="success" label="Completado" size="small" />
                              ) : (
                                <Button
                                  disabled={isCompleting}
                                  onClick={() => complete(habit)}
                                  size="small"
                                  startIcon={isCompleting ? <CircularProgress size={16} /> : <CheckCircleRounded />}
                                  variant="contained"
                                >
                                  {isCompleting ? 'Guardando...' : 'Completar'}
                                </Button>
                              )}
                            </Stack>
                          )
                        })}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography component="h2" variant="h6">Progreso de la semana</Typography>
                    <Box sx={{ mt: 2 }}>
                      <PeriodProgress
                        completados={dashboard.weekly?.completados ?? 0}
                        habits={dashboard.weekly?.habits || []}
                        totalDias={dashboard.weekly?.totalDias ?? 0}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Stack>

              <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography component="h2" variant="h6">Progreso del mes</Typography>
                    <Box sx={{ mt: 2 }}>
                      <PeriodProgress
                        completados={dashboard.monthly?.completados ?? 0}
                        habits={dashboard.monthly?.habits || []}
                        totalDias={dashboard.monthly?.totalDias ?? 0}
                      />
                    </Box>
                  </CardContent>
                </Card>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography component="h2" variant="h6">Hábitos por frecuencia</Typography>
                    <Stack spacing={1.5} sx={{ mt: 2 }}>
                      {dashboard.byFrecuencia.map((item) => (
                        <Stack key={item.label} spacing={0.5}>
                          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
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
            </>
          )}
        </>
      )}

      <FeedbackSnackbar feedback={feedback} onClose={() => setFeedback(null)} />
    </Stack>
  )
}