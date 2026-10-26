import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import {
  computeFormSummaryFixture,
  formSummaryFixtureSources,
  formSummaryFixturesDirectory,
} from './form-summary-fixtures'

/** Writes the form summary fixtures of the form email examples (see `form-summary-fixtures.ts`). */
mkdirSync(formSummaryFixturesDirectory, { recursive: true })
for (const [name, exampleName] of Object.entries(formSummaryFixtureSources)) {
  writeFileSync(
    path.join(formSummaryFixturesDirectory, `${name}.json`),
    `${JSON.stringify(computeFormSummaryFixture(exampleName), null, 2)}\n`,
  )
  console.log(`${name}.json written`)
}
