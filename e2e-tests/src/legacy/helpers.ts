import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { expect, type Locator, type Page } from '@playwright/test'

/**
 * Interaction helpers for the legacy specs.
 *
 * Deliberately dumb: every function takes an explicit RJSF field id and does one thing. Nothing here
 * reads a schema, resolves a widget type or builds a plan — a spec reads as a literal description of
 * what a person does on the page, and that is the whole design.
 *
 * The one non-obvious rule: anchor on the *wrapper*. `WidgetWrapper` renders `<div id="root_…">` and
 * the `<input>` inside does not carry that id, so every field is located by its wrapper id and
 * descended into. The control's own `data-cy` is `input-<full RJSF id>`, because
 * `mapRjsfToReactAriaProps` sets `name: props.id`.
 */

/** The field's wrapper element. Attribute selector, so ids are never parsed as CSS. */
export const field = (page: Page, id: string): Locator => page.locator(`[id="${id}"]`)

/**
 * Types a value and commits it — react-aria only commits on blur.
 *
 * Non-integer numbers are typed with a decimal comma: the app runs in `sk-SK`, so react-aria's
 * NumberField parses `18,51` and rejects `18.51`, which silently leaves the field empty and blocks
 * the step.
 */
export const fillIn = async (page: Page, id: string, value: string | number) => {
  const text =
    typeof value === 'number' && !Number.isInteger(value)
      ? String(value).replace('.', ',')
      : String(value)

  const input = field(page, id).locator('input, textarea').first()
  await input.fill(text)
  await input.blur()
}

/**
 * Selects a radio by its schema enum value. Boolean schemas render `"true"` / `"false"`.
 *
 * Clicks the enclosing `label`: react-aria draws the visible control as a styled `div` on top of the
 * input, which swallows pointer events, so clicking the input itself fails actionability.
 */
export const pickRadio = async (page: Page, id: string, value: string | boolean) => {
  const wanted = String(value)
  const input = field(page, id).locator(`input[type="radio"][value="${wanted}"]`)

  await field(page, id).locator(`label:has(input[type="radio"][value="${wanted}"])`).click()
  await expect(input, `${id} = ${wanted}`).toBeChecked()
}

/**
 * Picks one option in a react-select by its visible label.
 *
 * There is no native value to set, so the label is the only handle. Typing filters first because
 * `stat` and `kataster` have hundreds of options.
 */
export const pickSelect = async (page: Page, id: string, label: string) => {
  const control = field(page, id).locator('[data-cy^="select-"]').first()

  await control.click()
  await control.locator('input').first().fill(label)
  await control.getByRole('option', { name: label, exact: true }).first().click()
}

/**
 * Picks several options in a multi-select.
 *
 * `SelectField` passes `closeMenuOnSelect={!isMulti}`, so the menu stays open between picks and must
 * be closed at the end — an open option list overlays whatever field comes next.
 */
export const pickSelectMultiple = async (page: Page, id: string, labels: string[]) => {
  const control = field(page, id).locator('[data-cy^="select-"]').first()
  const search = control.locator('input').first()

  for (const label of labels) {
    if ((await control.getByRole('option').count()) === 0) {
      await control.click()
    }
    await search.fill(label)
    await control.getByRole('option', { name: label, exact: true }).first().click()
  }

  await search.press('Escape')
  await expect(control.getByRole('option')).toHaveCount(0)
}

/**
 * Sets a checkbox, reading its current state first.
 *
 * Not defensiveness: `pouzitKalkulacku` defaults to `true`, and a blind click would silently switch
 * the step to the entirely different non-calculator field set.
 */
export const setCheckbox = async (
  page: Page,
  id: string,
  checked: boolean,
  optionValue = 'true',
) => {
  const option = field(page, id).locator(`[data-cy="checkbox-${optionValue}"]`)

  if ((await option.locator('input').first().isChecked()) !== checked) {
    await option.click()
  }
}

/** Drives a react-aria date picker segment by segment; `fill()` does not work on them. */
export const pickDate = async (page: Page, id: string, isoDate: string) => {
  const [year, month, day] = isoDate.split('-')

  for (const [segment, value] of [
    ['date-time-day', day],
    ['date-time-month', month],
    ['date-time-year', year],
  ] as const) {
    const locator = field(page, id).locator(`[data-cy="${segment}"]`).first()
    await locator.click()
    await locator.pressSequentially(value)
  }
}

