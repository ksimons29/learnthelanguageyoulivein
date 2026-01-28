import { test, expect } from '@playwright/test';
import { getDefaultTestUser } from './fixtures/test-users';

/**
 * Authentication E2E Tests (P0)
 *
 * Tests critical auth flows:
 * - Unauthenticated redirect to sign-in
 * - Sign in with valid credentials
 * - Session persistence
 * - Sign out
 */

test.describe('Authentication', () => {
  test('redirects unauthenticated users to sign-in', async ({ page }) => {
    // Try to access protected route
    await page.goto('/today');

    // Should redirect to sign-in
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('sign in with valid credentials', async ({ page }) => {
    const user = getDefaultTestUser();

    // Go to sign-in page
    await page.goto('/auth/sign-in');

    // Fill in credentials
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByLabel(/password/i).fill(user.password);

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to today page after successful sign-in
    await expect(page).toHaveURL(/\/today/, { timeout: 10000 });

    // Should show user is authenticated (today dashboard content)
    await expect(page.getByText(/today/i).first()).toBeVisible();
  });

  test('session persists after page reload', async ({ page }) => {
    const user = getDefaultTestUser();

    // Sign in first
    await page.goto('/auth/sign-in');
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByLabel(/password/i).fill(user.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/today/, { timeout: 10000 });

    // Reload page
    await page.reload();

    // Should still be on today page (session persisted)
    await expect(page).toHaveURL(/\/today/);
  });

  test('sign out clears session', async ({ page }) => {
    const user = getDefaultTestUser();

    // Sign in first
    await page.goto('/auth/sign-in');
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByLabel(/password/i).fill(user.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/today/, { timeout: 10000 });

    // Find and click sign out (usually in a menu or settings)
    // Navigate to settings/profile where sign out typically is
    await page.goto('/settings');

    // Click sign out button
    await page.getByRole('button', { name: /sign out/i }).click();

    // Should redirect to landing or sign-in page
    await expect(page).toHaveURL(/\/(auth\/sign-in)?$/);
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/sign-in');

    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show error message
    await expect(page.getByText(/invalid|incorrect|failed/i)).toBeVisible({ timeout: 5000 });

    // Should stay on sign-in page
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
