'use client'

import { useState } from 'react'
import { createRecord } from '../services/records'
import { todayKey } from '../utils'

const DUPLICATE_PATTERN = /ya está registrado para esta fecha/

export function useCompleteHabit({ onCompleted, onError }) {
  const [completingId, setCompletingId] = useState(null)

  async function complete(habit) {
    const habitId = habit.id || habit._id
    if (!habitId || habit.activo === false || completingId === habitId) return

    setCompletingId(habitId)

    try {
      await createRecord({
        habito: habitId,
        fecha: todayKey(),
        completado: true,
      })
      onCompleted(habitId)
    } catch (requestError) {
      const message =
        requestError.message || 'No pudimos completar el hábito. Intenta nuevamente.'
      if (DUPLICATE_PATTERN.test(message)) {
        onCompleted(habitId, { already: true })
      } else {
        onError(message)
      }
    } finally {
      setCompletingId(null)
    }
  }

  return { completingId, complete }
}