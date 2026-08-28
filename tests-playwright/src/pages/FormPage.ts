import { expect, type Page } from '@playwright/test'

import { STEP_QUERY_PARAM_KEY } from '../engine/plan'
import { formContainer } from '../engine/selectors'

/**
 * Waits for client-side hydration, which `next/src/pages/_app.tsx` signals explicitly.
 *
 * Playwright's actionability checks cover most of what `cy.waitForHydration()` was for, but the
 * form is entirely client-rendered, so gating on the flag avoids interacting with server HTML that
 * is about to be replaced.
 */
export const waitForHydration = async (page: Page) => {
  await page.locator('body[data-cy-hydrated="true"]').waitFor({ state: 'attached' })
}

/**
 * Opens a form through the dev preview route.
 *
 * This route renders the form straight from the `forms-shared` schema with no form instance and no
 * backend, which makes it the right entry point for the filling matrix: no draft is created on the
 * forms backend, no guest identity is minted, no Strapi landing page is fetched, and nothing is
 * shared between workers. That is what lets the whole example-form matrix run fully in parallel.
 *
 * File upload and persistence do not work here — use `openForm` for those.
 */
export const openDevForm = async (page: Page, slug: string, firstStepQueryParam: string) => {
  await page.goto(`/mestske-sluzby/dev/${slug}?${STEP_QUERY_PARAM_KEY}=${firstStepQueryParam}`)
  await waitForHydration(page)
  await expect(formContainer(page)).toBeVisible()
}

/**
 * Opens a real form instance through the public entry point.
 *
 * `/mestske-sluzby/{slug}` either redirects straight to a freshly created form or renders a landing
 * page with a CTA. The CTA is rendered twice — once per breakpoint, one of them hidden — so the
 * visible one is picked rather than the first in the DOM.
 *
 * A guest opening a form is greeted by the registration modal, which overlays the whole page and
 * swallows pointer events, so it is dismissed by default. `registracia-modal.spec.ts` opts out
 * because there the modal is the thing under test.
 */
export const openForm = async (
  page: Page,
  slug: string,
  { dismissRegistrationModal = true }: { dismissRegistrationModal?: boolean } = {},
) => {
  await page.goto(`/mestske-sluzby/${slug}`)
  await waitForHydration(page)

  const alreadyOnForm = new RegExp(`/mestske-sluzby/${slug}/[^/]+`)
  if (!alreadyOnForm.test(page.url())) {
    await page.locator('[data-cy=form-cta-button]').locator('visible=true').first().click()
    await page.waitForURL(alreadyOnForm)
  }

  await expect(formContainer(page)).toBeVisible()

  if (dismissRegistrationModal) {
    const registrationModal = page.locator('[data-cy=registration-modal]')
    if (await registrationModal.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await registrationModal.locator('[data-cy=close-modal]').click()
      await expect(registrationModal).toBeHidden()
    }
  }
}
