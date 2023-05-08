import { EFormValue } from '@backend/forms'
import { useMemo } from 'react'

import { FormRJSFContext } from '../dtos/formStepperDto'

export const useFormRJSFContextMemo = (eform: EFormValue, formId?: string) => {
  return useMemo((): FormRJSFContext => {
    const { schema } = eform
    return {
      bucketFolderName:
        formId && schema?.pospID ? `/${String(schema.pospID)}/${formId}` : undefined,
      fileScans: []
    }
  }, [eform, formId])
}
