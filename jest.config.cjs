module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/src/tests/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/admin-portal/',
    '/groceries/'
  ],
  testTimeout: 30000
}