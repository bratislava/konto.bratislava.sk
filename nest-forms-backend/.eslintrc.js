module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    ecmaVersion: 2021,
  },
  plugins: ['@darraghor/nestjs-typed', 'custom-rules'],
  extends: ['auto', 'plugin:@darraghor/nestjs-typed/recommended'],
  root: true,
  env: {
    node: true,
    jest: true,
    es2021: true,
  },
  ignorePatterns: ['.eslintrc.js', '/src/utils/clients/openapi-*/*.ts'],
  rules: {
    'max-classes-per-file': 'off',
    'const-case/uppercase': 'off',
    'sonarjs/no-duplicate-string': 'off',
    'class-methods-use-this': 'off',
    'sonarjs/prefer-immediate-return': 'off',
    'import/no-extraneous-dependencies': 'off',
    'sonarjs/no-useless-catch': 'off',
    'no-useless-catch': 'off',
    '@darraghor/nestjs-typed/api-property-returning-array-should-set-array':
      'off',
    'no-restricted-syntax': 2,
    // '@typescript-eslint/interface-name-prefix': 'off',
    // '@typescript-eslint/explicit-function-return-type': 'off',
    // '@typescript-eslint/explicit-module-boundary-types': 'off',
    // '@typescript-eslint/no-explicit-any': 'off',
    'pii/no-phone-number': 'off',
    'custom-rules/thrower-error-guard-enum': 'error',
    // https://stackoverflow.com/a/53769213
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
    /* Legacy rule handled by TypeScript */
    'lodash-fp/no-extraneous-args': 'off',
    /* Lodash rules that dont make sense */
    'lodash/prefer-noop': 'off',
    'lodash-fp/prefer-constant': 'off',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
  overrides: [
    {
      files: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
      rules: {
        '@typescript-eslint/dot-notation': 'off', // to test private methods
        '@darraghor/nestjs-typed/controllers-should-supply-api-tags': 'off',
        '@darraghor/nestjs-typed/api-method-should-specify-api-response': 'off',
        '@darraghor/nestjs-typed/injectable-should-be-provided': 'off',
      },
    },
    {
      files: ['**/eslint-custom-rules/**/*.js'],
      rules: {
        'unicorn/prefer-module': 'off',
        'global-require': 'off',
      },
    },
  ],
}
