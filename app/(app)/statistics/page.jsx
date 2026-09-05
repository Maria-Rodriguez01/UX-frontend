'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { BarChartRounded, CheckCircleRounded, EventAvailableRounded, LocalFireDepartmentRounded } from '@mui/icons-material'
import { Box, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material'
import ErrorState from '../../../components/ErrorState'
import LoadingState from '../../../components/LoadingState'
import { getStatistics } from '../../../services/statistics'

function getValue(statistics, ...keys) {
  for (const key of keys) {
    if (statistics?.[key] !== undefined && statistics?.[key] !== null) return statistics[key]
  }
  return 0
}

function normalizeMonthlyProgress(value) {
  if (Array.isArray(value)) {
    return value.map((item) => ({
      label: item.mes || item.month || item.label || '',
      value: Number(item.progreso ?? item.progress ?? item.cumplimiento ?? item.value ?? 0),
    }))
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).map(([label, progress]) => ({ label, value: Number(progress) || 0 }))
  }

  return []
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
  const [statistics, setStatistics] = useState(null)
  const [error, setError] = useState(null)

  const loadStatistics = useCallback(async () => {
    setError(null)
    try {
      const response = await getStatistics()
      setStatistics(response?.statistics || response?.data || response)
    } catch (requestError) {
      setError(requestError.message || 'No pudimos cargar las estadísticas. Intenta nuevamente.')
    }
  }, [])

  useEffect(() => {
    loadStatistics()
  }, [loadStatistics])

  const metrics = useMemo(() => {
    if (!statistics) return null
    return {
      total: getValue(statistics, 'totalHabitos', 'total_habitos', 'total'),
      active: getValue(statistics, 'habitosActivos', 'habitos_activos', 'active'),
      finished: getValue(statistics, 'habitosFinalizados', 'habitos_finalizados', 'finished'),
      streak: getValue(statistics, 'diasConsecutivos', 'dias_consecutivos', 'streak'),
      compliance: getValue(statistics, 'cumplimiento', 'compliance'),
      monthly: normalizeMonthlyProgress(statistics.progresoMensual || statistics.progreso_mensual || statistics.monthlyProgress),
    }
  }, [statistics])

  return (
    <Stack component="section" spacing={3}>
      <Box>
        <Typography component="h1" variant="h4">Estadísticas</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>Consulta el progreso acumulado de tus hábitos.</Typography>
      </Box>

      {!statistics && !error && <LoadingState message="Cargando estadísticas..." />}
      {error && <ErrorState message={error} onRetry={loadStatistics} />}

      {metrics && (
        <>
          <Stack direction="row" flexWrap="wrap" gap={2}>
            <MetricCard icon={<BarChartRounded color="primary" />} label="Total de hábitos" value={metrics.total} />
            <MetricCard icon={<CheckCircleRounded color="success" />} label="Hábitos activos" value={metrics.active} />
            <MetricCard icon={<EventAvailableRounded color="secondary" />} label="Hábitos finalizados" value={metrics.finished} />
            <MetricCard icon={<LocalFireDepartmentRounded color="primary" />} label="Días consecutivos" value={metrics.streak} />
          </Stack>

          <Card>
            <CardContent>
              <Stack alignItems={{ sm: 'center' }} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                <Typography component="h2" variant="h6">Cumplimiento</Typography>
                <Typography color="text.secondary" variant="body2">{metrics.compliance}%</Typography>
              </Stack>
              <LinearProgress sx={{ mt: 2 }} value={Math.min(Number(metrics.compliance) || 0, 100)} variant="determinate" />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography component="h2" variant="h6">Progreso mensual</Typography>
              {metrics.monthly.length === 0 ? (
                <Typography color="text.secondary" sx={{ mt: 2 }}>Aún no hay datos mensuales disponibles.</Typography>
              ) : (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {metrics.monthly.map((month) => (
                    <Box key={month.label}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                        <Typography sx={{ textTransform: 'capitalize' }}>{month.label}</Typography>
                        <Typography color="text.secondary" variant="body2">{month.value}%</Typography>
                      </Stack>
                      <LinearProgress value={Math.min(Math.max(month.value, 0), 100)} variant="determinate" />
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Stack>
  )
}
