import { DownloadIcon, UploadIcon } from '@assets/ui-icons'
import Editor from '@monaco-editor/react'
import Form from '@rjsf/core'
import { GenericObjectType } from '@rjsf/utils'
import { exampleDevForms, exampleForms } from 'forms-shared/example-forms/exampleForms'
import { FileInfo, FileStatusType } from 'forms-shared/form-files/fileStatus'
import { mergeClientAndServerFiles } from 'forms-shared/form-files/mergeClientAndServerFiles'
import { baGetDefaultFormStateStable } from 'forms-shared/form-utils/defaultFormState'
import { defaultUiSchema, getBaFormDefaults } from 'forms-shared/form-utils/formDefaults'
import { useTranslation } from 'next-i18next'
import { useQueryState } from 'nuqs'
import React, { ContextType, createRef, useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import useSnackbar from '../../frontend/hooks/useSnackbar'
import { downloadBlob } from '../../frontend/utils/general'
import { ClientPlaygroundFormDefinition } from './clientFormDefinitions'
import Button from './simple-components/Button'
import ThemedForm from './ThemedForm'
import { FormDataContext } from './useFormData'
import { useFormErrorTranslations } from './useFormErrorTranslations'
import { FormFileUploadContext } from './useFormFileUpload'
import { FormValidatorRegistryProvider, useFormValidatorRegistry } from './useFormValidatorRegistry'
import SelectField, { SelectOption } from './widget-components/SelectField/SelectField'

export type FormsPlaygroundProps = {
  formDefinitions: ClientPlaygroundFormDefinition[]
  devFormDefinitions: ClientPlaygroundFormDefinition[]
  exampleForms: typeof exampleForms
  exampleDevForms: typeof exampleDevForms
}

type FormPlaygroundProvidersProps = {
  formData: GenericObjectType
  setFormData: React.Dispatch<React.SetStateAction<GenericObjectType>>
  files: Record<string, FileInfo>
  setFiles: React.Dispatch<React.SetStateAction<Record<string, FileInfo>>>
  children: React.ReactNode
}

const FormPlaygroundProviders = ({
  formData,
  setFormData,
  files,
  setFiles,
  children,
}: FormPlaygroundProvidersProps) => {
  const formFileUploadContextValue = useMemo(
    () =>
      ({
        removeFiles: (fileIds: string[]) => {
          setFiles((prevFiles) => {
            const newFiles = { ...prevFiles }
            fileIds.forEach((fileId) => {
              delete newFiles[fileId]
            })
            return newFiles
          })
        },
        uploadFiles: (filesInner: File[]) => {
          const newFiles: Record<string, FileInfo> = {}
          filesInner.forEach((file) => {
            const id = uuidv4()
            newFiles[id] = {
              fileName: file.name,
              fileSize: file.size,
              status: { type: FileStatusType.ScanDone },
            }
          })
          setFiles((prevFiles) => ({ ...prevFiles, ...newFiles }))
          return Object.keys(newFiles)
        },
        getFileInfoById: (fileId: string): FileInfo => {
          const file = files[fileId]
          if (!file) {
            return {
              status: { type: FileStatusType.UnknownFile },
              fileName: fileId,
              fileSize: null,
            }
          }
          return file
        },
      }) as Partial<ContextType<typeof FormFileUploadContext>>,
    [files, setFiles],
  )

  const formDataContextValue = useMemo(
    () => ({ formData, setFormData }) as Partial<ContextType<typeof FormDataContext>>,
    [formData, setFormData],
  )

  return (
    <FormFileUploadContext.Provider
      value={formFileUploadContextValue as ContextType<typeof FormFileUploadContext>}
    >
      <FormDataContext.Provider value={formDataContextValue as ContextType<typeof FormDataContext>}>
        {children}
      </FormDataContext.Provider>
    </FormFileUploadContext.Provider>
  )
}

const FormsPlayground = ({ formDefinitions, devFormDefinitions }: FormsPlaygroundProps) => {
  const { transformErrors } = useFormErrorTranslations()
  const validatorRegistry = useFormValidatorRegistry()
  const formRef = createRef<Form>()
  const allForms = useMemo(
    () => [...formDefinitions, ...devFormDefinitions],
    [formDefinitions, devFormDefinitions],
  )
  const [formInstanceIndex, setFormInstanceIndex] = useState(0)
  const forceReset = () => setFormInstanceIndex((prev) => prev + 1)

  const [slug, setSlug] = useQueryState('slug', { defaultValue: allForms[0].slug })
  useEffect(() => {
    // Initially if the query param is not present this sets it (`currentStepIndex` already contains default value)
    // https://github.com/47ng/nuqs/issues/405
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    setSlug(slug, { history: 'replace' })
    // Rewritten from useEffectOnce
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [selectedExampleName, setSelectedExampleName] = useState<string>('')
  const [files, setFiles] = useState<Record<string, FileInfo>>({})

  const selectedForm = useMemo(() => {
    return allForms.find((form) => form.slug === slug) || null
  }, [allForms, slug])

  const defaultFormData = useMemo(
    () =>
      selectedForm ? baGetDefaultFormStateStable(selectedForm.schema, {}, validatorRegistry) : {},
    [validatorRegistry, selectedForm],
  )

  const [formData, setFormData] = useState(defaultFormData)
  const [jsonInput, setJsonInput] = useState(JSON.stringify(defaultFormData, null, 2))

  const [openSnackbarSuccess] = useSnackbar({ variant: 'success' })
  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const { t } = useTranslation('forms')
  const importJsonInputRef = useRef<HTMLInputElement>(null)

  const handleFormSelect = (option: SelectOption | null) => {
    if (option) {
      const newSlug = option.value
      setSlug(newSlug)
      setSelectedExampleName('')
      const newForm = allForms.find((form) => form.slug === newSlug)
      if (newForm) {
        const newDefaultData = baGetDefaultFormStateStable(newForm.schema, {}, validatorRegistry)
        setFormData(newDefaultData)
        setJsonInput(JSON.stringify(newDefaultData, null, 2))
        setFiles({})
      }
      forceReset()
    }
  }

  const handleExampleSelect = (selectedValue: string | null) => {
    if (selectedValue == null) {
      return
    }
    setSelectedExampleName(selectedValue)

    if (selectedValue === '') {
      setFormData(defaultFormData)
      setJsonInput(JSON.stringify(defaultFormData, null, 2))
      setFiles({})
      forceReset()

      return
    }

    if (selectedForm) {
      const currentFormExamples = exampleForms[selectedForm.slug] || []
      const selectedExample = currentFormExamples.find((ex) => ex.name === selectedValue)

      if (selectedExample) {
        setFormData(selectedExample.formData)
        setJsonInput(JSON.stringify(selectedExample.formData, null, 2))
        setFiles(
          mergeClientAndServerFiles(
            selectedExample.clientFiles || [],
            selectedExample.serverFiles || [],
          ),
        )
        forceReset()
      } else {
        // eslint-disable-next-line no-console
        console.warn(`Example "${selectedValue}" not found for form "${selectedForm.slug}"`)
        setFormData(defaultFormData)
        setJsonInput(JSON.stringify(defaultFormData, null, 2))
        setFiles({})
        forceReset()
      }
    }
  }

  const handleJsonInputChange = (value: string | undefined) => {
    if (value) {
      setJsonInput(value)
    }
  }

  const handleJsonInputBlur = () => {
    try {
      const parsedData = JSON.parse(jsonInput)
      setFormData(parsedData)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Invalid JSON input')
      setJsonInput(JSON.stringify(formData, null, 2))
    }
  }

  const exportJson = () => {
    const fileName = `${selectedForm?.slug}_output.json`
    const jsonBlob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' })
    downloadBlob(jsonBlob, fileName)
    openSnackbarSuccess(t('success_messages.json_export'))
  }

  const triggerImportJson = () => {
    importJsonInputRef.current?.click()
  }

  const handleImportJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const jsonForm = await file.text()
      const parsed = JSON.parse(jsonForm)
      setFormData(parsed)
      setJsonInput(JSON.stringify(parsed, null, 2))
      openSnackbarSuccess(t('success_messages.json_import'))
    } catch (error) {
      openSnackbarError(t('errors.json_import'))
    }

    // Reset the file input
    if (importJsonInputRef.current) {
      importJsonInputRef.current.value = ''
    }
  }

  const handleValidateForm = () => {
    formRef.current?.submit()
  }

  const formOptions = useMemo(
    () => [
      {
        label: 'Forms',
        options: formDefinitions.map((form) => ({
          value: form.slug,
          label: form.title || form.slug,
        })),
      },
      {
        label: 'Dev Forms',
        options: devFormDefinitions.map((form) => ({
          value: form.slug,
          label: form.title || form.slug,
        })),
      },
    ],
    [formDefinitions, devFormDefinitions],
  )

  const exampleOptions: SelectOption[] = useMemo(() => {
    if (!selectedForm) return []
    const currentFormExamples = exampleForms[selectedForm.slug] || []
    return [
      { value: '', label: 'Prázdny formulár' },
      ...currentFormExamples.map((example) => ({
        value: example.name,
        label: example.name,
      })),
    ]
  }, [selectedForm])

  return (
    <FormPlaygroundProviders
      formData={formData}
      setFormData={setFormData}
      files={files}
      setFiles={setFiles}
    >
      <div className="flex flex-col lg:flex-row">
        <div className="w-full p-4 lg:sticky lg:top-0 lg:h-screen lg:w-1/3 lg:overflow-y-auto">
          <SelectField
            options={formOptions}
            value={
              selectedForm
                ? formOptions
                    .flatMap((group) => group.options)
                    .find((option) => option.value === selectedForm.slug)
                : null
            }
            onChange={handleFormSelect}
            label="Zvoliť formulár"
            className="mb-4"
          />

          <SelectField
            options={exampleOptions}
            value={exampleOptions.find((option) => option.value === selectedExampleName)}
            onChange={(option) => handleExampleSelect(option?.value ?? null)}
            label="Zvoliť data"
            className="mb-4"
          />

          <Editor
            height="400px"
            defaultLanguage="json"
            value={jsonInput}
            onChange={handleJsonInputChange}
            onMount={(editor) => {
              editor.onDidBlurEditorWidget(() => handleJsonInputBlur())
            }}
            options={{
              minimap: { enabled: false },
              formatOnPaste: true,
              formatOnType: true,
            }}
          />

          <div className="mt-4 flex gap-2">
            <Button onPress={exportJson} variant="black-solid" startIcon={<DownloadIcon />}>
              {t('menu_list.download_json')}
            </Button>
            <Button onPress={triggerImportJson} variant="black-outline" startIcon={<UploadIcon />}>
              {t('menu_list.upload_json')}
            </Button>
            <input
              type="file"
              ref={importJsonInputRef}
              onChange={handleImportJson}
              accept=".json"
              className="hidden"
            />
          </div>

          <div className="mt-4 flex gap-2">
            <Button onPress={handleValidateForm} variant="black-outline">
              Validovať formulár
            </Button>
            <Button onPress={forceReset} variant="black-outline">
              Reštartovať formulár
            </Button>
          </div>
        </div>
        <div className="w-full p-4 lg:mx-auto lg:w-2/3 lg:max-w-[800px]">
          {selectedForm ? (
            <ThemedForm
              key={`form-instance-${formInstanceIndex}`}
              schema={selectedForm.schema}
              uiSchema={defaultUiSchema}
              formData={formData}
              onChange={(e) => {
                setFormData(e.formData)
                setJsonInput(JSON.stringify(e.formData, null, 2))
              }}
              noHtml5Validate
              showErrorList={false}
              omitExtraData
              liveOmit
              transformErrors={transformErrors}
              ref={formRef}
              {...getBaFormDefaults(selectedForm.schema, validatorRegistry)}
            >
              {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
              <></>
            </ThemedForm>
          ) : null}
        </div>
      </div>
    </FormPlaygroundProviders>
  )
}

const FormsPlaygroundWrapped = (props: FormsPlaygroundProps) => {
  return (
    <FormValidatorRegistryProvider>
      <FormsPlayground {...props} />
    </FormValidatorRegistryProvider>
  )
}

export default FormsPlaygroundWrapped
