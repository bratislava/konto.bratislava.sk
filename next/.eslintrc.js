module.exports = {
  extends: [
    'auto',
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
    'no-secrets/no-secrets': 'off',
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
    '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
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
    'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
    '@typescript-eslint/ban-ts-comment': 'warn',
    // Mistakes React component for HTML string
    'xss/no-mixed-html': 'off',
    // Many false positives, if we add email/phone we probably want to have it anyway
    'pii/no-email': 'off',
    'pii/no-phone-number': 'off',
    // Good rationale, but doesn't work for us
    'const-case/uppercase': 'off',
    // Temporarily disabled because IDE problems
    'prettier/prettier': 'off',
    'import/extensions': 'off',
  },
  ignorePatterns: [
    '*.config.*',
    '.eslintrc.js',
    '/clients/openapi-*/*.ts',
    '/clients/graphql-*/*.ts',
  ],
}
