import { apiRequest } from './api'

export function getHabits() {
  return apiRequest('/habits')
}

export function createHabit(habit) {
  return apiRequest('/habits', {
    method: 'POST',
    body: JSON.stringify(habit),
  })
}

export function getHabit(id) {
  return apiRequest(`/habits/${id}`)
}

export function updateHabit(id, habit) {
  return apiRequest(`/habits/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(habit),
  })
}

export function deleteHabit(id) {
  return apiRequest(`/habits/${id}`, {
    method: 'DELETE',
  })
}
