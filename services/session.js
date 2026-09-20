const TOKEN_KEY = "habit-tracker.token";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getToken() {
  if (!isBrowser()) return null;

  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function saveSession(token) {
  if (!isBrowser()) return;

  if (token) {
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearSession() {
  if (!isBrowser()) return;

  window.sessionStorage.removeItem(TOKEN_KEY);
}
