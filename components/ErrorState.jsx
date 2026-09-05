import { Alert, Button } from '@mui/material'

export default function ErrorState({ message, onRetry }) {
  return (
    <Alert
      action={onRetry && <Button color="inherit" onClick={onRetry} size="small">Reintentar</Button>}
      severity="error"
    >
      {message}
    </Alert>
  )
}
