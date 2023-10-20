module.exports = {
  extends: [
    'auto',
    'plugin:tailwindcss/recommended',
    'plugin:@next/next/recommended',
    'prettier',
    'plugin:@tanstack/eslint-plugin-query/recommended',
  ],
  plugins: [],
  rules: {
    'react/react-in-jsx-scope': 'off',
    /** We use this a lot with isDefined and hasAttributes */
    'unicorn/no-array-callback-reference': 'off',
    // Named export is easier to refactor automatically
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-shadow': ['error', { allow: ['event', 'value', 'key', 'error'] }],
    /** Too tedious to type every function return explicitly */
    '@typescript-eslint/explicit-function-return-type': 'off',
    /** We prefer arrow functions */
    'react/function-component-definition': [2, { namedComponents: 'arrow-function' }],
    /** It's annoying to refactor from one style to another */
    'arrow-body-style': 'off',
    /** These are exceptions that we use with "__" */
    'no-underscore-dangle': [
      2,
      { allow: ['__NEXT_DATA__', '__NEXT_LOADED_PAGES__', '__typename', '__errors'] },
    ],
    /** Links get confused for secrets */
    'no-secrets/no-secrets': [
      'error',
      {
        ignoreContent: [
          // https://stackoverflow.com/a/3809435
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gm,
        ],
      },
    ],
    /** Presently at too many places & becomes just an ignored clutter, consider turning on later */
    '@typescript-eslint/no-unsafe-assignment': 'off',
    /** Doesn't work without changing our ts config */
    'unicorn/prefer-spread': 'off',
    /** To remove optional parameter warning e.g. { page?: number } */
    'react/require-default-props': 'off',
    /** To Remove  */
    'react/no-array-index-key': 'off',
    'react/no-unused-prop-types': 'off',
    '@next/next/no-img-element': 'off',
    'eslint-comments/disable-enable-pair': ['error', { allowWholeFile: true }],
    'switch-case/newline-between-switch-case': 'off',
    // This rule disallows lexical declarations (let, const, function and class) in case/default clauses.
    'no-case-declarations': 'off',
    // Solve warning "Promise-returning function provided to attribute where a void return was expected."
    '@typescript-eslint/no-misused-promises': [
      2,
      {
        checksVoidReturn: {
          attributes: false,
        },
      },
    ],
    /** better to use empty function */
    'lodash/prefer-noop': 'off',
    /** if comparing values in cx function or creating translations, it's overkill to create variables for that */
    'sonarjs/no-duplicate-string': 'warn',
    'sonarjs/cognitive-complexity': 'off',
    'unicorn/no-array-reduce': 'off',
    // quite annoying as it conflicts with VS Code's auto import
    'lodash/import-scope': 'off',
    // json schema definitions may contain "then" keys
    'unicorn/no-thenable': 'off',
    'no-process-env': 'error',
    'react/jsx-no-useless-fragment': [
      'error',
      {
        allowExpressions: true,
      },
    ],
    '@typescript-eslint/ban-ts-comment': 'warn',
  },
  ignorePatterns: [
    '*.config.*',
    '.eslintrc.js',
    '/backend/forms/',
    '/backend/client-openapi-forms/',
    '/clients/openapi-forms/*.ts',
  ],
}
