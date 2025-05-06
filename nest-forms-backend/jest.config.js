module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: String.raw`.*\.spec\.ts$`,
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.dto.ts',
    '!**/*.module.ts',
    '!**/*.enum.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/../test/singleton.ts'],
  testPathIgnorePatterns: ['<rootDir>/nases/__tests__'],
  moduleNameMapper: {
    '^react-markdown$': '<rootDir>/../test/react-markdown-mock.js',
  },
}
