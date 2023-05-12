import { EFormValue } from '@backend/forms'
import { useMemo } from 'react'

import { FormRJSFContext } from '../dtos/formStepperDto'

export const useFormRJSFContextMemo = (eform: EFormValue, formId?: string) => {
  return useMemo((): FormRJSFContext => {
    const { schema } = eform
    return {
      formId,
      pospId: schema.pospID,
      bucketFolderName:
        formId && schema?.pospID ? `/${String(schema.pospID)}/${formId}` : undefined,
      fileScans: []
    } as FormRJSFContext
  }, [eform, formId])
}
