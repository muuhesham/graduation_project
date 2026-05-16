export default {
    testEnvironment: 'node',
    transform: {},
    verbose: true,
    testMatch: ['**/tests/**/*.test.js'],
    setupFilesAfterEnv: ['./tests/setup.js'],
    testTimeout: 30000,
};
