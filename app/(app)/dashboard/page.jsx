'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { BarChartRounded, CheckCircleRounded, EmojiEventsRounded, LocalFireDepartmentRounded, TodayRounded } from '@mui/icons-material'
import { Box, Card, CardContent, Chip, LinearProgress, Stack, Typography } from '@mui/material'
import ErrorState from '../../../components/ErrorState'
import LoadingState from '../../../components/LoadingState'
import { getHabits } from '../../../services/habits'
import { getRecords } from '../../../services/records'

function unwrapCollection(response, key) {
  return Array.isArray(response) ? response : response?.[key] || response?.data || []
}

function dateKey(date) {
  return date.toLocaleDateString('en-CA')
}

function recordDateKey(record) {
  return record.fecha ? dateKey(new Date(record.fecha)) : null
}

function completedRecords(records) {
  return records.filter((record) => record.completado !== false)
}

function calculateStreaks(records) {
  const completedDates = new Set(completedRecords(records).map(recordDateKey).filter(Boolean))
  const today = new Date()
  let current = 0
  let cursor = new Date(today)

  while (completedDates.has(dateKey(cursor))) {
    current += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  const orderedDates = [...completedDates].sort()
  let best = 0
  let streak = 0
  let previous = null

  orderedDates.forEach((value) => {
    const date = new Date(`${value}T12:00:00`)
    if (previous && (date - previous) / 86_400_000 === 1) streak += 1
    else streak = 1
    best = Math.max(best, streak)
    previous = date
  })

  return { current, best }
}

function getWeekProgress(records, activeHabitCount) {
  const today = new Date()
  const completed = completedRecords(records)

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    const key = dateKey(date)
    const count = new Set(
      completed
        .filter((record) => recordDateKey(record) === key)
        .map((record) => record.habito || record.habit || record.habitId),
    ).size
    return {
      label: new Intl.DateTimeFormat('es', { weekday: 'short' }).format(date),
      percentage: activeHabitCount ? Math.min(Math.round((count / activeHabitCount) * 100), 100) : 0,
    }
  })
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
    setError(null)
    try {
      const [habitsResponse, recordsResponse] = await Promise.all([getHabits(), getRecords()])
      setData({
        habits: unwrapCollection(habitsResponse, 'habits'),
        records: unwrapCollection(recordsResponse, 'records'),
      })
    } catch (requestError) {
      setError(requestError.message || 'No pudimos cargar el Dashboard. Intenta nuevamente.')
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const dashboard = useMemo(() => {
    if (!data) return null
    const activeHabits = data.habits.filter((habit) => habit.activo !== false)
    const completedToday = new Set(
      completedRecords(data.records)
        .filter((record) => recordDateKey(record) === dateKey(new Date()))
        .map((record) => record.habito || record.habit || record.habitId),
    ).size
    const completion = activeHabits.length ? Math.round((completedToday / activeHabits.length) * 100) : 0
    const streaks = calculateStreaks(data.records)

    return {
      activeHabits,
      completedToday,
      completion,
      streaks,
      weekProgress: getWeekProgress(data.records, activeHabits.length),
    }
  }, [data])

  return (
    <Stack component="section" spacing={3}>
      <Box>
        <Typography component="h1" variant="h4">Dashboard</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>Así va el progreso de tus hábitos.</Typography>
      </Box>

      {!data && !error && <LoadingState message="Cargando Dashboard..." />}
      {error && <ErrorState message={error} onRetry={loadDashboard} />}

      {dashboard && (
        <>
          <Stack direction="row" flexWrap="wrap" gap={2}>
            <MetricCard icon={<TodayRounded color="primary" />} label="Hábitos activos" value={dashboard.activeHabits.length} />
            <MetricCard icon={<CheckCircleRounded color="success" />} label="Completados hoy" value={dashboard.completedToday} />
            <MetricCard icon={<LocalFireDepartmentRounded color="primary" />} label="Racha actual" value={`${dashboard.streaks.current} días`} />
            <MetricCard icon={<EmojiEventsRounded color="secondary" />} label="Mejor racha" value={`${dashboard.streaks.best} días`} />
            <MetricCard icon={<BarChartRounded color="primary" />} label="Cumplimiento de hoy" value={`${dashboard.completion}%`} />
          </Stack>

          {dashboard.activeHabits.length === 0 ? (
            <Card><CardContent sx={{ py: 6, textAlign: 'center' }}><Typography component="h2" variant="h6">Aún no tienes hábitos activos.</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Crea un hábito para comenzar a ver tu progreso.</Typography></CardContent></Card>
          ) : (
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography component="h2" variant="h6">Hábitos del día</Typography>
                  <Stack spacing={1.25} sx={{ mt: 2 }}>
                    {dashboard.activeHabits.map((habit) => <Stack alignItems="center" direction="row" justifyContent="space-between" key={habit.id || habit._id}><Typography>{habit.nombre}</Typography><Chip label={habit.frecuencia || 'Activo'} size="small" variant="outlined" /></Stack>)}
                  </Stack>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography component="h2" variant="h6">Progreso semanal</Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'end', height: 160, mt: 2 }}>
                    {dashboard.weekProgress.map((day) => <Stack alignItems="center" key={day.label} spacing={0.75} sx={{ flex: 1, height: '100%', justifyContent: 'end' }}><Box sx={{ bgcolor: 'primary.main', borderRadius: 1, height: `${Math.max(day.percentage, 4)}%`, width: '100%' }} /><Typography color="text.secondary" sx={{ textTransform: 'capitalize' }} variant="caption">{day.label}</Typography></Stack>)}
                  </Stack>
                  <LinearProgress sx={{ mt: 2 }} value={dashboard.completion} variant="determinate" />
                </CardContent>
              </Card>
            </Stack>
          )}
        </>
      )}
    </Stack>
  )
}
