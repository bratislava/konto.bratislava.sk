import eslintNestJs from '@darraghor/eslint-plugin-nestjs-typed'
import jest from 'eslint-plugin-jest'
import noSecrets from 'eslint-plugin-no-secrets'
// the way we run eslint-config as ts prevents us from easily adding our own type definitions (and it's a bit of a hassle for single package either way)
// @ts-expect-error - eslint-plugin-no-unsanitized does not have @typed package
import noUnsanitized from 'eslint-plugin-no-unsanitized'
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended'
import pluginSecurity from 'eslint-plugin-security'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import sonarjs from 'eslint-plugin-sonarjs'

const __dirname = process.cwd()

import eslint from '@eslint/js'
import json from '@eslint/json'
import markdown from '@eslint/markdown'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylistic,
  eslintPluginPrettier,
  pluginSecurity.configs.recommended,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
  noUnsanitized.configs.recommended,

  sonarjs.configs.recommended,
  eslintNestJs.configs.flatRecommended,
  ...markdown.configs.recommended,
  {
    plugins: {
      json,
    },
  },
  {
    plugins: {
      'no-secrets': noSecrets,
    },
    rules: {
      'no-secrets/no-secrets': ['error', { tolerance: 4.3 }], // The default value of 4 marked function names as secrets.
    },
  },
  {
    files: ['**/*.json'],
    ignores: ['package-lock.json'],
    language: 'json/json',
    ...json.configs.recommended,
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    rules: {
      // @typescript-eslint block
      // rules where we override eslint's type-less version with @typescript-eslint version
      'no-restricted-imports': 'off',
      '@typescript-eslint/no-restricted-imports': 'error',
      'no-loop-func': 'off',
      '@typescript-eslint/no-loop-func': 'error',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      'require-await': 'off',
      '@typescript-eslint/require-await': 'error',
      // other @typescript-eslint rules
      '@typescript-eslint/prefer-enum-initializers': 'error',
      '@typescript-eslint/consistent-generic-constructors': [
        'error',
        'type-annotation',
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/no-extraneous-class': [
        'error',
        {
          allowWithDecorator: true, // this is typical for nestjs modules
        },
      ],
      '@typescript-eslint/restrict-template-expressions': [
        // allowing some which seems more tedious to cast than useful to forbid
        'error',
        {
          allowNumber: true,
          allowBoolean: true,
          allowNullish: true,
        },
      ],
      '@typescript-eslint/promise-function-async': 'error', // easier to spot async functions
      '@typescript-eslint/require-array-sort-compare': 'error', // prevent accidental js weirdness
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      // end @typescript-eslint block
      // sonarjs
      'sonarjs/todo-tag': ['warn'], // impossible with the default error level
      // eslint
      'sort-imports': 'off', // using simple-import-sort
      'no-console': 'error', // we enforce logger use
      'array-callback-return': 'error',
      'no-constructor-return': 'error',
      'no-duplicate-imports': 'error',
      'no-useless-assignment': 'error',
      'block-scoped-var': 'error',
      'consistent-return': 'error',
      'default-case-last': 'error',
      'default-param-last': 'error',
      'dot-notation': 'error',
      eqeqeq: ['error', 'smart'],
      'new-cap': ['error', { capIsNew: false }],
      'no-await-in-loop': 'error',
      'no-caller': 'error',
      'no-else-return': 'error',
      'no-implicit-coercion': 'error',
      'no-invalid-this': 'error',
      'no-lonely-if': 'error',
      'no-param-reassign': 'error',
      'no-return-assign': 'error',
      'no-unneeded-ternary': 'error',
      'no-unused-expressions': 'error',
      'no-useless-call': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-return': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-const': 'error',
      'prefer-object-spread': 'error',
      'prefer-template': 'error',
      yoda: 'error',
      // FE/BE/project specific
      '@darraghor/nestjs-typed/injectable-should-be-provided': 'off',
      '@darraghor/nestjs-typed/api-property-returning-array-should-set-array':
        'off', // extra typing, little value, we're used to style without this
      // TODO enforce relative imports (not in packages)
    },
  },
  {
    files: ['**/*.spec.ts'],
    plugins: {
      jest,
    },
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      'dot-notation': 'off', // to test private methods
      '@typescript-eslint/unbound-method': 'off', // jest spies on methods, so this is not useful
      '@typescript-eslint/no-non-null-assertion': 'off', // we use ! in tests
      'sonarjs/no-nested-functions': 'off', // describe -> describe -> it nesting is common in tests
      '@typescript-eslint/no-explicit-any': 'off', // when spying on service methods
      '@typescript-eslint/no-empty-function': 'off', // when setting empty function as implementation for spies
    },
  },
)
