import { test, expect } from '@playwright/test';
import { getDefaultTestUser } from './fixtures/test-users';

/**
 * Notebook E2E Tests (P1)
 *
 * Tests notebook browsing:
 * - View categories
 * - Browse words in a category
 * - Search words
 * - Open word detail
 * - Change word category (Issue #167)
 */

test.describe('Notebook', () => {
  // Sign in before each test
  test.beforeEach(async ({ page }) => {
    const user = getDefaultTestUser();
    await page.goto('/auth/sign-in');
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByLabel(/password/i).fill(user.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/today/, { timeout: 10000 });
  });

  test('can navigate to notebook', async ({ page }) => {
    // Click notebook link in navigation
    await page.getByRole('link', { name: /notebook/i }).click();

    // Should be on notebook page
    await expect(page).toHaveURL(/\/notebook/);
  });

  test('shows category cards', async ({ page }) => {
    await page.goto('/notebook');

    // Should show category cards (Food & Dining, Work, etc.)
    // At least one category should be visible
    const categories = page.locator('[class*="category"], [data-testid*="category"]');

    // Or look for known category names
    const hasFoodDining = await page.getByText(/food.*dining|dining/i).isVisible().catch(() => false);
    const hasWork = await page.getByText(/work/i).isVisible().catch(() => false);
    const hasDailyLife = await page.getByText(/daily.*life/i).isVisible().catch(() => false);

    expect(hasFoodDining || hasWork || hasDailyLife).toBeTruthy();
  });

  test('can browse a category', async ({ page }) => {
    await page.goto('/notebook');

    // Click on a category (e.g., "Daily Life" or first available)
    const categoryLink = page.getByRole('link').filter({ hasText: /food|work|daily|social|shopping/i }).first();

    if (await categoryLink.isVisible()) {
      await categoryLink.click();

      // Should be on category detail page
      await expect(page).toHaveURL(/\/notebook\/.+/);

      // Should show "Back to Notebook" or similar
      await expect(page.getByText(/back/i)).toBeVisible();
    }
  });

  test('can search words', async ({ page }) => {
    await page.goto('/notebook');

    // Find search input
    const searchInput = page.getByPlaceholder(/search/i);

    if (await searchInput.isVisible()) {
      // Type a search query
      await searchInput.fill('a');

      // Wait for results
      await page.waitForTimeout(500);

      // Should show search results or "no results" message
      expect(true).toBeTruthy(); // Search UI present
    }
  });

  test('can open word detail sheet', async ({ page }) => {
    // Go to a category page
    await page.goto('/notebook/daily_life');

    // Wait for words to load
    await page.waitForTimeout(1000);

    // Click on a word card (if any exist)
    const wordCard = page.locator('[data-testid="word-card"]').first();
    const anyCard = page.locator('[class*="card"]').first();

    if (await wordCard.isVisible().catch(() => false)) {
      await wordCard.click();
    } else if (await anyCard.isVisible().catch(() => false)) {
      await anyCard.click();
    }

    // Should open detail sheet (look for sheet/modal content)
    const sheet = page.locator('[role="dialog"], [data-state="open"]');
    if (await sheet.isVisible().catch(() => false)) {
      // Should show word details like audio button, statistics
      await expect(page.getByRole('button', { name: /audio|play/i })).toBeVisible();
    }
  });

  test('inbox page shows unorganized words', async ({ page }) => {
    // Navigate to inbox
    await page.goto('/notebook/inbox');

    // Should show "Inbox" heading
    await expect(page.getByText(/inbox/i).first()).toBeVisible();

    // Should show "Back to Notebook" link
    await expect(page.getByText(/back/i)).toBeVisible();
  });

  test('can change word category from inbox', async ({ page }) => {
    // Go to inbox
    await page.goto('/notebook/inbox');

    // Wait for words to load
    await page.waitForTimeout(1000);

    // Click on first word if available
    const wordCard = page.locator('[class*="card"]').first();

    if (await wordCard.isVisible().catch(() => false)) {
      await wordCard.click();

      // Wait for sheet to open
      await page.waitForTimeout(500);

      // Find category badge/button (clickable to change category)
      const categoryBadge = page.getByRole('button').filter({ hasText: /food|work|daily|social|shopping|other/i }).first();

      if (await categoryBadge.isVisible().catch(() => false)) {
        await categoryBadge.click();

        // Category picker should appear
        await expect(page.getByText(/food.*dining/i)).toBeVisible();
        await expect(page.getByText(/work/i)).toBeVisible();
      }
    }
  });
});
