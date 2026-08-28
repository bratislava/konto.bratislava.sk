import { expect, test } from '@playwright/test'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { exampleForms } from 'forms-shared/example-forms/exampleForms'

import { expectSummaryMatchesPlan, fillForm } from '../../engine/fill'
import { buildPlan, stepProperty, stepQueryParams } from '../../engine/plan'
import { openForm } from '../../pages/FormPage'

/**
 * Replaces `tests/cypress/e2e/form/formRealEstateTaxReturn.cy.ts` (864 lines, 18 chained `it`s per
 * scenario) plus the disabled `formSIZ.cy.ts` / `formZSIZ.cy.ts` (420 lines of `xdescribe`).
 *
 * The scenarios come from `forms-shared` rather than from re-encoded JSON fixtures. The five files
 * in `tests/cypress/fixtures/formRealEstateTaxReturn/` were byte-for-byte copies of these example
 * forms, so importing them removes the drift risk, makes the data typed as `TaxFormData`, and picks
 * up `priznanieKDaniZNehnutelnostiExample5NoCalculators` — the only example exercising
 * `pouzitKalkulacku: false`, which had no JSON counterpart and was therefore never tested.
 *
 * Every test creates nothing and shares nothing, so the whole matrix runs in parallel.
 */
const SLUGS = ['priznanie-k-dani-z-nehnutelnosti'] as const

SLUGS.forEach((slug) => {
  const formDefinition = getFormDefinitionBySlug(slug)
  if (!formDefinition) {
    throw new Error(`No form definition for slug "${slug}".`)
  }

  const examples = exampleForms[slug] ?? []

  test.describe(slug, () => {
    examples.forEach((example) => {
      test(example.name, async ({ page }) => {
        const { schema } = formDefinition
        const plan = buildPlan(schema, example.formData)
        const queryParams = stepQueryParams(schema)
        const firstStep = queryParams[stepProperty(plan.steps[0])]

        const mismatches: string[] = []

        // Scenarios that upload a file need a real form instance, because the dev preview route
        // has no backend. Everything else takes the fast, state-free path.
        // if (requiresBackend(plan)) {
        await openForm(page, slug)
        // } else {
        //   await openDevForm(page, slug, firstStep)
        // }

        const { fields } = await fillForm(page, schema, example.formData, {
          onMismatch: (field, actual, expected) =>
            mismatches.push(`${field.id}: expected "${expected}", found "${actual}"`),
        })

        await test.step('sumár neobsahuje chyby', async () => {
          // The summary revalidates asynchronously once file statuses have been fetched, so it can
          // show the error alert briefly before settling.
          await expect(page.locator('[data-cy=alert-container].bg-negative-100')).toHaveCount(0, {
            timeout: 30_000,
          })
          await expect(page.locator('[data-cy=error-message]')).toHaveCount(0)
        })

        await test.step('sumár zodpovedá vyplneným údajom', async () => {
          await expectSummaryMatchesPlan(page, fields)
        })

        // Surfaces the behaviour the Cypress suite worked around with its undocumented
        // "clear and re-type" passes. If this ever trips, it is an app bug worth filing.
        expect(mismatches, 'polia stratili hodnotu po vyplnení').toEqual([])
      })
    })
  })
})
