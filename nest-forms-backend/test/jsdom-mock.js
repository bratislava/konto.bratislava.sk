// This stub is needed because "jsdom" brings in ESM dependencies like "parse5"
// which are evaluated even if unused by the tested code.
// Jest doesn't support ES Modules in NestJS context.
// See: https://github.com/nestjs/nest/pull/16391
//
// Mock for jsdom to avoid failing on its ESM sub-dependencies
class DOMParserMock {
  parseFromString() {
    // Provide a minimal document mock if needed
    return {
      documentElement: {
        textContent: '',
      },
      querySelectorAll: () => [],
      querySelector: () => null,
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class JSDOM {
  constructor() {
    this.window = {
      DOMParser: DOMParserMock,
    }
  }
}

module.exports = {
  JSDOM,
}
