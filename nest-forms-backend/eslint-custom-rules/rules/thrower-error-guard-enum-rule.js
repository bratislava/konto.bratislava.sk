// This rule assures, that the first argument for each throwerErrorGuard function is a member of some ErrorEnum.

module.exports = {
  meta: {
    type: 'suggestion', // or 'problem' if it's an error
    docs: {
      description:
        'Enforce non-literal string for the first parameter of throwerErrorGuard function calls',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null, // Not automatically fixable
  },

  create(context) {
    return {
      CallExpression(node) {
        const { callee } = node

        // Check if the callee is a member of `this.throwerErrorGuard`
        if (
          callee.type === 'MemberExpression' &&
          callee.object.type === 'MemberExpression' &&
          callee.object.object.type === 'ThisExpression' &&
          callee.object.property.name === 'throwerErrorGuard'
        ) {
          const firstArgument = node.arguments[0]

          if (
            firstArgument &&
            !(
              firstArgument.type === 'MemberExpression' &&
              firstArgument.object.type === 'Identifier' &&
              firstArgument.property.type === 'Identifier'
            )
          ) {
            context.report({
              node: firstArgument,
              message: 'Use a member of some error enum.',
            })
          }
        }
      },
    }
  },
}
