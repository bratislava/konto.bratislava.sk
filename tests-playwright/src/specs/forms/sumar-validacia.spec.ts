import { expect, test } from '@playwright/test'

import { fieldRoot, formContainer, summaryRow } from '../../engine/selectors'
import { openForm } from '../../pages/FormPage'

/**
 * Was `tests/cypress/e2e/form/formSummaryCheck.cy.ts` (F03).
 *
 * Checks that deliberately invalid input survives to the summary and is flagged there. The Cypress
 * fixture named these values `first_name`, `last_name`, `zip_code`, `email_wrong`… — English
 * `snake_case` for a schema whose properties are Slovak `camelCase`. They are named after the
 * schema here (`next/../forms-shared` step `ziadatel`).
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

test('neplatný e-mail a telefón sú v sumári označené ako chyby', async ({ page }) => {
  await openForm(page, SLUG)

  // A guest opening the form is greeted by the registration modal.
  const closeModal = page.locator('[data-cy=close-modal]')
  if (await closeModal.isVisible().catch(() => false)) {
    await closeModal.click()
  }

  await test.step('prázdny krok sa neodošle', async () => {
    const urlBefore = page.url()
    await page.locator('[data-cy^=continue-button-]').locator('visible=true').click()

    // The Cypress version asserted `[aria-required=true]` had exactly 8 elements. A magic number
    // says nothing about which fields are required and breaks whenever the schema changes; that the
    // step refuses to advance and shows errors is the behaviour worth pinning.
    await expect(page).toHaveURL(urlBefore)
    await expect(page.locator('[data-cy=error-message]').first()).toBeVisible()
  })

  await test.step('vyplnenie kroku "Žiadateľ"', async () => {
    for (const [property, value] of Object.entries(ziadatel)) {
      const input = fieldRoot(page, `root_ziadatel_${property}`).locator('input').first()
      await input.fill(value)
      await input.blur()
    }

    await page.locator('[data-cy^=continue-button-]').locator('visible=true').click()
  })

  await test.step('preskočenie na sumár cez stepper', async () => {
    const stepper = page.locator('[data-cy=stepper-desktop], [data-cy=stepper-mobile]')
    const dropdown = page.locator('[data-cy=stepper-dropdown]')
    if (await dropdown.isVisible().catch(() => false)) {
      await dropdown.click()
    }

    await stepper.locator('[data-cy=stepper-step-6]').locator('visible=true').first().click()
    await expect(formContainer(page)).toBeVisible()
  })

  await test.step('sumár hlási chyby a zachoval zadané hodnoty', async () => {
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
})
