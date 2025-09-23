import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add this 'server' section
  server: {
    port: 5000,
    strictPort: true
  }
})