export const FRECUENCIA_OPCIONES = [
  { value: 'daily', label: 'Diaria' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'custom', label: 'Personalizada' },
]

export function frecuenciaLabel(frecuencia) {
  return FRECUENCIA_OPCIONES.find((o) => o.value === frecuencia)?.label || 'Personalizada'
}

export function todayKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function pct(value, total) {
  if (!total) return 0
  return Math.round((value / total) * 100)
}

export function fechaLegible(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}