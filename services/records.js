import { apiRequest } from './api'

export function createRecord(record) {
  return apiRequest('/records', {
    method: 'POST',
    body: JSON.stringify(record),
  })
}

export function getRecords() {
  return apiRequest('/records')
}
