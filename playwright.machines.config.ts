import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/machines',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  outputDir: '../artifacts/test-results',
  use: {
    baseURL: process.env.MACHINES_TEST_URL || 'http://127.0.0.1:3200',
    viewport: { width: 1440, height: 1050 },
    browserName: 'chromium',
    headless: true,
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH },
    screenshot: 'only-on-failure',
  },
})
