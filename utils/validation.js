import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Ingresa un correo electrónico válido.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
})

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Ingresa tu nombre.'),
    email: z.email('Ingresa un correo electrónico válido.'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña.'),
  })

export const habitSchema = z
  .object({
    nombre: z.string().trim().min(2, 'Ingresa un nombre de al menos 2 caracteres.'),
    descripcion: z.string().trim().max(500, 'La descripción no puede superar 500 caracteres.'),
    categoria: z.string().trim().min(1, 'Ingresa una categoría.'),
    frecuencia: z.string().min(1, 'Selecciona una frecuencia.'),
    prioridad: z.string().min(1, 'Selecciona una prioridad.'),
    fechaInicio: z.string().min(1, 'Selecciona una fecha de inicio.'),
    fechaFin: z.string(),
    activo: z.boolean(),
  })
  .refine(
    ({ fechaInicio, fechaFin }) => !fechaFin || fechaFin >= fechaInicio,
    { message: 'La fecha de fin debe ser posterior a la fecha de inicio.', path: ['fechaFin'] },
  )
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

export function getFieldErrors(validationError) {
  return validationError.issues.reduce((errors, issue) => {
    const field = issue.path[0]
    if (field && !errors[field]) errors[field] = issue.message
    return errors
  }, {})
}
