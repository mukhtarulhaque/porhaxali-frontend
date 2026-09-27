import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
  server: {
    port: 5173,       // Your dev server port
    strictPort: true, // Prevents Vite from switching ports if 5173 is busy
    hmr: {
      clientPort: 5173, // Forces browser client to use the exact same port
    },
    watch: {
      usePolling: true,
    }
  }

})
