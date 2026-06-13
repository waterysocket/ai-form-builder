import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
})
