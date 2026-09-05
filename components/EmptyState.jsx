import { Card, CardContent, Stack, Typography } from '@mui/material'

export default function EmptyState({ action, description, title }) {
  return (
    <Card>
      <CardContent>
        <Stack alignItems="center" spacing={1} sx={{ py: 4, textAlign: 'center' }}>
          <Typography component="h2" variant="h6">{title}</Typography>
          {description && <Typography color="text.secondary">{description}</Typography>}
          {action}
        </Stack>
      </CardContent>
    </Card>
  )
}
