export const FRECUENCIA_OPCIONES = [
  { value: 'daily', label: 'Diaria' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'custom', label: 'Personalizada' },
]

export function frecuenciaLabel(frecuencia) {
  return FRECUENCIA_OPCIONES.find((o) => o.value === frecuencia)?.label || 'Personalizada'
}

export function fechaLegible(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}