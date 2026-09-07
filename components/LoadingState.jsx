import { CircularProgress, Stack, Typography } from '@mui/material'

export default function LoadingState({ message = 'Cargando...' }) {
  return (
    <Stack spacing={2} sx={{ py: 8, alignItems: 'center' }}>
      <CircularProgress />
      <Typography color="text.secondary">{message}</Typography>
    </Stack>
  )
}
