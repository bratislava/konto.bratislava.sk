import type { GenericObjectType, RJSFSchema } from '@rjsf/utils' with {
  'resolution-mode': 'import',
}
import { createSingleUseValidatorRegistry } from 'forms-shared/form-utils/validatorRegistry'
import { SummaryDisplayValueType } from 'forms-shared/summary-json/getSummaryDisplayValue'
import { getSummaryJsonNode } from 'forms-shared/summary-json/getSummaryJsonNode'
import type {
  SummaryJsonArray,
  SummaryJsonField,
  SummaryJsonForm,
  SummaryJsonStep,
} from 'forms-shared/summary-json/summaryJsonTypes'
import { SummaryJsonType } from 'forms-shared/summary-json/summaryJsonTypes'

export const STEP_QUERY_PARAM_KEY = 'krok'
/** Mirrors `next/src/frontend/utils/formState.ts`. */
export const STEP_QUERY_PARAM_VALUE_SUMMARY = 'sumar'

/**
 * Builds the fill plan by rendering the form through the same RJSF pipeline the app uses.
 *
 * This is the core of the migration. `getSummaryJsonNode` resolves the schema against the data, so
 * the returned tree already accounts for every conditional in the schema:
 *
 *  - `vyplnitObject.vyplnit` gates — a step answered "nie" contains only that radio,
 *  - `kalkulackaWrapper.pouzitKalkulacku` branches — the calculator and non-calculator field sets
 *    are completely different, and the data picks one,
 *  - value-dependent fields such as `hodnotaUrcenaZnaleckymPosudkom` for `druhPozemku` D and G,
 *  - conditional steps: `bezpodieloveSpoluvlastnictvoManzelov` is simply absent from `steps` when
 *    no `priznanie` uses that co-ownership type.
 *
 * The Cypress spec reimplemented all of this by hand — including branching every step-index
 * assertion on whether the spouse step exists. None of that logic is needed here.
 */
export const buildPlan = (schema: RJSFSchema, formData: GenericObjectType): SummaryJsonForm =>
  getSummaryJsonNode({
    schema,
    formData,
    validatorRegistry: createSingleUseValidatorRegistry(),
  })

export type PlanNode = SummaryJsonField | SummaryJsonArray

export const isField = (node: PlanNode): node is SummaryJsonField =>
  node.type === SummaryJsonType.Field

export const isArray = (node: PlanNode): node is SummaryJsonArray =>
  node.type === SummaryJsonType.Array

/** `SummaryJsonStep.id` is `root_<stepProperty>` (see `getObjectFieldInfo`). */
export const stepProperty = (step: SummaryJsonStep): string => step.id.replace(/^root_/, '')

/**
 * Reads `stepQueryParam` straight off the raw schema, keyed by step property.
 *
 * `step()` in `forms-shared/src/generator/functions/step.ts` stores it under
 * `properties[property].baUiSchema['ui:options']`, defaulting to
 * `kebabCase(stepperTitle ?? title)`. Because the plan already tells us which steps exist for this
 * data, no RJSF evaluation is needed here — a lookup table is enough.
 */
export const stepQueryParams = (schema: RJSFSchema): Record<string, string> => {
  const result: Record<string, string> = {}

  const steps = Array.isArray(schema.allOf) ? schema.allOf : []
  steps.forEach((entry) => {
    if (typeof entry === 'boolean') {
      return
    }

    // `conditionalStep` wraps the step as `{ if: condition, then: stepSchema }`, so the properties
    // of a conditional step (here: `bezpodieloveSpoluvlastnictvoManzelov`) live one level deeper.
    const step = typeof entry.then === 'object' ? entry.then : entry
    if (!step.properties) {
      return
    }

    Object.entries(step.properties).forEach(([property, stepSchema]) => {
      if (typeof stepSchema === 'boolean') {
        return
      }

      const queryParam = (stepSchema as GenericObjectType).baUiSchema?.['ui:options']
        ?.stepQueryParam

      if (typeof queryParam === 'string') {
        result[property] = queryParam
      }
    })
  })

  return result
}

/**
 * Whether this scenario uploads a file, and therefore needs a real form instance.
 *
 * The dev preview route has no backend (`formId: ''`), so uploads cannot complete there. Every
 * other part of the form works, so scenarios are routed per-example rather than forcing the whole
 * matrix onto the slower, state-creating path.
 */
export const requiresBackend = (form: SummaryJsonForm): boolean =>
  allFields(form).some((field) =>
    field.displayValues.some((value) => value.type === SummaryDisplayValueType.File),
  )

/** Every field in the plan, flattened depth-first — used for the summary assertions. */
export const allFields = (form: SummaryJsonForm): SummaryJsonField[] => {
  const collected: SummaryJsonField[] = []

  const walk = (nodes: PlanNode[]) => {
    nodes.forEach((node) => {
      if (isField(node)) {
        collected.push(node)

        return
      }

      node.items.forEach((item) => walk(item.children))
    })
  }

  form.steps.forEach((step) => walk(step.children))

  return collected
}
