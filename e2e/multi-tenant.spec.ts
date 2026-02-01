import { test, expect, Browser } from '@playwright/test';

test.describe('Multi-tenant Functionality', () => {
  test('should isolate data between organizations', async ({ page, browser }) => {
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    
    await adminPage.goto('/auth/login');
    await adminPage.fill('input[name="email"]', 'admin@test.com');
    await adminPage.fill('input[name="password"]', 'admin123');
    await adminPage.click('button[type="submit"]');
    
    await expect(adminPage).toHaveURL('/dashboard');
    await adminPage.click('button[data-testid="create-ticket-btn"]');
    
    const timestamp = Date.now();
    await adminPage.fill('input[name="title"]', `Org1 Ticket ${timestamp}`);
    await adminPage.fill('textarea[name="description"]', 'Ticket for organization 1');
    await adminPage.click('button[type="submit"]');
    
    await expect(adminPage.locator(`text=Org1 Ticket ${timestamp}`)).toBeVisible();
    
    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    
    await userPage.goto('/auth/login');
    await userPage.fill('input[name="email"]', 'user@test.com');
    await userPage.fill('input[name="password"]', 'user123');
    await userPage.click('button[type="submit"]');
    
    await expect(userPage).toHaveURL('/dashboard');
    
    await expect(userPage.locator(`text=Org1 Ticket ${timestamp}`)).not.toBeVisible();
    
    await adminContext.close();
    await userContext.close();
  });

  test('should prevent cross-organization access', async ({ page, browser }) => {
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    
    await adminPage.goto('/auth/login');
    await adminPage.fill('input[name="email"]', 'admin@test.com');
    await adminPage.fill('input[name="password"]', 'admin123');
    await adminPage.click('button[type="submit"]');
    
    const ticketUrl = await adminPage.locator('[data-testid="ticket-item"]:first-child').getAttribute('href');
    if (ticketUrl) {
      await adminPage.goto(ticketUrl);
    } else {
      throw new Error('No ticket found');
    }
    
    await expect(adminPage.locator('h1')).toContainText('Ticket Details');
    
    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    
    await userPage.goto('/auth/login');
    await userPage.fill('input[name="email"]', 'user@test.com');
    await userPage.fill('input[name="password"]', 'user123');
    await userPage.click('button[type="submit"]');
    
    if (ticketUrl) {
      await userPage.goto(ticketUrl);
    } else {
      throw new Error('No ticket URL found');
    }
    
    await expect(userPage.locator('text=Ticket not found')).toBeVisible();
    await expect(userPage).toHaveURL('/dashboard');
    
    await adminContext.close();
    await userContext.close();
  });

  test('should enforce role-based permissions within organization', async ({ page, browser }) => {
    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    
    await userPage.goto('/auth/login');
    await userPage.fill('input[name="email"]', 'user@test.com');
    await userPage.fill('input[name="password"]', 'user123');
    await userPage.click('button[type="submit"]');
    
    await expect(userPage).toHaveURL('/dashboard');
    
    await userPage.click('[data-testid="ticket-item"]:first-child');
    
    await expect(userPage.locator('button[data-testid="delete-ticket-btn"]')).not.toBeVisible();
    await expect(userPage.locator('button[data-testid="assign-ticket-btn"]')).not.toBeVisible();
    
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    
    await adminPage.goto('/auth/login');
    await adminPage.fill('input[name="email"]', 'admin@test.com');
    await adminPage.fill('input[name="password"]', 'admin123');
    await adminPage.click('button[type="submit"]');
    
    await adminPage.click('[data-testid="ticket-item"]:first-child');
    
    await expect(adminPage.locator('button[data-testid="delete-ticket-btn"]')).toBeVisible();
    await expect(adminPage.locator('button[data-testid="assign-ticket-btn"]')).toBeVisible();
    
    await adminContext.close();
    await userContext.close();
  });

  test('should handle invitations correctly', async ({ page, browser }) => {
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    
    await adminPage.goto('/auth/login');
    await adminPage.fill('input[name="email"]', 'admin@test.com');
    await adminPage.fill('input[name="password"]', 'admin123');
    await adminPage.click('button[type="submit"]');
    
    await adminPage.goto('/dashboard/team');
    
    const timestamp = Date.now();
    const inviteEmail = `invite${timestamp}@test.com`;
    
    await adminPage.click('button[data-testid="invite-user-btn"]');
    await adminPage.fill('input[name="email"]', inviteEmail);
    await adminPage.selectOption('select[name="role"]', 'MANAGER');
    await adminPage.click('button[data-testid="send-invitation-btn"]');
    
    await expect(adminPage.locator(`text=${inviteEmail}`)).toBeVisible();
    
    const inviteContext = await browser.newContext();
    const invitePage = await inviteContext.newPage();
    
    await invitePage.goto('/auth/login');
    await invitePage.fill('input[name="email"]', inviteEmail);
    await invitePage.fill('input[name="password"]', 'temp123');
    await invitePage.click('button[type="submit"]');
    
    await expect(invitePage.locator('text=Invalid credentials')).toBeVisible();
    
    await adminContext.close();
    await inviteContext.close();
  });
});
