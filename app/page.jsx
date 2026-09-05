import { Box, Button, Stack, Typography } from "@mui/material";

export default function Home() {
  return (
    <Box
      component="main"
      sx={{
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        p: 3,
      }}
    >
      <Stack alignItems="center" spacing={2} textAlign="center">
        <Typography component="h1" variant="h3">
          Habit Tracker
        </Typography>
        <Button href="/login" variant="contained">
          Iniciar sesión
        </Button>
      </Stack>
    </Box>
  );
}
