// This stub is needed because "react-markdown" is imported by forms-shared,
// yet it is never used by the tested code. Jest doesn't support ES Modules out of the box,
// so this prevents errors like "Unexpected token 'export'" when encountering ESM syntax.
// eslint-disable-next-line unicorn/prefer-module
module.exports = {
  __esModule: true,
  default: () => null,
}
