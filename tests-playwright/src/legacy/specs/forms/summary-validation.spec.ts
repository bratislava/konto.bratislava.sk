import { expect, test } from '@playwright/test'

import { openForm } from '../../pages/FormPage'
import { continueButton, expectStepRejected, field, formContainer, summaryRow } from '../../helpers'

/**
 * Invalid input has to survive to the summary step and be flagged there rather than silently lost.
 *
 * Cypress source:
 * https://github.com/bratislava/konto.bratislava.sk/tree/prod3.30.3/tests/cypress/e2e/form/formSummaryCheck.cy.ts
 */
const SLUG = 'stanovisko-k-investicnemu-zameru'

const ziadatel = {
  meno: 'Cypress',
  priezvisko: 'Name',
  ulicaACislo: 'Test address 1',
  mesto: 'City',
  psc: '12345',
  // Deliberately invalid — this is what the test is about.
  email: 'cypress@test',
  telefon: '444333222',
}

/** Cypress: F03 `formSummaryCheck.cy.ts` — `it` 1–7. */
test(
  'invalid e-mail and phone are flagged in the summary',
  { tag: '@legacy' },
  async ({ page }) => {
    await openForm(page, SLUG)

    // A guest opening the form is greeted by the registration modal.
    const closeModal = page.locator('[data-cy=close-modal]')
    if (await closeModal.isVisible().catch(() => false)) {
      await closeModal.click()
    }

    await test.step('empty step is rejected', async () => {
      await expectStepRejected(page, 'ziadatel', [
        'root_ziadatel_meno',
        'root_ziadatel_priezvisko',
        'root_ziadatel_ulicaACislo',
        'root_ziadatel_mesto',
        'root_ziadatel_psc',
        'root_ziadatel_email',
        'root_ziadatel_telefon',
      ])
    })

    await test.step('fill in the "žiadateľ" step', async () => {
      for (const [property, value] of Object.entries(ziadatel)) {
        const input = field(page, `root_ziadatel_${property}`).locator('input').first()
        await input.fill(value)
        await input.blur()
      }

      await continueButton(page).click()
    })

    await test.step('jump to the summary step via the stepper', async () => {
      const stepper = page.locator('[data-cy=stepper-desktop], [data-cy=stepper-mobile]')
      const dropdown = page.locator('[data-cy=stepper-dropdown]')
      if (await dropdown.isVisible().catch(() => false)) {
        await dropdown.click()
      }

      await stepper.locator('[data-cy=stepper-step-6]').locator('visible=true').first().click()
      await expect(formContainer(page)).toBeVisible()
    })

    await test.step('summary reports errors and keeps the entered values', async () => {
      await expect(page.locator('[data-cy=alert-container]').first()).toBeVisible()

      for (const [property, value] of Object.entries(ziadatel)) {
        await expect(summaryRow(page, `root_ziadatel_${property}`)).toContainText(value)
      }

      // `SummaryRow` marks an invalid row only through this class (`SummaryRow.tsx:31`), so unlike the
      // input-level checks there is no semantic hook to use instead.
      for (const property of ['email', 'telefon']) {
        await expect(summaryRow(page, `root_ziadatel_${property}`)).toHaveClass(/border-red-500/)
      }
    })
  },
)
