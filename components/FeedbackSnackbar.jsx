import { Alert, Snackbar } from '@mui/material'

export default function FeedbackSnackbar({ feedback, onClose }) {
  return (
    <Snackbar autoHideDuration={5000} onClose={onClose} open={Boolean(feedback)}>
      <Alert onClose={onClose} severity={feedback?.severity} variant="filled">
        {feedback?.message}
      </Alert>
    </Snackbar>
  )
}
