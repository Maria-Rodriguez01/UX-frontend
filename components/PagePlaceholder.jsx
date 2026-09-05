import { Box, Typography } from '@mui/material'

export default function PagePlaceholder({ title }) {
  return (
    <Box
      component="section"
      sx={{
        display: 'grid',
        minHeight: 'calc(100vh - 128px)',
        placeContent: 'center',
        textAlign: 'center',
      }}
    >
      <Typography component="h1" variant="h3">
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        Esta sección estará disponible próximamente.
      </Typography>
    </Box>
  )
}
