import { expect, type Page } from '@playwright/test'

const formContainer = (page: Page) => page.locator('[data-cy=form-container]')

/**
 * Opens a real form instance through the public entry point.
 *
 * `/mestske-sluzby/{slug}` comes in two shapes and the difference is not knowable up front, so both
 * are raced rather than assumed:
 *  - **no landing page** — `getServerSideProps` creates a form and the page redirects to it
 *    client-side (it has to be client-side, so a new guest identity cookie can be saved);
 *  - **landing page** — a `form-cta-button` that creates the form when clicked. It is rendered twice,
 *    once per breakpoint with one hidden, so the visible one is picked rather than the first.
 *
 * A guest opening a form is greeted by the registration modal, which overlays the page and swallows
 * pointer events, so it is dismissed by default. `registration-modal.spec.ts` opts out because there
 * the modal is the thing under test.
 */
export const openForm = async (
  page: Page,
  slug: string,
  { dismissRegistrationModal = true }: { dismissRegistrationModal?: boolean } = {},
) => {
  const onFormInstance = new RegExp(`/mestske-sluzby/${slug}/[^/?#]+`)

  await page.goto(`/mestske-sluzby/${slug}`)

  const cta = page.locator('[data-cy=form-cta-button]').filter({ visible: true }).first()
  await Promise.race([
    page.waitForURL(onFormInstance, { timeout: 30_000 }).catch(() => {}),
    cta.waitFor({ state: 'visible', timeout: 30_000 }).catch(() => {}),
  ])

  if (!onFormInstance.test(page.url())) {
    if ((await cta.count()) === 0) {
      throw new Error(
        `Cannot open form "${slug}": /mestske-sluzby/${slug} neither redirected to a form ` +
          `instance nor rendered [data-cy=form-cta-button]. Either it has no form assigned in ` +
          `Strapi, or it still uses the older landing page without a CTA.`,
      )
    }

    await cta.click()
    await page.waitForURL(onFormInstance)
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
