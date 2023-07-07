import { FormDefinition } from '@backend/forms/types'
import { formsApi } from '@clients/forms'
import { GetFormResponseDto } from '@clients/openapi-forms'
import { getAccessTokenOrLogout } from 'frontend/utils/auth'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useMemo, useState } from 'react'
import { useEffectOnce } from 'usehooks-ts'

import useSnackbar from '../../frontend/hooks/useSnackbar'
import { getInitFormData } from '../../frontend/utils/formStepper'
import logger from '../../frontend/utils/logger'

export type InitialFormData = {
  formDataJson: object
  formUserExternalId: string
  formId: string
}

/**
 * Temporary hook that loads the initial form data based on if it's a new form or an existing one.
 * After auth is refactored it needs to be moved to a server side.
 *
 * TODO: Remove after auth refactor.
 */
export const useFormDataLoader = (formDefinition: FormDefinition) => {
  const router = useRouter()
  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const { t } = useTranslation('forms')
  const [responseData, setResponseData] = useState<GetFormResponseDto | null>(null)

  const queryId =
    router.query.id && typeof router.query.id === 'string' ? router.query.id : undefined

  useEffectOnce(() => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const load = async () => {
      const token = await getAccessTokenOrLogout()
      const loadPromise = queryId
        ? () =>
            formsApi.nasesControllerGetForm(queryId, {
              accessToken: token,
            })
        : () =>
            formsApi.nasesControllerCreateForm(
              {
                pospID: formDefinition.schema.pospID,
                pospVersion: formDefinition.schema.pospVersion,
                messageSubject: formDefinition.schema.pospID,
                isSigned: false,
                formName: formDefinition.schema.title || formDefinition.schema.pospID,
                fromDescription: formDefinition.schema.description || formDefinition.schema.pospID,
              },
              { accessToken: token },
            )

      try {
        const response = await loadPromise()
        setResponseData(response.data)
      } catch (error) {
        logger.error('Init FormData failed', error)
        openSnackbarError(t('errors.form_init'))
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load()
  })

  const formDataJson = useMemo(() => {
    if (responseData == null) {
      return null
    }
    return queryId ? responseData.formDataJson : getInitFormData(formDefinition.schema)
  }, [formDefinition.schema, queryId, responseData])

  if (responseData !== null) {
    return {
      formDataJson: formDataJson as object,
      formUserExternalId: responseData.userExternalId,
      formId: responseData.id,
    } as InitialFormData
  }
  return null
}
