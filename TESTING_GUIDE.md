# Testing Guide - ListingBoost Pro

Comprehensive testing documentation for the ListingBoost Pro SaaS application.

## 🧪 Testing Framework Overview

### Technologies Used

- **Jest** - JavaScript testing framework with built-in mocking, assertions, and coverage
- **React Testing Library** - Simple and complete testing utilities for React components
- **@testing-library/user-event** - User interaction simulation for components
- **@testing-library/jest-dom** - Custom Jest matchers for DOM testing

### Test Types Implemented

1. **Unit Tests** - Individual functions and components
2. **Integration Tests** - API endpoints and service integrations
3. **Component Tests** - React component behavior and rendering
4. **Authentication Tests** - Complete auth flow testing
5. **Scoring System Tests** - 1000-point algorithm validation

## 📁 Project Structure

```
__tests__/
├── auth/                    # Authentication system tests
│   └── client.test.ts
├── api/                     # API endpoint tests
│   └── analyze.test.ts
├── components/              # React component tests
│   └── button.test.tsx
├── lib/                     # Library and utility tests
│   └── scoring.test.ts
└── integration/             # Integration tests
    └── apify.test.ts

__mocks__/                   # Mock files for external dependencies
├── lib/
│   ├── supabase.ts
│   ├── config.ts
│   └── utils/
       └── logger.ts

jest.config.js               # Jest configuration
jest.setup.js                # Test setup and global mocks
```

## ⚙️ Configuration Files

### Jest Configuration (`jest.config.js`)

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // ... other path mappings
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

### Test Setup (`jest.setup.js`)

- Global mocks for browser APIs (matchMedia, ResizeObserver, IntersectionObserver)
- Next.js navigation mocking
- Environment variables for testing
- DOM testing utilities setup

## 🧪 Test Categories

### 1. Authentication Tests (`__tests__/auth/client.test.ts`)

**Coverage**: 95% of auth client functions

**Test Scenarios**:
- ✅ User sign up with validation
- ✅ Sign in with credentials
- ✅ Sign out functionality
- ✅ Password reset flow
- ✅ Google OAuth integration
- ✅ Profile management
- ✅ Session handling
- ✅ Error message localization (German)

**Key Features Tested**:
- Input validation
- Error handling with German messages
- Success/failure states
- Authentication state management
- OAuth redirects

### 2. API Endpoint Tests (`__tests__/api/analyze.test.ts`)

**Coverage**: Complete `/api/analyze` endpoint

**Test Scenarios**:
- ✅ Input validation (URL format, required fields)
- ✅ Quick vs comprehensive analysis modes
- ✅ AI integration toggle
- ✅ Error handling (rate limits, scraping errors)
- ✅ Timeout handling (90-second API limit)
- ✅ Response format validation
- ✅ German error messages

**Performance Tests**:
- API timeout after 90 seconds
- Rate limiting simulation
- Error recovery mechanisms

### 3. Scoring System Tests (`__tests__/lib/scoring.test.ts`)

**Coverage**: Complete 1000-point scoring algorithm

**Test Scenarios**:
- ✅ Perfect score calculation (1000 points)
- ✅ All performance level classifications
- ✅ 10 category score integration
- ✅ Data completeness calculation
- ✅ German recommendation generation
- ✅ Edge cases (zero scores, maximum scores)
- ✅ Error handling with logging

**Performance Levels Tested**:
- Elite Performer (900+)
- High Performer (800-899)
- Good Performer (700-799)
- Average Performer (600-699)
- Below Average (500-599)
- Poor Performer (<500)

### 4. Component Tests (`__tests__/components/button.test.tsx`)

**Coverage**: UI component functionality and accessibility

**Test Scenarios**:
- ✅ Basic rendering and text content
- ✅ Click event handling
- ✅ Disabled state behavior
- ✅ Variant styles (default, secondary, outline, ghost)
- ✅ Size variations (default, sm, lg)
- ✅ Custom className merging
- ✅ Accessibility features (focus, ARIA attributes)
- ✅ Edge cases and prop handling

### 5. Integration Tests (`__tests__/integration/apify.test.ts`)

**Coverage**: Apify scraper service integration

**Test Scenarios**:
- ✅ Rate limiting per actor (different limits)
- ✅ API authentication
- ✅ Error handling and retries
- ✅ Data transformation
- ✅ Concurrent request handling
- ✅ Timeout management
- ✅ Mock vs real API switching

