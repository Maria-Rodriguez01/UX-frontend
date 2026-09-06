const TOKEN_KEY = 'habit-tracker.token'
const USER_KEY = 'habit-tracker.user'

function isBrowser() {
  return typeof window !== 'undefined'
}

export function getToken() {
  if (!isBrowser()) return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function getSessionUser() {
  if (!isBrowser()) return null
  const raw = window.localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    const user = JSON.parse(raw)
    return user?.id ? user : null
  } catch {
    return null
  }
}

export function saveSession(token, user) {
  if (!isBrowser()) return
  if (token) window.localStorage.setItem(TOKEN_KEY, token)
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  if (!isBrowser()) return
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}