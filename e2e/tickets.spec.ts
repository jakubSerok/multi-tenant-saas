import { test, expect } from '@playwright/test';

test.describe('Ticket Management', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should display tickets list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('[data-testid="tickets-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="ticket-item"]')).not.toHaveCount(0);
  });

  test('should create a new ticket', async ({ page }) => {
    await page.click('button[data-testid="create-ticket-btn"]');
    
    await expect(page).toHaveURL('/tickets/new');
    
    const timestamp = Date.now();
    await page.fill('input[name="title"]', `Test Ticket ${timestamp}`);
    await page.fill('textarea[name="description"]', 'This is a test ticket description');
    await page.selectOption('select[name="priority"]', 'HIGH');
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator(`text=Test Ticket ${timestamp}`)).toBeVisible();
  });

  test('should view ticket details', async ({ page }) => {
    await page.click('[data-testid="ticket-item"]:first-child');
    
    await expect(page.locator('h1')).toContainText('Ticket Details');
    await expect(page.locator('[data-testid="ticket-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="ticket-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="ticket-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="ticket-priority"]')).toBeVisible();
  });

  test('should edit ticket status', async ({ page }) => {
    await page.click('[data-testid="ticket-item"]:first-child');
    
    await page.click('button[data-testid="edit-status-btn"]');
    await page.selectOption('select[name="status"]', 'IN_PROGRESS');
    await page.click('button[data-testid="save-status-btn"]');
    
    await expect(page.locator('[data-testid="ticket-status"]')).toContainText('IN_PROGRESS');
  });

  test('should assign ticket to user', async ({ page }) => {
    await page.click('[data-testid="ticket-item"]:first-child');
    
    await page.click('button[data-testid="assign-ticket-btn"]');
    await page.selectOption('select[name="assignee"]', 'manager@test.com');
    await page.click('button[data-testid="save-assignment-btn"]');
    
    await expect(page.locator('[data-testid="ticket-assignees"]')).toContainText('manager@test.com');
  });

  test('should add comment to ticket', async ({ page }) => {
    await page.click('[data-testid="ticket-item"]:first-child');
    
    const commentText = `Test comment ${Date.now()}`;
    await page.fill('textarea[name="comment"]', commentText);
    await page.click('button[data-testid="add-comment-btn"]');
    
    await expect(page.locator(`text=${commentText}`)).toBeVisible();
  });

  test('should filter tickets by status', async ({ page }) => {
    await page.selectOption('select[data-testid="status-filter"]', 'OPEN');
    
    await expect(page.locator('[data-testid="ticket-item"]')).not.toHaveCount(0);
    
    await page.selectOption('select[data-testid="status-filter"]', 'CLOSED');
    
    const closedTickets = page.locator('[data-testid="ticket-item"]');
    await expect(closedTickets).toHaveCount(0);
  });

  test('should filter tickets by priority', async ({ page }) => {
    await page.selectOption('select[data-testid="priority-filter"]', 'HIGH');
    
    await expect(page.locator('[data-testid="ticket-item"]')).not.toHaveCount(0);
    
    await page.selectOption('select[data-testid="priority-filter"]', 'LOW');
    
    const lowPriorityTickets = page.locator('[data-testid="ticket-item"]');
    await expect(lowPriorityTickets).toHaveCount(0);
  });

  test('should search tickets', async ({ page }) => {
    await page.fill('input[data-testid="search-input"]', 'Login');
    
    await expect(page.locator('[data-testid="ticket-item"]')).not.toHaveCount(0);
    
    const firstTicket = page.locator('[data-testid="ticket-item"]:first-child');
    await expect(firstTicket).toContainText('Login');
  });
});

test.describe('Ticket Management - Manager Role', () => {
  test.use({ storageState: 'e2e/.auth/manager.json' });

  test('should allow manager to create and assign tickets', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.click('button[data-testid="create-ticket-btn"]');
    
    const timestamp = Date.now();
    await page.fill('input[name="title"]', `Manager Ticket ${timestamp}`);
    await page.fill('textarea[name="description"]', 'Ticket created by manager');
    await page.selectOption('select[name="priority"]', 'MEDIUM');
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator(`text=Manager Ticket ${timestamp}`)).toBeVisible();
  });
});

test.describe('Ticket Management - User Role', () => {
  test.use({ storageState: 'e2e/.auth/user.json' });

  test('should allow user to create tickets but not assign them', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.click('button[data-testid="create-ticket-btn"]');
    
    const timestamp = Date.now();
    await page.fill('input[name="title"]', `User Ticket ${timestamp}`);
    await page.fill('textarea[name="description"]', 'Ticket created by regular user');
    await page.selectOption('select[name="priority"]', 'LOW');
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator(`text=User Ticket ${timestamp}`)).toBeVisible();
    
    await page.click('[data-testid="ticket-item"]:first-child');
    
    await expect(page.locator('button[data-testid="assign-ticket-btn"]')).not.toBeVisible();
  });
});
