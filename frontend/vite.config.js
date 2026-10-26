import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Todo lo que empiece con /api se reenvía al backend de Express.
    // Así el navegador ve un solo origen y la cookie del JWT viaja sin problemas.
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
