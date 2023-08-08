import { formsApi } from '@clients/forms'
import { UpdateFormRequestDto } from '@clients/openapi-forms'
import { useTranslation } from 'next-i18next'
import { ChangeEvent } from 'react'

import { useFormState } from '../../components/forms/FormStateProvider'
import { readTextFile } from '../utils/file'
import { downloadBlob } from '../utils/general'
import useSnackbar from './useSnackbar'

export const useFormExportImport = () => {
  const { formId, formData, formSlug, setImportedFormData } = useFormState()
  const { t } = useTranslation('forms')

  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const [openSnackbarSuccess] = useSnackbar({ variant: 'success' })
  const [openSnackbarInfo, closeSnackbarInfo] = useSnackbar({ variant: 'info' })

  const exportXml = async () => {
    openSnackbarInfo(t('info_messages.xml_export'))
    try {
      const response = await formsApi.convertControllerConvertJsonToXml(formSlug, {
        jsonForm: formData,
      })
      const fileName = `${formSlug}_output.xml`
      downloadBlob(new Blob([response.data.xmlForm]), fileName)
      closeSnackbarInfo()
      openSnackbarSuccess(t('success_messages.xml_export'))
    } catch (error) {
      openSnackbarError(t('errors.xml_export'))
    }
  }

  const importXml = async (e: ChangeEvent<HTMLInputElement>) => {
    openSnackbarInfo(t('info_messages.xml_import'))
    try {
      const xmlData: string = await readTextFile(e)
      const response = await formsApi.convertControllerConvertXmlToJson(formSlug, {
        xmlForm: xmlData,
      })
      setImportedFormData(response.data.jsonForm)
      closeSnackbarInfo()
      openSnackbarSuccess(t('success_messages.xml_import'))
    } catch (error) {
      openSnackbarError(t('errors.xml_import'))
    }
  }

  const chooseFilesAndImportXml = () => {
    const importInput = document.createElement('input')
    importInput.type = 'file'
    importInput.multiple = false
    importInput.accept = '.xml'

    importInput.addEventListener('change', (e) => {
      if (!importInput.files) return
      const changeEvent = e as unknown as ChangeEvent<HTMLInputElement>
      importXml(changeEvent).catch((error) => console.log('error', error))
    })

    importInput.click()
  }

  const exportPdf = async () => {
    throw new Error('Not implemented')
    // openSnackbarInfo(t('info_messages.pdf_export'))
    // try {
    //   const xml: Blob = await formDataToXml(formSlug, formData)
    //   const xmlData: string = await blobToString(xml)
    //   const pdf = await xmlStringToPdf(formSlug, xmlData)
    //   const fileName = `${formSlug}_output.pdf`
    //   downloadBlob(pdf, fileName)
    //   closeSnackbarInfo()
    //   openSnackbarSuccess(t('success_messages.pdf_export'))
    // } catch (error) {
    //   openSnackbarError(t('errors.pdf_export'))
    // }
  }

  const saveConcept = async () => {
    try {
      await formsApi.nasesControllerUpdateForm(
        formId,
        {
          formDataJson: formData,
        } as UpdateFormRequestDto,
        { accessToken: 'onlyAuthenticated' },
      )
      openSnackbarSuccess(t('success_messages.concept_save'))
    } catch (error) {
      openSnackbarError(t('errors.concept_save'))
    }
  }

  return {
    exportXml,
    importXml: chooseFilesAndImportXml,
    exportPdf,
    saveConcept,
  }
}
