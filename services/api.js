const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function apiRequest(path, options = {}) {
  const token =
    typeof window !== 'undefined' ? window.localStorage.getItem('habit-tracker.token') : null

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const message = Array.isArray(body?.message) ? body.message.join(' ') : body?.message
    throw new Error(message || 'No se pudo completar la solicitud.')
  }

  if (response.status === 204) return null

  return response.json()
}
