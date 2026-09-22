import { test, expect } from '@playwright/test';

test('admin faz login e chega no painel', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel('E-mail').fill('admin-e2e@teste.com');
  await page.getByLabel('Senha').fill('senha-e2e-123');
  await page.getByRole('button', { name: /entrar/i }).click();
  await expect(page).toHaveURL('/admin');
});
