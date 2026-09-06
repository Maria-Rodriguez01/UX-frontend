import { clearSession, getToken } from './session'

const API_URL = process.env.NEXT_PUBLIC_API_URL

function redirectToLogin() {
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    clearSession()
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign('/login')
  }
}

export async function apiRequest(path, options = {}) {
  const token = getToken()

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (response.status === 401 && token) {
    redirectToLogin()
    throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const message = Array.isArray(body?.message) ? body.message.join(' ') : body?.message
    throw new Error(message || 'No se pudo completar la solicitud.')
  }

  if (response.status === 204) return null

  return response.json()
}