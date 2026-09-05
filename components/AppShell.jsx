'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChartRounded,
  CheckCircleOutlineRounded,
  DashboardRounded,
  LogoutRounded,
  MenuRounded,
  PersonOutlineRounded,
  TrackChangesRounded,
} from '@mui/icons-material'
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'

const drawerWidth = 272

const navigation = [
  { href: '/dashboard', label: 'Dashboard', icon: DashboardRounded },
  { href: '/habits', label: 'Mis hábitos', icon: CheckCircleOutlineRounded },
  { href: '/statistics', label: 'Estadísticas', icon: BarChartRounded },
  { href: '/profile', label: 'Configuración', icon: PersonOutlineRounded },
]

function NavigationContent({ onNavigate }) {
  const pathname = usePathname()

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 3, py: 3 }}>
        <TrackChangesRounded color="primary" fontSize="large" />
        <Typography component="p" variant="h6">
          Habit Tracker
        </Typography>
      </Box>

      <Divider />

      <List sx={{ px: 1.5, py: 2 }}>
        {navigation.map(({ href, label, icon: Icon }) => (
          <ListItemButton
            component={Link}
            href={href}
            key={href}
            onClick={onNavigate}
            selected={pathname === href}
            sx={{ mb: 0.5 }}
          >
            <ListItemIcon>
              <Icon color={pathname === href ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ mt: 'auto', p: 1.5 }}>
        <Divider sx={{ mb: 1.5 }} />
        <ListItemButton disabled>
          <ListItemIcon>
            <LogoutRounded />
          </ListItemIcon>
          <ListItemText primary="Cerrar sesión" />
        </ListItemButton>
      </Box>
    </>
  )
}

export default function AppShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobileNavigation = () => setMobileOpen(false)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        color="inherit"
        elevation={0}
        position="fixed"
        sx={{ display: { md: 'none' }, borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar>
          <IconButton
            aria-label="Abrir navegación"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 1 }}
          >
            <MenuRounded />
          </IconButton>
          <Typography component="p" variant="h6">
            Habit Tracker
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" aria-label="Navegación principal">
        <Drawer
          open={mobileOpen}
          onClose={closeMobileNavigation}
          slotProps={{ paper: { sx: { width: drawerWidth } } }}
          sx={{ display: { xs: 'block', md: 'none' } }}
          variant="temporary"
        >
          <NavigationContent onNavigate={closeMobileNavigation} />
        </Drawer>

        <Drawer
          open
          slotProps={{ paper: { sx: { width: drawerWidth, borderRight: 1, borderColor: 'divider' } } }}
          sx={{ display: { xs: 'none', md: 'block' }, width: drawerWidth }}
          variant="permanent"
        >
          <NavigationContent />
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { md: `${drawerWidth}px` },
          minWidth: 0,
          p: { xs: 2, sm: 3, lg: 4 },
          pt: { xs: 10, md: 4 },
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
