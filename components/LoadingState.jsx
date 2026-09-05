import { CircularProgress, Stack, Typography } from '@mui/material'

export default function LoadingState({ message = 'Cargando...' }) {
  return (
    <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
      <CircularProgress />
      <Typography color="text.secondary">{message}</Typography>
    </Stack>
  )
}
