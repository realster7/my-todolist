/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/app/test-setup.ts'],
    coverage: {
      provider: 'v8',
      exclude: [
        'coverage/**',
        'dist/**',
        '**/node_modules/**',
        '**/*.config.*',
        'src/app/main.tsx',
      ],
    },
  },
})
