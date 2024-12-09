import { FormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { baGetDefaultFormStateStable } from 'forms-shared/form-utils/defaultFormState'
import { createSingleUseValidatorRegistry } from 'forms-shared/form-utils/validatorRegistry'
import memoize from 'lodash/memoize'

const validatorRegistry = createSingleUseValidatorRegistry()

/**
 * Returns default form data for the given form definition.
 *
 * It is expensive to compute, so it is memoized.
 */
export const getDefaultFormDataForFormDefinition = memoize((formDefinition: FormDefinition) =>
  baGetDefaultFormStateStable(formDefinition.schema, {}, validatorRegistry),
)
