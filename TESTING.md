# Fresh Katale E-commerce Testing Guide

## 🧪 Testing Overview

This project includes comprehensive testing for all components:
- **Backend API Tests** (Jest + Supertest)
- **Frontend Component Tests** (Vitest + React Testing Library)
- **Admin Portal Tests** (Vitest + React Testing Library)

## 🚀 Quick Start

### Run All Tests
```bash
# Windows
run-all-tests.bat

# Manual (run each separately)
npm test                    # Backend
cd groceries && npm test    # Frontend  
cd admin-portal && npm test # Admin Portal
```

## 📁 Test Structure

```
e-comm/
├── src/tests/              # Backend tests
│   ├── setup.js           # Test configuration
│   ├── auth.test.js        # Authentication tests
│   ├── products.test.js    # Product API tests
│   └── notifications.test.js # Notification tests
├── groceries/src/tests/    # Frontend tests
│   ├── setup.js           # Test configuration
│   └── FAQ.test.jsx       # Component tests
└── admin-portal/src/tests/ # Admin portal tests
    ├── setup.js           # Test configuration
    └── authSlice.test.js   # Redux tests
```

## 🔧 Backend Testing

### Technologies
- **Jest**: Test runner
- **Supertest**: HTTP testing
- **MongoDB Memory Server**: In-memory database

### Test Categories
- ✅ Authentication (register, login, logout)
- ✅ Product API (CRUD operations)
- ✅ Notification system
- ✅ Security middleware
- ✅ Input validation

### Running Backend Tests
```bash
npm test                # Run once
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage
```

## 🎨 Frontend Testing

### Technologies
- **Vitest**: Test runner
- **React Testing Library**: Component testing
- **jsdom**: DOM simulation

### Test Categories
- ✅ Component rendering
- ✅ User interactions
- ✅ State management
- ✅ Routing
- ✅ Form validation

### Running Frontend Tests
```bash
cd groceries
npm test                # Run once
npm run test:ui         # UI mode
npm run test:coverage   # With coverage
```

## 👨‍💼 Admin Portal Testing

### Technologies
- **Vitest**: Test runner
- **React Testing Library**: Component testing
- **Redux Testing**: State management

### Test Categories
- ✅ Authentication flow
- ✅ Redux store
- ✅ Admin components
- ✅ Protected routes

### Running Admin Tests
```bash
cd admin-portal
npm test                # Run once
npm run test:ui         # UI mode
npm run test:coverage   # With coverage
```

## 🔒 Security Testing

### Automated Security Tests
- ✅ Input validation
- ✅ Authentication middleware
- ✅ Rate limiting
- ✅ CSRF protection
- ✅ SQL injection prevention

### Manual Security Testing
1. **Rate Limiting**: Try multiple login attempts
2. **Input Validation**: Test with malicious inputs
3. **Authentication**: Test protected routes
4. **CSRF**: Test form submissions

## 📊 Test Coverage Goals

- **Backend**: > 80% coverage
- **Frontend**: > 70% coverage
- **Admin Portal**: > 75% coverage

## 🐛 Debugging Tests

### Common Issues
1. **Database Connection**: Ensure MongoDB is running
2. **Environment Variables**: Check `.env.test` file
3. **Port Conflicts**: Ensure ports 8080, 5173 are free
4. **Dependencies**: Run `npm install` in all directories

### Debug Commands
```bash
# Backend debugging
npm test -- --verbose

# Frontend debugging
cd groceries && npm test -- --reporter=verbose

# Admin portal debugging
cd admin-portal && npm test -- --reporter=verbose
```

## 🚀 Continuous Integration

### GitHub Actions (Future)
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
```

## 📝 Writing New Tests

### Backend Test Example
```javascript
describe('New Feature', () => {
  it('should work correctly', async () => {
    const response = await request(app)
      .post('/api/new-endpoint')
      .send({ data: 'test' })
      .expect(200)
    
    expect(response.body.success).toBe(true)
  })
})
```

### Frontend Test Example
```javascript
import { render, screen } from '@testing-library/react'
import NewComponent from '../components/NewComponent'

describe('NewComponent', () => {
  it('renders correctly', () => {
    render(<NewComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

## 🎯 Test Best Practices

1. **Descriptive Names**: Use clear test descriptions
2. **Arrange-Act-Assert**: Structure tests clearly
3. **Mock External Services**: Don't test third-party APIs
4. **Test Edge Cases**: Include error scenarios
5. **Keep Tests Fast**: Use mocks and in-memory databases
6. **Clean Up**: Reset state between tests

## 📈 Performance Testing

### Load Testing (Future)
- Use tools like Artillery or k6
- Test API endpoints under load
- Monitor response times
- Test concurrent users

## 🔍 End-to-End Testing (Future)

### Playwright/Cypress
- Full user journey testing
- Cross-browser testing
- Visual regression testing
- Mobile responsiveness

---

## 🆘 Need Help?

1. Check test logs for specific errors
2. Ensure all dependencies are installed
3. Verify environment variables are set
4. Check database connectivity
5. Review this documentation

**Happy Testing! 🧪✨**