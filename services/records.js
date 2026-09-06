import { apiRequest } from './api'

export function createRecord(record) {
  return apiRequest('/records', {
    method: 'POST',
    body: JSON.stringify(record),
  })
}

export function getRecords(params = {}) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') query.set(key, value)
  }
  const search = query.toString()
  return apiRequest(`/records${search ? `?${search}` : ''}`)
}