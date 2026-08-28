import { expect, type Locator } from '@playwright/test'
import {
  SummaryDisplayValueType,
  type SummaryDisplayValues,
} from 'forms-shared/summary-json/getSummaryDisplayValue'

import { checkboxOption, radioInput } from './selectors'
import type { WidgetKind } from './types'

/**
 * Resolves which control the app rendered inside a field wrapper.
 *
 * One `evaluate` per field. Order matters: a single boolean checkbox is rendered through
 * `CheckboxGroup` (see `CheckboxWidgetRJSF.tsx`), so it also matches `checkbox-group-*` and must be
 * detected first via its `checkbox-true` option.
 */
export const resolveWidgetKind = (root: Locator): Promise<WidgetKind> =>
  root.evaluate((element): WidgetKind => {
    if (element.querySelector('input[type="radio"]')) return 'radio'
    if (element.querySelector('[data-cy^="select-"]')) return 'select'
    if (element.querySelector('input[type="file"]')) return 'file'
    if (element.querySelector('[data-cy="checkbox-true"]')) return 'checkbox'
    if (element.querySelector('[data-cy^="checkbox-group-"]')) return 'checkboxGroup'
    if (element.querySelector('[data-cy^="datepicker-"]')) return 'date'
    if (element.querySelector('[data-cy^="timefield-"]')) return 'time'
    if (element.querySelector('textarea')) return 'textarea'
    if (element.querySelector('[data-cy^="number-"]')) return 'number'
    if (element.querySelector('input')) return 'text'

    return 'unknown'
  })

/** The resolved option labels, which is what a `select` has to be driven by. */
export const stringDisplayValues = (displayValues: SummaryDisplayValues): string[] =>
  displayValues
    .filter((value) => value.type === SummaryDisplayValueType.String)
    .map((value) => (value as { value: string }).value)

/**
 * react-aria commits a field's value on blur. The Cypress suite handled that with ~40 scattered
 * `cy.focused().blur()` calls; here it happens once, inside the adapter, so no spec ever mentions
 * it.
 */
const fillAndCommit = async (input: Locator, value: string) => {
  await input.fill(value)
  await input.blur()
}

export const fillText = (root: Locator, value: unknown) =>
  fillAndCommit(root.locator('input').first(), String(value))

export const fillTextArea = (root: Locator, value: unknown) =>
  fillAndCommit(root.locator('textarea').first(), String(value))

/**
 * Uses the raw value, never `displayValues`: `getSummaryDisplayValues` formats numbers with
 * `Intl.NumberFormat('sk-SK')`, which inserts non-breaking-space group separators that cannot be
 * typed back in. Non-integers use the Slovak decimal comma.
 */
export const fillNumber = (root: Locator, value: unknown) => {
  const text =
    typeof value === 'number' && !Number.isInteger(value)
      ? String(value).replace('.', ',')
      : String(value)

  return fillAndCommit(root.locator('input').first(), text)
}

/**
 * Selects by the schema enum value, not by the Slovak option label.
 *
 * `RadioGroupWidgetRJSF` passes the enum value straight through to the input's `value` attribute
 * (booleans stringified), and react-aria renders a real, visible `<input type=radio>`. That is what
 * lets the engine avoid `radio-group-<slugified Slovak label>` selectors entirely.
 */
export const selectRadio = async (root: Locator, value: unknown) => {
  const input = radioInput(root, String(value))

  // `check()` on the input itself fails: react-aria renders the visible radio as a styled `div`
  // sibling that sits on top of the input and swallows pointer events. Clicking the enclosing
  // label is both what a real user does and what react-aria listens for.
  await root.locator(`label:has(input[type="radio"][value="${String(value)}"])`).click()
  await expect(input).toBeChecked()
}

/**
 * react-select. The one place a Slovak label is genuinely required — there is no native input
 * carrying the value. The label comes from the schema's `enumMetadata` via `displayValues`, so it
 * is still schema-derived and never hand-translated.
 *
 * Matching is exact. The Cypress version appended separators (`druhPozemku + ' – '`,
 * `predmetDane + ') '`) to force `.contains()` substring matches against code-prefixed labels;
 * exact matching removes those hacks and the latent `Nové Mesto` / `Nové Mesto nad Váhom` ambiguity.
 */
