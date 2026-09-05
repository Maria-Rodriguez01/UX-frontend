import { apiRequest } from './api'

export function login(credentials) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export function register(user) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(user),
  })
}