**Scrapers Tested**:
- URL Scraper (50 req/hour)
- Review Scraper (100 req/hour)
- Location Scraper (25 req/hour)
- Availability Scraper (75 req/hour)

## 📋 Test Scripts

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:ci": "jest --coverage --watchAll=false"
}
```

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests in CI mode (no watch, with coverage)
npm run test:ci
```

## 📊 Coverage Targets

**Current Targets** (70% minimum):
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

**Production Targets** (recommended):
- **Critical paths**: 90%+
- **Business logic**: 85%+
- **UI components**: 80%+
- **Utility functions**: 95%+

## 🔧 Mocking Strategy

### External Services
- **Supabase**: Complete auth and database mocking
- **Apify**: API client and scraper mocking  
- **Next.js**: Navigation and server components
- **Gemini AI**: Analysis response mocking

### Mock Files Location
```
__mocks__/
├── lib/
│   ├── supabase.ts          # Database and auth mocking
│   ├── config.ts            # Environment variables
│   ├── services/
│   │   ├── apify.ts         # Scraper service mocking
│   │   └── enhanced-analysis.ts
│   └── utils/
│       └── logger.ts        # Logging functions
```

## 🚨 Common Testing Issues

### 1. Module Resolution
**Issue**: `Cannot find module '@/lib/...'`
**Solution**: Check `moduleNameMapper` in Jest config

### 2. Async/Await Handling
**Issue**: Tests failing on async operations
**Solution**: Properly await all async functions in tests

### 3. Mock Cleanup
**Issue**: Tests interfering with each other
**Solution**: Use `jest.clearAllMocks()` in `beforeEach`

### 4. Environment Variables
**Issue**: Config not available in tests
**Solution**: Set test environment variables in `jest.setup.js`

## 🧪 Test Writing Guidelines

### 1. Test Structure
```javascript
describe('ComponentName', () => {
  describe('specific functionality', () => {
    it('should do something specific', () => {
      // Arrange
      const props = { /* test props */ }
      
      // Act
      render(<Component {...props} />)
      
      // Assert
      expect(screen.getByText('Expected Text')).toBeInTheDocument()
    })
  })
})
```

### 2. Mock Setup
```javascript
// Always clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
})

// Use descriptive mock implementations
mockFunction.mockResolvedValue({
  success: true,
  data: mockData,
})
```

### 3. Assertions
```javascript
// Use specific matchers
expect(button).toBeDisabled()
expect(result).toEqual(expectedResult)
expect(mockFn).toHaveBeenCalledWith(expectedArgs)

// Test both success and error cases
it('should handle success case', () => { /* ... */ })
it('should handle error case', () => { /* ... */ })
```

## 🎯 Quality Assurance Checklist

### Before Committing
- [ ] All tests pass locally
- [ ] Coverage thresholds met
- [ ] No console.log statements in tests
- [ ] Mocks are properly configured
- [ ] German error messages tested

### Before Deployment
- [ ] CI tests pass
- [ ] Integration tests with real APIs (staging)
- [ ] Performance tests for critical paths
- [ ] Security testing for auth flows
- [ ] Load testing for API endpoints

## 📈 Future Testing Enhancements

### Planned Improvements
1. **E2E Testing** - Playwright for full user journeys
2. **Visual Regression** - Screenshot comparison testing
3. **Performance Testing** - Load and stress testing
4. **Accessibility Testing** - WCAG compliance automated tests
5. **Database Testing** - Supabase integration tests

### Advanced Test Types
- **Contract Testing** - API contract validation
- **Mutation Testing** - Test quality validation
- **Property Testing** - Generated test case scenarios
- **Snapshot Testing** - Component output validation

## 🛠️ Debugging Tests

### Common Debug Commands
```bash
# Run specific test file
npm test -- __tests__/auth/client.test.ts

# Run tests with verbose output
npm test -- --verbose

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Run tests matching pattern
npm test -- --testNamePattern="should handle sign in"
```

### Debug Configuration
```javascript
// Add to jest.config.js for debugging
verbose: process.env.DEBUG_TESTS === 'true',
detectOpenHandles: true,
forceExit: true,
```

---

**Documentation Version**: 1.0.0  
**Last Updated**: 2025-07-21  
**Test Framework**: Jest 30.0.4 + React Testing Library 16.3.0  
**Coverage**: 83 tests across 5 test suites  
**German Localization**: Complete for all error messages and user feedback