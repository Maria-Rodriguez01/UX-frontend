'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowBackRounded } from '@mui/icons-material'
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import FeedbackSnackbar from '../../../../components/FeedbackSnackbar'
import HabitForm, { emptyHabitValues } from '../../../../components/HabitForm'
import { createHabit } from '../../../../services/habits'

export default function CreateHabitPage() {
  const router = useRouter()
  const [feedback, setFeedback] = useState(null)

  async function handleCreate(values) {
    try {
      await createHabit(values)
      setFeedback({ severity: 'success', message: 'Hábito creado correctamente.' })
      window.setTimeout(() => router.push('/habits'), 700)
    } catch (error) {
      setFeedback({ severity: 'error', message: error.message || 'No pudimos crear el hábito. Intenta nuevamente.' })
    }
  }

  return (
    <Stack component="section" spacing={3} sx={{ maxWidth: 760 }}>
      <Box>
        <Button component={Link} href="/habits" startIcon={<ArrowBackRounded />} variant="text">Volver a mis hábitos</Button>
        <Typography component="h1" sx={{ mt: 1 }} variant="h4">Crear hábito</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>Define los detalles para comenzar a darle seguimiento.</Typography>
      </Box>
      <Card><CardContent sx={{ p: { xs: 2, sm: 3 } }}><HabitForm cancelHref="/habits" initialValues={emptyHabitValues} onSubmit={handleCreate} submitLabel="Guardar hábito" /></CardContent></Card>
      <FeedbackSnackbar feedback={feedback} onClose={() => setFeedback(null)} />
    </Stack>
  )
}
