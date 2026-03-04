import { createNextConfig } from '@bratislava/eslint-config-next'

export default [
  ...createNextConfig({
    ignores: ['*.config.*', '/src/clients/openapi-*/*.ts', '/src/clients/graphql-*/*.ts'],
  }),

  // Project-specific rule overrides
  {
    rules: {
      'jsx-a11y/anchor-is-valid': 'off',
      'no-multi-spaces': 'error',

      // TODO good rules, require work to fix and were skipped over in eslint v9 upgrade
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/promise-function-async': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      'sonarjs/slow-regex': 'off',
      'sonarjs/prefer-regexp-exec': 'off',
      'security/detect-unsafe-regex': 'off',
      'security/detect-object-injection': 'off',
      'no-implicit-coercion': 'off',

      '@typescript-eslint/no-unused-vars': 'warn', // 148 violations
      '@typescript-eslint/no-unnecessary-condition': 'warn', // 143 violations
      'i18next/no-literal-string': 'warn', // 141 violations
      'padding-line-between-statements': 'warn', // 110 violations
      'react/no-array-index-key': 'warn', // 35 violations
      '@typescript-eslint/no-unsafe-member-access': 'warn', // 28 violations
      '@typescript-eslint/require-await': 'warn', // 27 violations
      'sonarjs/no-ignored-exceptions': 'warn', // 18 violations
      '@typescript-eslint/no-unsafe-call': 'warn', // 14 violations
      '@typescript-eslint/no-floating-promises': 'warn', // 13 violations
      '@typescript-eslint/no-invalid-void-type': 'warn', // 13 violations
      '@typescript-eslint/consistent-indexed-object-style': 'warn', // 12 violations
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'warn', // 12 violations
      '@typescript-eslint/no-shadow': 'warn', // 12 violations
      '@typescript-eslint/no-unsafe-return': 'warn', // 9 violations
      '@typescript-eslint/prefer-enum-initializers': 'warn', // 9 violations
      'react/no-unused-prop-types': 'warn', // 9 violations
      'sonarjs/function-return-type': 'warn', // 8 violations
      'react/jsx-key': 'warn', // 8 violations
      '@typescript-eslint/no-misused-spread': 'warn', // 7 violations
      'sonarjs/cognitive-complexity': 'warn', // 6 violations
      '@typescript-eslint/no-duplicate-type-constituents': 'warn', // 6 violations
      '@typescript-eslint/no-non-null-assertion': 'warn', // 5 violations
      'sonarjs/no-clear-text-protocols': 'warn', // 5 violations
      '@typescript-eslint/switch-exhaustiveness-check': 'warn', // 4 violations
      '@typescript-eslint/no-useless-default-assignment': 'warn', // 4 violations
      '@typescript-eslint/no-deprecated': 'warn', // 3 violations
      'react-hooks/set-state-in-effect': 'warn', // 3 violations
      '@typescript-eslint/no-unnecessary-type-parameters': 'warn', // 3 violations
      'sonarjs/no-nested-functions': 'warn', // 2 violations
      '@typescript-eslint/no-dynamic-delete': 'warn', // 2 violations
      'react-hooks/static-components': 'warn', // 2 violations
      'sonarjs/no-undefined-argument': 'warn', // 2 violations
      'tailwindcss/enforces-shorthand': 'warn', // 2 violations
      'sonarjs/fixme-tag': 'warn', // 2 violations
      '@typescript-eslint/no-base-to-string': 'warn', // 2 violations

      'tailwindcss/no-custom-classname': 'off',
      'tailwindcss/classnames-order': 'off',
    },
  },
]
