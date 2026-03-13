import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  css: {
    modules: {
      // In tests (VITEST env var set), use plain local names so class assertions like
      // toHaveClass('page') work. In dev/build, scope names to avoid cross-module conflicts.
      generateScopedName: (name: string, filename: string) => {
        if (process.env.VITEST) return name
        const file = filename.split('/').pop()?.replace('.module.css', '') ?? 'unknown'
        return `${file}_${name}`
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/mocks/',
      ],
    },
  },
})
