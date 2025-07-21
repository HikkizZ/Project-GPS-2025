import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {port:443, host:true},
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
      '@/components': new URL('./src/components', import.meta.url).pathname,
      '@/pages': new URL('./src/pages', import.meta.url).pathname,
      '@/services': new URL('./src/services', import.meta.url).pathname,
      '@/types': new URL('./src/types', import.meta.url).pathname,
      '@/utils': new URL('./src/utils', import.meta.url).pathname,
      '@/hooks': new URL('./src/hooks', import.meta.url).pathname,
      '@/context': new URL('./src/context', import.meta.url).pathname,
      '@/assets': new URL('./src/assets', import.meta.url).pathname,
      '@/styles': new URL('./src/styles', import.meta.url).pathname,
      '@/config': new URL('./src/config', import.meta.url).pathname,
    },
  },
  server: {
    port: 1407,
    proxy: {
      '/api': {
        target: 'http://146.83.198.35:1406', 
        changeOrigin: true,
        secure: false
      },
    },
  },
}) 