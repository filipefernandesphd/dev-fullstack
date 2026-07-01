import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,         // Necessário para o container Docker aceitar conexões externas
    port: Number(process.env.FRONTEND_PORT) || 5173,
    allowedHosts: true, // Permite qualquer host em desenvolvimento (Docker)
  },
})
