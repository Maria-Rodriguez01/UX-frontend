"use client";

import { useState } from "react";
import { createRecord } from "../services/records";
import { todayKey } from "../utils";

const DUPLICATE_PATTERN = /ya está registrado para esta fecha/i;

export function useCompleteHabit({ onCompleted, onError }) {
  const [completingId, setCompletingId] = useState(null);

  async function complete(habit, cantidad = null) {
    const habitId = habit.id || habit._id;

    if (!habitId || habit.activo === false || completingId === habitId) {
      return;
    }

    setCompletingId(habitId);

    try {
      const payload = {
        habito: habitId,
        fecha: todayKey(),
      };

      if (habit.esCuantificable !== false) {
        const parsedCantidad = Number(cantidad);

        if (!Number.isFinite(parsedCantidad) || parsedCantidad <= 0) {
          onError("Debes proporcionar una cantidad válida para este hábito.");
          return;
        }

        payload.cantidad = parsedCantidad;

        const objetivo = Number(habit.cantidadObjetivo);

        payload.completado =
          Number.isFinite(objetivo) && objetivo > 0
            ? parsedCantidad >= objetivo
            : true;
      } else {
        payload.completado = true;
      }

      await createRecord(payload);

      onCompleted(habitId, {
        cantidad: payload.cantidad ?? null,
        completado: payload.completado,
      });
    } catch (requestError) {
      const message =
        requestError.message ||
        "No pudimos registrar el progreso. Intenta nuevamente.";

      if (DUPLICATE_PATTERN.test(message)) {
        onCompleted(habitId, { already: true });
      } else {
        onError(message);
      }
    } finally {
      setCompletingId(null);
    }
  }

  return {
    completingId,
    complete,
  };
}
