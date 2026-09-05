import './globals.css'
import ThemeProvider from '../components/ThemeProvider'

export const metadata = {
  title: 'Habit Tracker',
  description: 'Seguimiento de hábitos y progreso personal.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
