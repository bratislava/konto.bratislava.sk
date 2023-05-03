import { EFormValue } from '@backend/forms'
import { useMemo } from 'react'

export const useFormRJSFContextMemo = (eform: EFormValue, formId?: string) => {
  return useMemo(() => {
    const { schema } = eform
    return {
      bucketFolderName:
        formId && schema?.pospID ? `/${String(schema.pospID)}/${formId}` : undefined,
    }
  }, [eform, formId])
}
