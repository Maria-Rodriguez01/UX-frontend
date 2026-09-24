import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .regex(
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/,
      "Ingrese un correo electrónico válido",
    ),
  password: z.string().min(6, "Ingresa tu contraseña."),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Ingresa tu nombre."),
    email: z
      .string()
      .trim()
      .regex(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/,
        "Ingrese un correo electrónico válido",
      ),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres."),
    confirmPassword: z.string().min(1, "Confirma tu contraseña."),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export const habitSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(2, "Ingresa un nombre de al menos 2 caracteres."),

    descripcion: z
      .string()
      .trim()
      .max(500, "La descripción no puede superar 500 caracteres."),

    categoria: z.string().trim().min(1, "Ingresa una categoría."),

    frecuencia: z.string().min(1, "Selecciona una frecuencia."),

    prioridad: z.string().min(1, "Selecciona una prioridad."),

    fechaInicio: z.string().min(1, "Selecciona una fecha de inicio."),

    fechaFin: z.string(),

    activo: z.boolean(),

    esCuantificable: z.boolean(),

    cantidadObjetivo: z.number().nullable(),

    unidadObjetivo: z.string(),
  })

  .refine(({ fechaInicio, fechaFin }) => !fechaFin || fechaFin >= fechaInicio, {
    message: "La fecha de fin debe ser posterior a la fecha de inicio.",
    path: ["fechaFin"],
  })

  .refine(
    ({ esCuantificable, cantidadObjetivo }) => {
      if (!esCuantificable) return true;

      return cantidadObjetivo !== null && cantidadObjetivo > 0;
    },
    {
      message: "Ingresa una cantidad objetivo mayor a 0.",
      path: ["cantidadObjetivo"],
    },
  )

  .refine(
    ({ esCuantificable, unidadObjetivo }) => {
      if (!esCuantificable) return true;

      return unidadObjetivo.trim().length > 0;
    },
    {
      message: "Ingresa una unidad.",
      path: ["unidadObjetivo"],
    },
  );

export function getFieldErrors(validationError) {
  return validationError.issues.reduce((errors, issue) => {
    const field = issue.path[0];

    if (field && !errors[field]) {
      errors[field] = issue.message;
    }

    return errors;
  }, {});
}
