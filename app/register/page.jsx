'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PersonAddAltRounded } from '@mui/icons-material'
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { register } from '../../services/auth'
import FeedbackSnackbar from '../../components/FeedbackSnackbar'
import { getFieldErrors, registerSchema } from '../../utils/validation'

export default function RegisterPage() {
  const router = useRouter()
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((currentValues) => ({ ...currentValues, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const parsedValues = registerSchema.safeParse(values)

    if (!parsedValues.success) {
      setErrors(getFieldErrors(parsedValues.error))
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      await register({
        nombre: parsedValues.data.name,
        correo: parsedValues.data.email,
        contraseña: parsedValues.data.password,
      })
      setFeedback({
        severity: 'success',
        message: 'Tu cuenta fue creada correctamente. Ahora puedes iniciar sesión.',
      })
      window.setTimeout(() => router.replace('/login'), 800)
    } catch (error) {
      setFeedback({
        severity: 'error',
        message: error.message || 'No pudimos crear tu cuenta. Intenta nuevamente.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box component="main" sx={{ alignItems: 'center', display: 'flex', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="xs">
        <Paper component="section" sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack alignItems="center" spacing={1} sx={{ mb: 4 }}>
            <PersonAddAltRounded color="primary" sx={{ fontSize: 42 }} />
            <Typography component="h1" variant="h4">Crea tu cuenta</Typography>
            <Typography align="center" color="text.secondary">Empieza a construir hábitos que perduren.</Typography>
          </Stack>

          <Box component="form" noValidate onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField autoComplete="name" error={Boolean(errors.name)} helperText={errors.name} label="Nombre" name="name" onChange={handleChange} value={values.name} />
              <TextField autoComplete="email" error={Boolean(errors.email)} helperText={errors.email} label="Correo electrónico" name="email" onChange={handleChange} type="email" value={values.email} />
              <TextField autoComplete="new-password" error={Boolean(errors.password)} helperText={errors.password} label="Contraseña" name="password" onChange={handleChange} type="password" value={values.password} />
              <TextField autoComplete="new-password" error={Boolean(errors.confirmPassword)} helperText={errors.confirmPassword} label="Confirmar contraseña" name="confirmPassword" onChange={handleChange} type="password" value={values.confirmPassword} />
              <Button disabled={isSubmitting} size="large" type="submit" variant="contained">
                {isSubmitting ? <CircularProgress color="inherit" size={22} /> : 'Crear cuenta'}
              </Button>
              <Button disabled={isSubmitting} onClick={() => router.push('/login')} variant="text">Cancelar</Button>
            </Stack>
          </Box>

          <Typography align="center" color="text.secondary" sx={{ mt: 3 }} variant="body2">
            ¿Ya tienes una cuenta? <Link href="/login">Inicia sesión</Link>
          </Typography>
        </Paper>
      </Container>

      <FeedbackSnackbar feedback={feedback} onClose={() => setFeedback(null)} />
    </Box>
  )
}
