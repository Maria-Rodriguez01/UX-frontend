"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChartRounded,
  CheckCircleOutlineRounded,
  DashboardRounded,
  LogoutRounded,
  MenuRounded,
  PersonOutlineRounded,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { useAuth } from "../hooks/useAuth";

const drawerWidth = 272;

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardRounded },
  { href: "/habits", label: "Mis hábitos", icon: CheckCircleOutlineRounded },
  { href: "/statistics", label: "Estadísticas", icon: BarChartRounded },
  { href: "/profile", label: "Configuración", icon: PersonOutlineRounded },
];

function NavigationContent({ onLogout, onNavigate }) {
  const pathname = usePathname();

  return (
    <>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 3, py: 3 }}
      >
        <Box
          component="img"
          src="/images/habittracker-logo.png"
          alt="Habit Tracker"
          sx={{
            width: 36,
            height: 36,
            objectFit: "contain",
          }}
        />

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
              <Icon color={pathname === href ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ mt: "auto", p: 1.5 }}>
        <Divider sx={{ mb: 1.5 }} />
        <ListItemButton onClick={onLogout}>
          <ListItemIcon>
            <LogoutRounded />
          </ListItemIcon>
          <ListItemText primary="Cerrar sesión" />
        </ListItemButton>
      </Box>
    </>
  );
}

export default function AppShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { status, logout } = useAuth();

  if (status === "loading") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress aria-label="Cargando" />
      </Box>
    );
  }

  if (status === "unauthenticated") return null;

  const closeMobileNavigation = () => setMobileOpen(false);
  const handleLogout = () => logout();

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <AppBar
        color="inherit"
        elevation={0}
        position="fixed"
        sx={{
          display: { md: "none" },
          borderBottom: 1,
          borderColor: "divider",
        }}
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
          sx={{ display: { xs: "block", md: "none" } }}
          variant="temporary"
        >
          <NavigationContent onLogout={handleLogout} onNavigate={closeMobileNavigation} />
        </Drawer>

        <Drawer
          open
          slotProps={{
            paper: {
              sx: {
                width: drawerWidth,
                borderRight: 1,
                borderColor: "divider",
              },
            },
          }}
          sx={{ display: { xs: "none", md: "block" }, width: drawerWidth }}
          variant="permanent"
        >
          <NavigationContent onLogout={handleLogout} />
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: { xs: 2, sm: 3, lg: 4 },
          pt: { xs: 10, md: 4 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
