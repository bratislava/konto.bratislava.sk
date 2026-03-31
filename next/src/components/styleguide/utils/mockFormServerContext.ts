import { getFormDefinitionBySlugDev } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { VersionCompareContinueAction } from 'forms-shared/versioning/version-compare'

import { makeClientFormDefinition } from '@/src/components/forms/clientFormDefinitions'
import type { FormServerContext } from '@/src/components/forms/useFormContext'
import { getDefaultFormDataForFormDefinition } from '@/src/frontend/utils/getDefaultFormDataForFormDefinition'

/**
 * Returns a mock FormServerContext for use in styleguide or other contexts
 * that need form context without real server data. Uses the "showcase" dev form.
 */
export const mockFormServerContext = (): FormServerContext => {
  const SHOWCASE_SLUG = 'showcase'
  const serverFormDefinition = getFormDefinitionBySlugDev(SHOWCASE_SLUG)
  if (!serverFormDefinition) {
    throw new Error(
      `mockFormServerContext: form "${SHOWCASE_SLUG}" not found. Ensure dev form definitions are available.`,
    )
  }

  return {
    formDefinition: makeClientFormDefinition(serverFormDefinition),
    formId: '',
    initialFormDataJson: getDefaultFormDataForFormDefinition(serverFormDefinition),
    initialServerFiles: [],
    initialSignature: null,
    initialSummaryJson: null,
    initialFormSent: false,
    formMigrationRequired: false,
    isEmbedded: false,
    isDevRoute: true,
    strapiForm: { documentId: '', slug: SHOWCASE_SLUG },
    versionCompareContinueAction: VersionCompareContinueAction.None,
  }
}
