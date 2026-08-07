#!/usr/bin/env node
// A committed launcher rather than pointing `bin` straight at `dist/`: pnpm resolves bin
// targets at install time, so on a fresh clone — where `dist` does not exist yet — the
// `openapi-cli` shim would be skipped and stay missing until someone built the package and
// then re-installed. This path always exists, so only its implementation needs building.
require('../dist/bin.js')
