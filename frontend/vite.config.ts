import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@/components': '/src/components',
      '@/pages': '/src/pages',
      '@/services': '/src/services',
      '@/types': '/src/types',
      '@/utils': '/src/utils',
      '@/hooks': '/src/hooks',
      '@/context': '/src/context',
      '@/assets': '/src/assets',
      '@/styles': '/src/styles',
      '@/config': '/src/config',
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
}) 