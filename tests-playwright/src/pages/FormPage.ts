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
 * page with a CTA. The CTA carries no test attribute and its label comes from Strapi
 * (`FormCtaButton.tsx`), so we match on the accessible name and fall back to the default label.
 */
export const openForm = async (page: Page, slug: string, ctaLabel = 'Vyplniť formulár') => {
  await page.goto(`/mestske-sluzby/${slug}`)
  await waitForHydration(page)

  const alreadyOnForm = new RegExp(`/mestske-sluzby/${slug}/[^/]+`)
  if (!alreadyOnForm.test(page.url())) {
    await page.getByRole('button', { name: ctaLabel }).locator('visible=true').first().click()
    await page.waitForURL(alreadyOnForm)
  }

  await expect(formContainer(page)).toBeVisible()
}
