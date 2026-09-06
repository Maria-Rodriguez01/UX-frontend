import { apiRequest } from './api'

export function getDailyStatistics(fecha) {
  const query = fecha ? `?fecha=${fecha}` : ''
  return apiRequest(`/statistics/daily${query}`)
}

export function getWeeklyStatistics(fecha) {
  const query = fecha ? `?fecha=${fecha}` : ''
  return apiRequest(`/statistics/weekly${query}`)
}

export function getMonthlyStatistics(fecha) {
  const query = fecha ? `?fecha=${fecha}` : ''
  return apiRequest(`/statistics/monthly${query}`)
}