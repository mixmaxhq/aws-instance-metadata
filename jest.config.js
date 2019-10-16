const jestCoverageConfig = require('@mixmaxhq/jest-coverage-config');
module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  ...jestCoverageConfig,
  collectCoverageFrom: ['index.js'],
};