/** Messages `UploadFileCard` shows while an upload is in flight; the done state shows none of them. */
const UPLOAD_IN_PROGRESS = [
  'Čaká sa na nahratie',
  'Nahráva sa',
  'Čaká na antivírovú kontrolu',
  'Prebieha antivírová kontrola',
]

/**
 * Uploads one file per given name, all using the same local PDF.
 *
 * Names matter: a field expecting two files is *valid with one*, so uploading two identically-named
 * files would be indistinguishable in the UI and the case would go unnoticed. None of the forms
 * covered here restricts `accept`, so a PDF is always acceptable.
 */
export const attachFiles = async (page: Page, id: string, fileNames: string[]) => {
  const buffer = readFileSync(resolve(__dirname, '../../assets/test.pdf'))
  const input = field(page, id).locator('input[type="file"]').first()

  await input.setInputFiles(
    fileNames.map((name) => ({ name, mimeType: 'application/pdf', buffer })),
  )

  for (const name of fileNames) {
    await expect(field(page, id).getByText(name, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    })
  }

  // The antivirus scan is server-side.
  for (const message of UPLOAD_IN_PROGRESS) {
    await expect(field(page, id).getByText(message, { exact: false })).toHaveCount(0, {
      timeout: 60_000,
    })
  }
}

/**
 * `FormControls` always renders both the desktop and the mobile button, hiding one with Tailwind.
 * Picking the visible one means no test ever needs to know which viewport it is running in.
 */
export const continueButton = (page: Page): Locator =>
  page.locator('[data-cy^=continue-button-]').filter({ visible: true })

/** The form itself, as opposed to the page around it. Visible once RJSF has rendered a step. */
export const formContainer = (page: Page): Locator => page.locator('[data-cy=form-container]')

/**
 * A summary row, addressed by the same RJSF id as the field it summarises — `SummaryRow` is keyed on
 * the field path, so the summary needs no separate vocabulary.
 */
export const summaryRow = (page: Page, fieldId: string): Locator =>
  page.locator(`[data-cy="summary-row-${fieldId}"]`)

/**
 * Jumps straight to a step through the stepper. The mobile layout collapses it into a dropdown that
 * has to be opened first; the desktop one lists the steps inline.
 */
export const openStep = async (page: Page, index: number) => {
  const dropdown = page.locator('[data-cy=stepper-dropdown]')
  if (await dropdown.isVisible().catch(() => false)) {
    await dropdown.click()
  }

  await page
    .locator('[data-cy=stepper-desktop], [data-cy=stepper-mobile]')
    .locator(`[data-cy=stepper-step-${index}]`)
    .filter({ visible: true })
    .first()
    .click()
}

/** Submits the step and asserts the form moved to the expected `krok`. */
export const continueTo = async (page: Page, krok: string) => {
  await continueButton(page).click()
  await expect(page, `advance to krok=${krok}`).toHaveURL(new RegExp(`[?&]krok=${krok}(&|$)`))
}

/**
 * Submits an incomplete step and asserts it was rejected.
 *
 * Takes the ids expected to error, so a failure names the field. Counting flagged fields instead
 * would break on any schema change and would not say which one was at fault.
 */
export const expectStepRejected = async (page: Page, krok: string, fieldIds: string[]) => {
  await continueButton(page).click()

  await expect(page, `krok=${krok} must not advance`).toHaveURL(new RegExp(`[?&]krok=${krok}(&|$)`))

  for (const id of fieldIds) {
    await expect(
      field(page, id).locator('[data-cy=error-message]'),
      `${id} must report an error`,
    ).toBeVisible()
  }
}

/** Asserts a summary row contains the given text. */
export const expectSummaryRow = async (page: Page, id: string, text: string) => {
  await expect(summaryRow(page, id), id).toContainText(text)
}

/** Asserts no field on the summary is flagged invalid. */
export const expectSummaryWithoutErrors = async (page: Page) => {
  await expect(page.locator('[data-cy^=summary-row-].border-red-500')).toHaveCount(0, {
    timeout: 30_000,
  })
}
