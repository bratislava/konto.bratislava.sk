import { FormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { baGetDefaultFormStateStable } from 'forms-shared/form-utils/defaultFormState'
import memoize from 'lodash/memoize'

/**
 * Returns default form data for the given form definition.
 *
 * It is expensive to compute, so it is memoized.
 */
export const getDefaultFormDataForFormDefinition = memoize((formDefinition: FormDefinition) =>
  baGetDefaultFormStateStable(formDefinition.schemas.schema, {}),
)