export const selectOption = async (root: Locator, displayValues: SummaryDisplayValues) => {
  const [label] = stringDisplayValues(displayValues)
  if (label == null) {
    return
  }

  const control = root.locator('[data-cy^="select-"]').first()
  await control.click()
  // `stat` and `kataster` have hundreds of options; typing filters the list before we pick.
  await control.locator('input').first().fill(label)
  await control.getByRole('option', { name: label, exact: true }).first().click()
}

/**
 * Toggles only on mismatch, which is load-bearing rather than defensive: `pouzitKalkulacku`
 * defaults to `true` in `kalkulacky.ts`, so blind clicking would invert it. The Cypress
 * `useCalculator` command only got this right by hardcoding `if (!useCalculator) click()`.
 */
const setCheckbox = async (option: Locator, shouldBeChecked: boolean) => {
  const input = option.locator('input').first()
  const isChecked = await input.isChecked()

  if (isChecked !== shouldBeChecked) {
    await option.click()
  }
}

export const fillCheckbox = (root: Locator, value: unknown) =>
  setCheckbox(checkboxOption(root, 'true'), value === true)

export const fillCheckboxGroup = async (root: Locator, value: unknown) => {
  const selected = Array.isArray(value) ? (value as string[]) : []
  const options = root.locator('[data-cy^="checkbox-"]')
  const count = await options.count()

  for (let index = 0; index < count; index += 1) {
    const option = options.nth(index)
    const dataCy = await option.getAttribute('data-cy')
    const optionValue = dataCy?.replace(/^checkbox-/, '')

    if (optionValue != null) {
      await setCheckbox(option, selected.includes(optionValue))
    }
  }
}

/**
 * react-aria renders dates as separate `[role=spinbutton]` segments, so `fill()` does not work.
 * Drives them by typing into the segments in DOM order, which for `sk-SK` is day, month, year.
 */
export const fillDate = async (root: Locator, value: unknown) => {
  if (typeof value !== 'string') {
    return
  }

  const [year, month, day] = value.split('-')
  const segments = root.locator('[data-cy^="date-time-"]')

  for (const [dataCy, segmentValue] of [
    ['date-time-day', day],
    ['date-time-month', month],
    ['date-time-year', year],
  ] as const) {
    const segment = segments.and(root.locator(`[data-cy="${dataCy}"]`)).first()
    if ((await segment.count()) > 0 && segmentValue) {
      await segment.click()
      await segment.pressSequentially(segmentValue)
    }
  }
}

export const fillTime = async (root: Locator, value: unknown) => {
  if (typeof value !== 'string') {
    return
  }

  const [hour, minute] = value.split(':')
  for (const [dataCy, segmentValue] of [
    ['date-time-hour', hour],
    ['date-time-minute', minute],
  ] as const) {
    const segment = root.locator(`[data-cy="${dataCy}"]`).first()
    if ((await segment.count()) > 0 && segmentValue) {
      await segment.click()
      await segment.pressSequentially(segmentValue)
    }
  }
}

/**
 * The one thing the schema cannot drive: the plan's value is a server-side file UUID that has no
 * local counterpart, so the caller injects a real path.
 *
 * Scoped to the field's own wrapper. The Cypress spec scoped `[data-cy=file-input]` to the whole
 * step (`formRealEstateTaxReturn.cy.ts:459,665`), so it attached to whichever file input happened
 * to come first regardless of which `priznanie` it belonged to.
 */
/**
 * The messages `UploadFileCard` shows while an upload is still in flight.
 *
 * `UploadFileCard` has no test attribute and distinguishes its states only by Tailwind classes, so
 * these messages are the one signal that is both stable and user-visible: the done state renders
 * none of them. Kept in sync with `UploadFileCard.messages.*` in
 * `next/public/locales/sk/translation.json`.
 */
const UPLOAD_IN_PROGRESS_MESSAGES = [
  'Čaká sa na nahratie',
  'Nahráva sa',
  'Čaká na antivírovú kontrolu',
  'Prebieha antivírová kontrola',
]

export const uploadFile = async (root: Locator, path: string) => {
  await root.locator('input[type="file"]').first().setInputFiles(path)

  const fileName = path.split(/[\\/]/).pop() ?? path
  await expect(root.getByText(fileName, { exact: false }).first()).toBeVisible({ timeout: 30_000 })

  // The antivirus scan runs server-side, so settling can take a while.
  for (const message of UPLOAD_IN_PROGRESS_MESSAGES) {
    await expect(root.getByText(message, { exact: false })).toHaveCount(0, { timeout: 60_000 })
  }
}
