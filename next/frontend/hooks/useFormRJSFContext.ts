import { EFormValue } from '@backend/forms'
import { useState } from 'react'

import { InitialFormData } from '../../components/forms/useFormDataLoader'
import { FileScan, FormRJSFContext } from '../dtos/formStepperDto'

export const useFormRJSFContext = (
  eform: EFormValue,
  initialFormData: InitialFormData,
): FormRJSFContext => {
  const { formId, formUserExternalId } = initialFormData
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
