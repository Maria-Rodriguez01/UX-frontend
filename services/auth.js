import { apiRequest } from './api'

export function login({ email, password }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ correo: email, contraseña: password }),
  })
}

export function register(user) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(user),
  })
}
