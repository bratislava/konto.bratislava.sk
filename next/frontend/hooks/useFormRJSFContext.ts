import { EFormValue } from '@backend/forms'
import { useState } from 'react'

import { FileScan, FormRJSFContext } from '../dtos/formStepperDto'
import { FormFiller } from './useFormFiller'

export const useFormRJSFContext = (eform: EFormValue, formFiller: FormFiller): FormRJSFContext => {
  const { formId, formUserExternalId } = formFiller
  const { schema } = eform
  const [fileScans, setFileScans] = useState<FileScan[]>([])

  return {
    formId,
    pospId: schema.pospID,
    userExternalId: formUserExternalId,
    bucketFolderName: formId && schema?.pospID ? `/${String(schema.pospID)}/${formId}` : undefined,
    fileScans,
    setFileScans,
  } as FormRJSFContext
}
