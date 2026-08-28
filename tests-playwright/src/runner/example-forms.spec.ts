import { expect, test } from '@playwright/test'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { exampleForms } from 'forms-shared/example-forms/exampleForms'

import { expectSummaryMatchesPlan, fillForm } from './fill'
import { buildPlan, stepProperty, stepQueryParams } from './plan'
import { openForm } from '../legacy/pages/FormPage'

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
const SLUGS = [
  // Ported from Cypress: F05 (`formRealEstateTaxReturn.cy.ts`) and the disabled F01 / F02
  // (`formSIZ.cy.ts` / `formZSIZ.cy.ts`).
  'priznanie-k-dani-z-nehnutelnosti',
  'stanovisko-k-investicnemu-zameru',
  'zavazne-stanovisko-k-investicnej-cinnosti',

  // TEMPORARY — every remaining form that ships an example, added only to exercise the engine
  // against widget and schema shapes the three forms above never reach. Not intended to stay in the
  // suite; delete this block once the engine has been shaken out.
  'komunitne-zahrady',
  'ziadost-o-najom-bytu',
  'oznamenie-o-poplatkovej-povinnosti-za-komunalne-odpady',
  'ziadost-o-uzemnoplanovaciu-informaciu',
  'nahlasenie-podnetu-k-elektrickym-kolobezkam',
  'olo-mimoriadny-odvoz-a-zhodnotenie-odpadu',
  'olo-energeticke-zhodnotenie-odpadu-v-zevo',
  'olo-triedeny-zber-papiera-plastov-a-skla-pre-spravcovske-spolocnosti',
  'olo-triedeny-zber-papiera-plastov-a-skla-pre-pravnicke-osoby',
  'olo-odvoz-objemneho-odpadu-valnikom',
  'olo-olo-taxi',
  'olo-podnety-a-pochvaly-obcanov',
  'olo-kolo-taxi',
  'olo-docistenie-stanovista-zbernych-nadob',
  'olo-odvoz-odpadu-velkokapacitnym-alebo-lisovacim-kontajnerom',
  'olo-uzatvorenie-zmluvy-o-nakladani-s-odpadom',
  'predzahradky',
  'ziadost-o-slobodny-pristup-k-informaciam',
  'paas-kontaktny-formular',
] as const

/**
 * Forms that exist and have example data but cannot currently be opened by a user, so there is no
 * engine signal to gain from them. Skipped with the reason rather than left to fail, and `openForm`
 * throws a descriptive error if any other slug turns out to be unreachable too.
 */
const UNREACHABLE: Partial<Record<(typeof SLUGS)[number], string>> = {
  'ziadost-o-slobodny-pristup-k-informaciam':
    'používa staršiu landing page (FormLandingPageContent) bez CTA na vyplnenie',
  'paas-kontaktny-formular':
    'stránka mestskej služby nemá v Strapi priradený formulár, takže nevykresľuje CTA',
}

SLUGS.forEach((slug) => {
  const formDefinition = getFormDefinitionBySlug(slug)
  if (!formDefinition) {
    throw new Error(`No form definition for slug "${slug}".`)
  }

  const examples = exampleForms[slug] ?? []

  test.describe(slug, () => {
    // A disabled form returns 404 from `/mestske-sluzby/{slug}`, so it cannot be opened at all.
    test.skip(formDefinition.isDisabled === true, 'formulár je vypnutý (isDisabled)')
    test.skip(UNREACHABLE[slug] !== undefined, UNREACHABLE[slug] ?? '')

    examples.forEach((example) => {
      test(example.name, async ({ page }) => {
        const { schema } = formDefinition
        const plan = buildPlan(schema, example.formData)
        const queryParams = stepQueryParams(schema)
        const firstStep = queryParams[stepProperty(plan.steps[0])]

        const mismatches: string[] = []

        // Every scenario goes through a real form instance: the dev preview route has no backend,
        // so file uploads cannot complete there, and all three forms include uploads.
        await openForm(page, slug)

        // The example names its files, and the names carry the intended type — `fotografia-podnetu.jpg`
        // versus `splnomocnenie.pdf`. The engine uses them to pick a matching local asset, to upload
        // each file under its own name, and then to assert those names on the summary.
        const fileNames = Object.fromEntries(
          (example.serverFiles ?? []).map((file) => [file.id, file.fileName]),
        )

        const { fields } = await fillForm(page, schema, example.formData, {
          fileNames,
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
          await expectSummaryMatchesPlan(page, fields, { fileNames })
        })

        // Surfaces the behaviour the Cypress suite worked around with its undocumented
        // "clear and re-type" passes. If this ever trips, it is an app bug worth filing.
        expect(mismatches, 'polia stratili hodnotu po vyplnení').toEqual([])
      })
    })
  })
})
