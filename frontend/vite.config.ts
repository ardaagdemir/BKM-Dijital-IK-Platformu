import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: 'http://localhost:3000/' } },
    setupFiles: ['./src/setupTests.ts'],
    // Playwright'ın kendi *.spec.ts dosyalarını (bkz. Bölüm 12.3, test/e2e/)
    // Vitest yanlışlıkla birim/entegrasyon testi olarak ÇALIŞTIRMASIN diye.
    exclude: [...configDefaults.exclude, 'test/e2e/**'],
  },
})
