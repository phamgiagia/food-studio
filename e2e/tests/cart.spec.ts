import { test, expect } from '@playwright/test';

test.describe('Shopping Cart', () => {
  test('browse products page and see product listing', async ({ page }) => {
    await page.goto('/products');

    await expect(page.getByRole('heading', { name: /sản phẩm|products/i })).toBeVisible();
  });

  test('search for a product', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByRole('searchbox').or(
      page.getByPlaceholder(/tìm kiếm|search/i)
    );
    await searchInput.fill('mắm tôm');
    await searchInput.press('Enter');

    await expect(page).toHaveURL(/search\?q=m/);
  });

  test('add item to cart from product listing', async ({ page }) => {
    await page.goto('/products');

    // Click first product card
    const firstProduct = page.getByRole('link').filter({ has: page.locator('img') }).first();
    await firstProduct.click();

    // On product detail page — click add to cart
    const addButton = page.getByRole('button', { name: /thêm vào giỏ|add to cart/i });
    await addButton.click();

    // Cart count should be > 0
    const cartBadge = page.locator('[data-testid="cart-count"]').or(
      page.locator('.cart-count')
    );
    await expect(cartBadge).toHaveText(/[1-9]/);
  });

  test('cart page shows added items', async ({ page }) => {
    // Add item first
    await page.goto('/products');
    const firstProduct = page.getByRole('link').filter({ has: page.locator('img') }).first();
    await firstProduct.click();

    const addButton = page.getByRole('button', { name: /thêm vào giỏ|add to cart/i });
    await addButton.click();

    // Go to cart
    await page.goto('/cart');
    await expect(page.locator('[data-testid="cart-item"]').or(
      page.locator('.cart-item')
    )).toHaveCount({ minimum: 1 });
  });

  test('can remove item from cart', async ({ page }) => {
    await page.goto('/cart');

    const removeButtons = page.getByRole('button', { name: /xóa|remove/i });
    const count = await removeButtons.count();

    if (count > 0) {
      await removeButtons.first().click();
      // After removal, either fewer items or empty state
      const remaining = await page.getByRole('button', { name: /xóa|remove/i }).count();
      expect(remaining).toBeLessThan(count);
    } else {
      // Empty cart — just verify empty state message
      await expect(page.getByText(/giỏ hàng trống|cart is empty/i)).toBeVisible();
    }
  });
});
