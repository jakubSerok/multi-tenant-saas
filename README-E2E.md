# End-to-End Testing Guide

This document explains how to run and maintain the E2E tests for the multi-tenant SaaS application.

## Setup

### Prerequisites
- Node.js installed
- PostgreSQL database running
- Playwright browsers installed

### Initial Setup
```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run test:e2e:install

# Set up test database
npx prisma migrate dev
npx prisma db seed
```

## Running Tests

### Basic Commands
```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI (interactive mode)
npm run test:e2e:ui

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### Running Specific Tests
```bash
# Run only authentication tests
npx playwright test auth.spec.ts

# Run only ticket management tests
npx playwright test tickets.spec.ts

# Run only multi-tenant tests
npx playwright test multi-tenant.spec.ts

# Run tests with specific pattern
npx playwright test --grep "should login"
```

## Test Structure

### Test Files
- `e2e/auth.spec.ts` - Authentication and registration tests
- `e2e/tickets.spec.ts` - Ticket management functionality tests
- `e2e/multi-tenant.spec.ts` - Multi-tenant isolation and security tests

### Test Data Setup
- `e2e/global-setup.ts` - Global test setup that creates test data
- `e2e/utils/test-helpers.ts` - Helper functions for creating test data
- `e2e/auth.setup.ts` - Authentication setup for different user roles

### Test Users
The tests use these predefined users:
- **Admin**: admin@test.com / admin123
- **Manager**: manager@test.com / manager123  
- **User**: user@test.com / user123

## Test Coverage

### Authentication Tests
- Login form validation
- Successful login/logout
- Registration flow
- Protected route redirection
- Invalid credentials handling

### Ticket Management Tests
- Create, read, update tickets
- Ticket status management
- User assignment
- Comment functionality
- Filtering and searching
- Role-based permissions

### Multi-tenant Tests
- Data isolation between organizations
- Cross-organization access prevention
- Role-based permissions within organizations
- Invitation system testing

## Best Practices

### Writing New Tests
1. Use descriptive test names that explain what is being tested
2. Use data-testid attributes for element selection
3. Include proper assertions for both positive and negative cases
4. Clean up test data after tests run
5. Use the existing helper functions for common operations

### Test Data Management
- Tests use a dedicated test database
- Test data is created and cleaned up automatically
- Each test runs in isolation
- Use timestamps for unique test data

### Debugging Tips
- Use `npm run test:e2e:debug` to step through tests
- Check the HTML report for screenshots and traces
- Use `page.pause()` to pause execution and inspect state
- Enable browser logging for debugging network issues

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:e2e:install
      - run: npm run test:e2e
```

## Troubleshooting

### Common Issues
1. **Tests fail with "No element found"**: Check if data-testid attributes are present in the UI
2. **Authentication fails**: Ensure test users exist in the database
3. **Database connection issues**: Verify database is running and credentials are correct
4. **Timeout errors**: Increase timeout values or check if the app is running slowly

### Environment Variables
Make sure these environment variables are set:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth secret key
- `NEXTAUTH_URL` - Application URL

## Maintenance

### Updating Tests
- Update tests when UI changes (data-testid attributes)
- Add new tests for new features
- Review and update test data helpers as needed
- Keep test documentation current

### Performance
- Run tests in parallel when possible
- Use proper wait strategies instead of fixed delays
- Optimize test data setup and cleanup
