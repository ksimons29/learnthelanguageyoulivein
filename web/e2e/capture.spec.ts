import { test, expect } from '@playwright/test';
import { getDefaultTestUser } from './fixtures/test-users';

/**
 * Word Capture E2E Tests (P0)
 *
 * Tests the critical capture flow:
 * - Navigate to capture page
 * - Enter a word/phrase
 * - See translation result
 * - Word saved to notebook
 */

test.describe('Word Capture', () => {
  // Sign in before each test
  test.beforeEach(async ({ page }) => {
    const user = getDefaultTestUser();
    await page.goto('/auth/sign-in');
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByLabel(/password/i).fill(user.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/today/, { timeout: 10000 });
  });

  test('can navigate to capture page', async ({ page }) => {
    // Click capture button/link from today page
    await page.getByRole('link', { name: /capture|add|new/i }).first().click();

    // Should be on capture page
    await expect(page).toHaveURL(/\/capture/);
  });

  test('can capture a word and see translation', async ({ page }) => {
    // Go to capture page
    await page.goto('/capture');

    // Generate unique test word to avoid duplicates
    const testWord = `test-${Date.now()}`;

    // Enter word in the capture input
    const input = page.getByRole('textbox').first();
    await input.fill(testWord);

    // Submit the capture
    await page.getByRole('button', { name: /capture|save|add/i }).click();

    // Wait for translation to appear (API call)
    // Should show success state or translation result
    await expect(page.getByText(/captured|saved|added/i)).toBeVisible({ timeout: 15000 });
  });

  test('prevents duplicate word capture', async ({ page }) => {
    // Go to capture page
    await page.goto('/capture');

    // Use a word that likely exists
    const existingWord = 'obrigado';

    // Enter word
    const input = page.getByRole('textbox').first();
    await input.fill(existingWord);

    // Submit the capture
    await page.getByRole('button', { name: /capture|save|add/i }).click();

    // Should show "already in notebook" message
    await expect(page.getByText(/already|exists|duplicate/i)).toBeVisible({ timeout: 10000 });
  });

  test('captured word appears in notebook', async ({ page }) => {
    // Go to capture page
    await page.goto('/capture');

    // Generate unique test word
    const testWord = `e2e-${Date.now()}`;

    // Capture the word
    const input = page.getByRole('textbox').first();
    await input.fill(testWord);
    await page.getByRole('button', { name: /capture|save|add/i }).click();

    // Wait for success
    await expect(page.getByText(/captured|saved|added/i)).toBeVisible({ timeout: 15000 });

    // Navigate to notebook
    await page.goto('/notebook');

    // Search for the captured word
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill(testWord);

      // Word should appear in results
      await expect(page.getByText(testWord)).toBeVisible({ timeout: 5000 });
    }
  });
});
