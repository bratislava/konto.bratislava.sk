import { expect, type Locator, type Page } from '@playwright/test'
import type { GenericObjectType, RJSFSchema } from '@rjsf/utils' with {
  'resolution-mode': 'import',
}
import type {
  SummaryJsonArray,
  SummaryJsonField,
  SummaryJsonStep,
} from 'forms-shared/summary-json/summaryJsonTypes'

import {
  allFields,
  buildPlan,
  isField,
  type PlanNode,
  STEP_QUERY_PARAM_KEY,
  STEP_QUERY_PARAM_VALUE_SUMMARY,
  stepProperty,
  stepQueryParams,
} from './plan'
import { addButton, arrayItems, continueButton, fieldRoot, summaryRow } from './selectors'
import type { FillOptions } from './types'
import {
  fillCheckbox,
  fillCheckboxGroup,
  fillDate,
  fillNumber,
  fillText,
  fillTextArea,
  fillTime,
  resolveWidgetKind,
  selectOption,
  selectRadio,
  stringDisplayValues,
  uploadFile,
} from './widgets'

const DEFAULT_FILE = 'assets/test.pdf'

const fillField = async (page: Page, field: SummaryJsonField, options: FillOptions) => {
  const root = fieldRoot(page, field.id)

  // A field can legitimately be absent: `customComponentsField` calculators render no control, and
  // the plan carries fields whose value is `undefined` for optional inputs.
  if ((await root.count()) === 0) {
    return
  }

  const kind = await resolveWidgetKind(root)

  // Optional fields appear in the plan with no value. Without this guard they would be filled with
  // the literal string "undefined" — which is exactly what the form then shows on the summary.
  const hasValue = field.value != null
  const isTextLike = kind === 'text' || kind === 'textarea' || kind === 'number'
  if (!hasValue && (isTextLike || kind === 'radio' || kind === 'date' || kind === 'time')) {
    return undefined
  }

  switch (kind) {
    case 'radio':
      return selectRadio(root, field.value)
    case 'select':
      return selectOption(root, field.displayValues)
    case 'checkbox':
      return fillCheckbox(root, field.value)
    case 'checkboxGroup':
      return fillCheckboxGroup(root, field.value)
    case 'file':
      // Only upload where the scenario actually has a file; an empty file field is a valid state.
      return Array.isArray(field.value) && field.value.length > 0
        ? uploadFile(root, options.files?.(field.id) ?? DEFAULT_FILE)
        : undefined
    case 'number':
      return fillNumber(root, field.value)
    case 'date':
      return fillDate(root, field.value)
    case 'time':
      return fillTime(root, field.value)
    case 'textarea':
      return fillTextArea(root, field.value)
    case 'text':
      return fillText(root, field.value)
    default:
      return undefined
  }
}

/**
 * Adds every item of an array before filling any of them.
 *
 * This is the second of the engine's two invariants and it exists to avoid the Cypress workaround:
 * that spec adds an item, fills it, adds the next, fills it, and then needs three undocumented
 * "clear and re-type" passes marked `// TODO duplicated code` to repair fields that lost their
 * value. RJSF remounts array items on add, which drops react-aria state that has not been committed
 * on blur — so adding first and filling afterwards removes the cause rather than patching the
 * symptom.
 *
 * Reads the current item count rather than assuming one, because `minItems` differs per array.
 */
const ensureArrayItems = async (page: Page, array: SummaryJsonArray) => {
  const root = fieldRoot(page, array.id)
  const items = arrayItems(root, array.id)
  const target = array.items.length

  for (let current = await items.count(); current < target; current += 1) {
    await addButton(root).click()
    await expect(items).toHaveCount(current + 1)
  }
}

const fillNodes = async (page: Page, nodes: PlanNode[], options: FillOptions) => {
  for (const node of nodes) {
    if (isField(node)) {
      await fillField(page, node, options)
      continue
    }

    await ensureArrayItems(page, node)

    for (const item of node.items) {
      await fillNodes(page, item.children, options)
    }
  }
}

/** Strips `sk-SK` group separators (including non-breaking spaces) and normalises the decimal mark. */
const normalizeNumeric = (value: string) => value.replace(/[\s  ]/g, '').replace(',', '.')

