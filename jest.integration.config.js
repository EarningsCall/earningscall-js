/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.integration.spec.ts'],
  verbose: true,
  testTimeout: 30000
};
