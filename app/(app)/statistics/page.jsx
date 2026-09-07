'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { BarChartRounded, CheckCircleRounded, EmojiEventsRounded, EventAvailableRounded, TodayRounded } from '@mui/icons-material'
import { Box, Button, Card, CardContent, Chip, LinearProgress, Stack, Typography } from '@mui/material'
import Link from 'next/link'
import { getHabits } from '../../../services/habits'
import { getDailyStatistics, getMonthlyStatistics, getWeeklyStatistics } from '../../../services/statistics'
import { pct, todayKey } from '../../../utils'
import ErrorState from '../../../components/ErrorState'
import EmptyState from '../../../components/EmptyState'
import LoadingState from '../../../components/LoadingState'

function unwrapCollection(response, key) {
  return Array.isArray(response) ? response : response?.[key] || response?.data || []
}

function MetricCard({ icon, label, value }) {
  return (
    <Card sx={{ flex: '1 1 210px' }}>
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

function ProgressBlock({ head, aggregate, total, rows, emptyMessage }) {
  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
        <Typography component="h2" variant="h6">{head}</Typography>
        {total > 0 && (
          <Typography color="text.secondary" variant="body2">
            {aggregate} de {total} · {pct(aggregate, total)}%
          </Typography>
        )}
      </Stack>
      {total === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 2 }}>{emptyMessage}</Typography>
      ) : (
        <>
          <LinearProgress sx={{ mt: 2 }} value={pct(aggregate, total)} variant="determinate" />
          <Stack spacing={1} sx={{ mt: 2 }}>
            {rows.map((row) => (
              <Stack direction="row" key={row.id} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2">{row.nombre}</Typography>
                {row.completedComponent}
              </Stack>
            ))}
          </Stack>
        </>
      )}
    </>
  )
}

export default function StatisticsPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const loadStatistics = useCallback(async () => {
    const [habitsResponse, daily, weekly, monthly] = await Promise.all([
      getHabits(),
      getDailyStatistics(todayKey()),
      getWeeklyStatistics(todayKey()),
      getMonthlyStatistics(todayKey()),
    ])
    setError(null)
    setData({
      habits: unwrapCollection(habitsResponse, 'habits'),
      daily,
      weekly,
      monthly,
    })
  }, [])

  const handleRetry = useCallback(() => {
    setError(null)
    loadStatistics()
  }, [loadStatistics])

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
        setError(null)
        setData({
          habits: unwrapCollection(habitsResponse, 'habits'),
          daily,
          weekly,
          monthly,
        })
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

  const statistics = useMemo(() => {
    if (!data) return null
    const total = data.habits.length
    const active = data.habits.filter((habit) => habit.activo !== false)

    const byFrecuencia = data.habits.reduce((counts, habit) => {
      const key = habit.frecuencia || 'custom'
      counts[key] = (counts[key] || 0) + 1
      return counts
    }, {})

    return {
      total,
      active: active.length,
      completadosHoy: data.daily?.completados ?? 0,
      pendientesHoy: data.daily?.pendientes ?? 0,
      pctHoy: data.daily ? pct(data.daily.completados, data.daily.habitsCount) : 0,
      dayHabits: data.daily?.habits || [],
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
        <Typography component="h1" variant="h4">Estadísticas</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>Consulta el progreso de tus hábitos.</Typography>
      </Box>

      {!data && !error && <LoadingState message="Cargando estadísticas..." />}
      {error && <ErrorState message={error} onRetry={handleRetry} />}

      {statistics && (
        <>
          <Stack direction="row" gap={2} sx={{ flexWrap: 'wrap' }}>
            <MetricCard icon={<BarChartRounded color="primary" />} label="Total de hábitos" value={statistics.total} />
            <MetricCard icon={<CheckCircleRounded color="success" />} label="Hábitos activos" value={statistics.active} />
            <MetricCard icon={<EmojiEventsRounded color="primary" />} label="Completados hoy" value={statistics.completadosHoy} />
            <MetricCard icon={<EventAvailableRounded color="secondary" />} label="Pendientes hoy" value={statistics.pendientesHoy} />
            <MetricCard icon={<TodayRounded color="primary" />} label="Progreso de hoy" value={`${statistics.pctHoy}%`} />
          </Stack>

          {statistics.total === 0 ? (
            <EmptyState
              action={<Button component={Link} href="/habits/new" variant="outlined">Crea tu primer hábito</Button>}
              description="Cuando crees hábitos podrás ver aquí el progreso diario, semanal y mensual."
              title="Aún no tienes hábitos."
            />
          ) : (
            <>
              <Card>
                <CardContent>
                  <ProgressBlock
                    aggregate={statistics.completadosHoy}
                    emptyMessage="Sin hábitos para hoy."
                    head="Hoy"
                    rows={statistics.dayHabits.map((habit) => ({
                      id: habit.id,
                      nombre: habit.nombre,
                      completedComponent: habit.completado ? (
                        <Chip color="success" label="Completado" size="small" />
                      ) : (
                        <Chip color="default" label="Pendiente" size="small" variant="outlined" />
                      ),
                    }))}
                    total={statistics.dayHabits.length}
                  />
                </CardContent>
              </Card>

              <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <ProgressBlock
                      aggregate={statistics.weekly?.completados ?? 0}
                      emptyMessage="Todavía no hay progreso registrado."
                      head="Semana"
                      rows={(statistics.weekly?.habits || []).map((habit) => ({
                        id: habit.id,
                        nombre: habit.nombre,
                        completedComponent: (
                          <Typography color="text.secondary" variant="body2">{habit.completados}/{habit.totalDias}</Typography>
                        ),
                      }))}
                      total={statistics.weekly?.totalDias ?? 0}
                    />
                  </CardContent>
                </Card>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <ProgressBlock
                      aggregate={statistics.monthly?.completados ?? 0}
                      emptyMessage="Todavía no hay progreso registrado."
                      head="Mes"
                      rows={(statistics.monthly?.habits || []).map((habit) => ({
                        id: habit.id,
                        nombre: habit.nombre,
                        completedComponent: (
                          <Typography color="text.secondary" variant="body2">{habit.completados}/{habit.totalDias} días</Typography>
                        ),
                      }))}
                      total={statistics.monthly?.totalDias ?? 0}
                    />
                  </CardContent>
                </Card>
              </Stack>

              <Card>
                <CardContent>
                  <Typography component="h2" variant="h6">Hábitos por frecuencia</Typography>
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    {statistics.byFrecuencia.map((item) => (
                      <Box key={item.label}>
                        <Stack direction="row" sx={{ mb: 0.75, justifyContent: 'space-between' }}>
                          <Typography color="text.secondary" variant="body2">{item.label}</Typography>
                          <Typography color="text.secondary" variant="body2">{item.count}</Typography>
                        </Stack>
                        <LinearProgress value={statistics.total ? (item.count / statistics.total) * 100 : 0} variant="determinate" />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </Stack>
  )
}