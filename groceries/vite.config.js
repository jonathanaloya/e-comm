import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: ['es2015', 'chrome58', 'firefox57', 'safari11', 'edge16'],
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          icons: ['react-icons']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    cssTarget: 'chrome58'
  },
  server: {
    port: 5173
  },
  esbuild: {
    target: 'es2015',
    drop: ['console', 'debugger']
  },
  css: {
    postcss: {
      plugins: [
        require('autoprefixer')
      ]
    }
  }
})