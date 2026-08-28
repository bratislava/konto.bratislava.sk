import type { Locator, Page } from '@playwright/test'

/**
 * Every widget in the app is wrapped in `<div id={rjsfFieldPathId}>`
 * (`next/src/components/widget-wrappers/WidgetWrapper.tsx`), and that id is exactly the `id` that
 * `getSummaryJson` reports for the field. That correspondence is the whole selector strategy:
 * every control is addressed by its schema path, never by a slugified Slovak label.
 *
 * Uses an attribute selector rather than `#id` so ids are never parsed as CSS.
 */
export const fieldRoot = (page: Page, id: string): Locator => page.locator(`[id="${id}"]`)

export const radioInput = (root: Locator, value: string): Locator =>
  root.locator(`input[type="radio"][value="${value}"]`)

export const checkboxOption = (root: Locator, value: string): Locator =>
  root.locator(`[data-cy="checkbox-${value}"]`)

/**
 * `BAArrayFieldTemplate` renders `{items}` before its own add button, so every nested array's
 * button appears earlier in document order than the outer array's. `.last()` inside the array's
 * own wrapper is therefore always that array's own add button — no `section-*` slugs needed.
 */
export const addButton = (root: Locator): Locator => root.locator('[data-cy=add-button]').last()

/**
 * Array items are tagged `section-{parentProperty}-{index}` by `BAArrayFieldItemTemplate`, where
 * `parentProperty` is the array's own property name — the last segment of its RJSF path.
 */
export const arrayItems = (root: Locator, arrayId: string): Locator => {
  const property = arrayId.split('_').pop()

  return root.locator(`[data-cy^="section-${property}-"]`)
}

/**
 * `FormControls` always renders both the desktop and the mobile button, hiding one with Tailwind.
 * Picking the visible one means no test ever needs to know which viewport it is running in — this
 * is what removes the `device` parameter that every Cypress custom command had to thread through.
 */
export const continueButton = (page: Page): Locator =>
  page.locator('[data-cy^=continue-button-]').locator('visible=true')

export const formContainer = (page: Page): Locator => page.locator('[data-cy=form-container]')

export const summaryRow = (page: Page, fieldId: string): Locator =>
  page.locator(`[data-cy="summary-row-${fieldId}"]`)
