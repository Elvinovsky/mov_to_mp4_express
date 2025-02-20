/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 100000, 
  testRegex: '.e2e.test.ts$',
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
};