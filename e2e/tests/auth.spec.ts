import { test, expect } from '@playwright/test';

const TEST_EMAIL = `e2e+${Date.now()}@example.com`;
const TEST_PASSWORD = 'Test1234!';
const TEST_NAME = 'E2E Test User';

test.describe('Authentication', () => {
  test('register new account', async ({ page }) => {
    await page.goto('/auth/register');

    await page.getByLabel(/họ và tên|full name/i).fill(TEST_NAME);
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/^mật khẩu|^password/i).fill(TEST_PASSWORD);
    await page.getByLabel(/xác nhận mật khẩu|confirm password/i).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /đăng ký|register|sign up/i }).click();

    // Should redirect to homepage or show success
    await expect(page).not.toHaveURL(/register/);
  });

  test('login with valid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/mật khẩu|password/i).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /đăng nhập|login|sign in/i }).click();

    // Logged in — should not be on login page
    await expect(page).not.toHaveURL(/login/);
  });

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/auth/login');

    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/mật khẩu|password/i).fill('WrongPassword!');
    await page.getByRole('button', { name: /đăng nhập|login|sign in/i }).click();

    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('login page shows validation for empty fields', async ({ page }) => {
    await page.goto('/auth/login');

    await page.getByRole('button', { name: /đăng nhập|login|sign in/i }).click();

    // HTML5 validation or custom error
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeFocused();
  });
});
