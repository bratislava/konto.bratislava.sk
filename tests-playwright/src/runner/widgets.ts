import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

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
 * The file uuids a field's display values reference.
 *
 * The summary JSON deliberately carries only ids — a file's name is runtime state on the form, not
 * a function of schema plus form data, so every consumer (`renderXmlSummary`, `SummaryEmail`,
 * `SummaryPdf`) takes a separate `fileInfos` map keyed by uuid. The tests resolve the same way,
 * through `ExampleForm.serverFiles`.
 */
export const fileDisplayValueIds = (displayValues: SummaryDisplayValues): string[] =>
  displayValues
    .filter((value) => value.type === SummaryDisplayValueType.File)
    .map((value) => (value as { id: string }).id)

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
 * react-select, single or multiple. The one place a Slovak label is genuinely required — there is no
 * native input carrying the value. The labels come from the schema's `enumMetadata` via
 * `displayValues`, so they are still schema-derived and never hand-translated.
 *
 * Every display value is selected, not just the first: `selectMultiple` fields such as
 * `stavba.katastralneUzemia` carry several. `SelectField` passes `closeMenuOnSelect={!isMulti}`, so
 * the menu stays open between picks on a multi-select and must only be re-opened when it closed.
 *
 * Matching is exact. The Cypress version appended separators (`druhPozemku + ' – '`,
 * `predmetDane + ') '`) to force `.contains()` substring matches against code-prefixed labels;
 * exact matching removes those hacks and the latent `Nové Mesto` / `Nové Mesto nad Váhom` ambiguity.
 */
export const selectOption = async (root: Locator, displayValues: SummaryDisplayValues) => {
  const labels = stringDisplayValues(displayValues)
  if (labels.length === 0) {
    return
  }

  const control = root.locator('[data-cy^="select-"]').first()
  const search = control.locator('input').first()

  for (const label of labels) {
    // `stat` and `kataster` have hundreds of options; typing filters the list before we pick.
    if ((await control.getByRole('option').count()) === 0) {
      await control.click()
    }
    await search.fill(label)
    await control.getByRole('option', { name: label, exact: true }).first().click()
  }

  // A multi-select keeps its menu open after a pick, and an open option list overlays whatever
  // comes next — which showed up as the *following* select being unclickable.
  if (await control.getByRole('option').count()) {
    await search.press('Escape')
    await expect(control.getByRole('option')).toHaveCount(0)
  }
}

/**
 * Whether every control in the field is disabled.
 *
 * Some fields are derived rather than entered (e.g. `nadoba.objemNadoby`, whose react-select input
 * renders `disabled`). They still appear in the plan with a value, so without this guard the engine
 * waits out the full timeout trying to fill something the user cannot touch.
 */
export const isFieldDisabled = (root: Locator): Promise<boolean> =>
  root.evaluate((element) => {
    const controls = element.querySelectorAll('input, textarea, select')

    return (
      controls.length > 0 &&
      Array.from(controls).every((control) => (control as HTMLInputElement).disabled)
    )
  })

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

/**
 * Assets offered to file fields. The plan cannot supply these: its value is a server-side file uuid
 * with no local counterpart.
 */
const FILE_ASSETS = [
  { path: 'test.pdf', extension: '.pdf', mime: 'application/pdf' },
  { path: 'test.png', extension: '.png', mime: 'image/png' },
] as const

const assetPath = (asset: (typeof FILE_ASSETS)[number]) =>
  resolve(__dirname, '../../assets', asset.path)

/**
 * Picks the asset to stand in for one of the example's files.
 *
 * The example's own file name wins, because it states the intent: `nahlaseniePodnetu` declares
 * `fotografia-podnetu.jpg` and its field only accepts `.jpg,.jpeg,.png`, so handing it a PDF leaves
 * the form invalid — which surfaced only as an error alert on the summary, far from the cause.
 * `accept` is the fallback for files the example does not name.
 */
const assetFor = (fileName: string | undefined, accept: string | null) => {
  const byName = fileName
    ? FILE_ASSETS.find((asset) => fileName.toLowerCase().endsWith(asset.extension))
    : undefined
  if (byName) {
    return byName
  }

  const allowed = (accept ?? '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)

  const byAccept = FILE_ASSETS.find((asset) =>
    allowed.some(
      (entry) =>
        entry === asset.extension ||
        entry === asset.mime ||
        (entry.endsWith('/*') && asset.mime.startsWith(entry.slice(0, -1))),
    ),
  )

  return byAccept ?? FILE_ASSETS[0]
}

/**
 * Uploads one file per file reference the example holds.
 *
 * Both parts matter. Uploading a *single* file regardless of how many the example declares silently
 * under-tested `prilohy.projektovaDokumentacia` and `informacieODovoze.fotoOdpadu`, which each
 * expect two — the field is valid with one, so nothing failed. And reusing the example's file names
 * keeps the uploaded files distinguishable, which is what makes the per-file wait below meaningful;
 * two files both called `test.pdf` would be indistinguishable in the UI.
 *
 * Scoped to the field's own wrapper. The Cypress spec scoped `[data-cy=file-input]` to the whole
 * step (`formRealEstateTaxReturn.cy.ts:459,665`), so it attached to whichever file input happened
 * to come first regardless of which `priznanie` it belonged to.
 */
export const uploadFile = async (
  root: Locator,
  fileNames: (string | undefined)[],
  override?: string,
) => {
  const input = root.locator('input[type="file"]').first()

  if (override) {
    await input.setInputFiles(override)
  } else {
    const accept = await input.getAttribute('accept')
    const payloads = fileNames.map((fileName, index) => {
      const asset = assetFor(fileName, accept)

      return {
        name: fileName ?? `test-${index + 1}${asset.extension}`,
        mimeType: asset.mime,
        buffer: readFileSync(assetPath(asset)),
      }
    })

    await input.setInputFiles(payloads)

    for (const payload of payloads) {
      await expect(root.getByText(payload.name, { exact: false }).first()).toBeVisible({
        timeout: 30_000,
      })
    }
  }

  // The antivirus scan runs server-side, so settling can take a while.
  for (const message of UPLOAD_IN_PROGRESS_MESSAGES) {
    await expect(root.getByText(message, { exact: false })).toHaveCount(0, { timeout: 60_000 })
  }
}
