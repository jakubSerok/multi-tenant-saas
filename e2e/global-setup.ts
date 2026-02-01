import { chromium, FullConfig } from '@playwright/test';
import { setupTestData } from './utils/test-helpers';

async function globalSetup(config: FullConfig) {
  console.log('Setting up test data...');
  await setupTestData();
  console.log('Test data setup complete');
}

export default globalSetup;
