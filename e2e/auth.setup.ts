import { test as setup, expect } from '@playwright/test';

setup('authenticate as admin', async ({ page }) => {
  const adminEmail = 'admin@test.com';
  const adminPassword = 'admin123';

  await page.goto('/auth/login');
  
  await page.fill('input[name="email"]', adminEmail);
  await page.fill('input[name="password"]', adminPassword);
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
  
  await page.context().storageState({ path: 'e2e/.auth/admin.json' });
});

setup('authenticate as manager', async ({ page }) => {
  const managerEmail = 'manager@test.com';
  const managerPassword = 'manager123';

  await page.goto('/auth/login');
  
  await page.fill('input[name="email"]', managerEmail);
  await page.fill('input[name="password"]', managerPassword);
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
  
  await page.context().storageState({ path: 'e2e/.auth/manager.json' });
});

setup('authenticate as user', async ({ page }) => {
  const userEmail = 'user@test.com';
  const userPassword = 'user123';

  await page.goto('/auth/login');
  
  await page.fill('input[name="email"]', userEmail);
  await page.fill('input[name="password"]', userPassword);
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
  
  await page.context().storageState({ path: 'e2e/.auth/user.json' });
});
