import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [],
  server: {
    port: Number(process.env.PORT) || 3333,
    host: true,
  },
})
