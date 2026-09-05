import { createTheme } from '@mui/material/styles'

const colors = {
  purple: '#8B7BB8',
  green: '#6F8F72',
  cream: '#F7F3EA',
  charcoal: '#29272D',
  lightGray: '#E8E5E0',
  white: '#FFFFFF',
}

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: {
      main: colors.purple,
      contrastText: colors.white,
    },
    secondary: {
      main: colors.green,
      contrastText: colors.white,
    },
    background: {
      default: colors.cream,
      paper: colors.white,
    },
    text: {
      primary: colors.charcoal,
      secondary: '#615E66',
    },
    divider: colors.lightGray,
    success: {
      main: colors.green,
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: 'var(--font-inter), "Segoe UI", Arial, sans-serif',
    h1: {
      fontFamily: 'var(--font-quicksand), "Trebuchet MS", sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: 'var(--font-quicksand), "Trebuchet MS", sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: 'var(--font-quicksand), "Trebuchet MS", sans-serif',
      fontWeight: 700,
    },
    h4: {
      fontFamily: 'var(--font-quicksand), "Trebuchet MS", sans-serif',
      fontWeight: 700,
    },
    h5: {
      fontFamily: 'var(--font-quicksand), "Trebuchet MS", sans-serif',
      fontWeight: 700,
    },
    h6: {
      fontFamily: 'var(--font-quicksand), "Trebuchet MS", sans-serif',
      fontWeight: 700,
    },
    button: {
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          minHeight: 44,
          paddingInline: 20,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${colors.lightGray}`,
          borderRadius: 16,
          boxShadow: 'none',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: colors.white,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        variant: 'outlined',
      },
    },
  },
})

export { colors }
export default theme
