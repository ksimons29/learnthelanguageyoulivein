import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 *
 * Runs against production (https://llyli.vercel.app) by default.
 * Uses test accounts defined in fixtures/test-users.ts.
 *
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',

  use: {
    // Base URL for navigation - production by default
    baseURL: process.env.E2E_BASE_URL || 'https://llyli.vercel.app',

    // Collect trace on first retry
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',
  },

  projects: [
    // Desktop Chrome
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Mobile Safari - primary mobile target
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },

    // Mobile Chrome - secondary mobile
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Global timeout
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
});
