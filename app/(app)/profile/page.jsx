'use client'

import { PersonOutlineRounded } from '@mui/icons-material'
import { Avatar, Box, Card, CardContent, Stack, Typography } from '@mui/material'
import { useAuth } from '../../../hooks/useAuth'

function formatDay(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <Stack component="section" spacing={3} sx={{ maxWidth: 760, mx: 'auto' }}>
      <Box>
        <Typography component="h1" variant="h4">Configuración</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>Tu información de cuenta.</Typography>
      </Box>

      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                height: 56,
                width: 56,
              }}
            >
              <PersonOutlineRounded />
            </Avatar>
            <Box>
              <Typography component="h2" variant="h6">{user.nombre}</Typography>
              <Typography color="text.secondary">{user.correo}</Typography>
              <Typography color="text.secondary" variant="caption">Miembro desde el {formatDay(user.fechaRegistro)}</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}