/**
 * Re-reads what was filled and reports drift instead of blindly re-typing it.
 *
 * The Cypress suite silently re-filled certain fields on every run. If a field reproducibly loses
 * its value that is an app bug, and the point of this pass is to make it visible: the mismatch is
 * repaired once so the run can continue, and reported through `onMismatch`.
 */
const verifyStep = async (page: Page, nodes: PlanNode[], options: FillOptions) => {
  const check = async (node: PlanNode): Promise<void> => {
    if (!isField(node)) {
      for (const item of node.items) {
        for (const child of item.children) {
          await check(child)
        }
      }

      return
    }

    const root = fieldRoot(page, node.id)
    if ((await root.count()) === 0) {
      return
    }

    const kind = await resolveWidgetKind(root)
    if (kind !== 'text' && kind !== 'number' && kind !== 'textarea') {
      return
    }

    const input = root.locator(kind === 'textarea' ? 'textarea' : 'input').first()
    const actual = await input.inputValue()
    const expected = String(node.value ?? '')

    if (expected === '') {
      return
    }

    // react-aria's NumberField reformats on blur into `sk-SK` — non-breaking-space group
    // separators and a decimal comma — so `25648` reads back as `25 648`. Compare numerically
    // rather than treating the app's own formatting as drift.
    const matches =
      kind === 'number'
        ? Number(normalizeNumeric(actual)) === Number(normalizeNumeric(expected))
        : actual === expected

    if (!matches) {
      options.onMismatch?.(node, actual, expected)
      await fillField(page, node, options)
    }
  }

  for (const node of nodes) {
    await check(node)
  }
}

const gotoNext = async (page: Page, expectedQueryParam: string) => {
  await continueButton(page).click()
  await expect(page).toHaveURL(new RegExp(`[?&]${STEP_QUERY_PARAM_KEY}=${expectedQueryParam}(&|$)`))
}

export type FillFormResult = {
  steps: SummaryJsonStep[]
  fields: SummaryJsonField[]
}

/**
 * Fills a whole form from its schema and example data and lands on the summary.
 *
 * Fields are filled in plan order, which is the first invariant: RJSF renders in `baOrder`, and the
 * generator always places a gate before what it gates (`vyplnitObject` before the step body,
 * `kalkulackaWrapper` before its branches). Filling in order therefore guarantees every conditional
 * field has been revealed by the time the engine reaches it.
 */
export const fillForm = async (
  page: Page,
  schema: RJSFSchema,
  formData: GenericObjectType,
  options: FillOptions = {},
): Promise<FillFormResult> => {
  const plan = buildPlan(schema, formData)
  const queryParams = stepQueryParams(schema)

  const targets = plan.steps.map((step) => queryParams[stepProperty(step)])
  targets.push(STEP_QUERY_PARAM_VALUE_SUMMARY)

  for (const [index, step] of plan.steps.entries()) {
    await expect(page).toHaveURL(
      new RegExp(`[?&]${STEP_QUERY_PARAM_KEY}=${targets[index]}(&|$)`),
      // The first step is reached by navigation, later ones by the previous iteration.
    )

    await fillNodes(page, step.children, options)
    await verifyStep(page, step.children, options)
    await gotoNext(page, targets[index + 1])
  }

  return { steps: plan.steps, fields: allFields(plan) }
}

/**
 * Asserts the summary shows what the plan says it should.
 *
 * `getSummaryJsonNode` is the same function the app calls in `getInitialSummaryJson`, so the plan is
 * a genuine oracle rather than a restatement of the test's own input. This replaces the Cypress
 * `summaryBorderFields` fixture — a hardcoded list of seven selectors asserted not to carry a CSS
 * class that no longer exists in the app, and therefore could never fail.
 */
export const expectSummaryMatchesPlan = async (page: Page, fields: SummaryJsonField[]) => {
  for (const field of fields) {
    const expected = stringDisplayValues(field.displayValues)
    if (expected.length === 0) {
      continue
    }

    const row: Locator = summaryRow(page, field.id)
    if ((await row.count()) === 0) {
      continue
    }

    for (const value of expected) {
      await expect(row).toContainText(value)
    }
  }
}
