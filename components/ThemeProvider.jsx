'use client'

import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material'
import theme from '../theme/theme'

export default function ThemeProvider({ children }) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}
