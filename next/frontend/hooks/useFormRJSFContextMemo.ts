import { EFormValue } from '@backend/forms'
import { useMemo } from 'react'

import { FormRJSFContext } from '../dtos/formStepperDto'
import { FormFiller } from './useFormFiller'

export const useFormRJSFContextMemo = (eform: EFormValue, formFiller: FormFiller,): FormRJSFContext => {
  const { formId, formUserExternalId } = formFiller

  return useMemo((): FormRJSFContext => {
    const { schema } = eform

    console.log("schema pospId:", schema.pospID)
    console.log("formId:", formId)

    return {
      formId,
      pospId: schema.pospID,
      userExternalId: formUserExternalId,
      bucketFolderName:
        formId && schema?.pospID ? `/${String(schema.pospID)}/${formId}` : undefined,
      fileScans: []
    } as FormRJSFContext
  }, [eform, formId, formUserExternalId])
}
