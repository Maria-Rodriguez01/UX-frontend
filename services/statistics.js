import { apiRequest } from './api'

export function getStatistics() {
  return apiRequest('/statistics')
}
