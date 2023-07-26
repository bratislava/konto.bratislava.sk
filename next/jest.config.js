const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  // https://github.com/microsoft/accessibility-insights-web/pull/5421/commits/9ad4e618019298d82732d49d00aafb846fb6bac7
  resolver: `<rootDir>/jest-resolver.js`,
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],
  // Need for using full path in imports
  moduleNameMapper: {
    '@backend/(.*)': '<rootDir>/backend/$1',
    '@utils/(.*)': '<rootDir>/utils/$1',
    'react-markdown': '<rootDir>/node_modules/react-markdown/react-markdown.min.js',
  },
  testEnvironment: 'jest-environment-jsdom',
}

// https://stackoverflow.com/a/72926763
module.exports = async () => ({
  ...(await createJestConfig(customJestConfig)()),
  transformIgnorePatterns: [
    // The regex below is just a guess, you might tweak it
    // https://stackoverflow.com/a/49676319
    'node_modules/(?!(pretty-bytes)/)',
  ],
})
