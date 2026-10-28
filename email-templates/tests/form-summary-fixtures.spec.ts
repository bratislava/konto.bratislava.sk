import { readFileSync } from 'node:fs'
import path from 'node:path'

import { expect, test } from '@playwright/test'

import {
  computeFormSummaryFixture,
  formSummaryFixtureSources,
  formSummaryFixturesDirectory,
} from '../scripts/form-summary-fixtures'

for (const [name, exampleName] of Object.entries(formSummaryFixtureSources)) {
  test(`form summary fixture ${name} matches forms-shared`, () => {
    const stored: unknown = JSON.parse(
      readFileSync(path.join(formSummaryFixturesDirectory, `${name}.json`), 'utf8'),
    )
    expect(stored, 'Run `pnpm generate-form-summary-fixtures`').toEqual(
      computeFormSummaryFixture(exampleName),
    )
  })
}
