import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter'
import { Inter, Quicksand } from 'next/font/google'
import './globals.css'
import ThemeProvider from '../components/ThemeProvider'

const inter = Inter({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-inter',
})

const quicksand = Quicksand({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-quicksand',
})

export const metadata = {
  title: 'Habit Tracker',
  description: 'Seguimiento de hábitos y progreso personal.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${quicksand.variable}`}>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}