import Editor from '@monaco-editor/react'
import { FormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { exampleDevForms, exampleForms } from 'forms-shared/example-forms/exampleForms'
import { FileInfo, FileStatusType } from 'forms-shared/form-files/fileStatus'
import { mergeClientAndServerFiles } from 'forms-shared/form-files/mergeClientAndServerFiles'
import { baGetDefaultFormStateStable } from 'forms-shared/form-utils/defaultFormState'
import { baFormDefaults } from 'forms-shared/form-utils/formDefaults'
import { useQueryState } from 'nuqs'
import React, { Fragment, useMemo, useState, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

import ThemedForm from './ThemedForm'
import { FormFileUploadContext } from './useFormFileUpload'
import { FormStateContext } from './useFormState'
import SelectField, { SelectOption } from './widget-components/SelectField/SelectField'
import Button from './simple-components/ButtonNew'
import { downloadBlob } from '../../frontend/utils/general'
import useSnackbar from '../../frontend/hooks/useSnackbar'
import { useTranslation } from 'next-i18next'
import { DownloadIcon, UploadIcon } from '@assets/ui-icons'

export type FormsPlaygroundProps = {
  formDefinitions: FormDefinition[]
  devFormDefinitions: FormDefinition[]
  exampleForms: typeof exampleForms
  exampleDevForms: typeof exampleDevForms
}

type FormPlaygroundProvidersProps = {
  formData: any
  files: Record<string, FileInfo>
  setFiles: React.Dispatch<React.SetStateAction<Record<string, FileInfo>>>
  children: React.ReactNode
}

const FormPlaygroundProviders = ({ formData, files, setFiles, children }: FormPlaygroundProvidersProps) => {
  const formFileUploadContextValue = useMemo(
    () => ({
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
    }),
    [files, setFiles],
  )

  const formStateContextValue = useMemo(() => ({ formData }), [formData])

  return (
    // @ts-expect-error - This is a mock implementation for FormFileUploadContext
    // The actual context requires more properties that are not necessary for this playground
    <FormFileUploadContext.Provider value={formFileUploadContextValue}>
      {/* @ts-expect-error - This is a mock implementation for FormStateContext
          The actual context might require additional properties or have a different structure */}
      <FormStateContext.Provider value={formStateContextValue}>
        {children}
      </FormStateContext.Provider>
    </FormFileUploadContext.Provider>
  )
}

const FormsPlayground = ({ formDefinitions, devFormDefinitions }: FormsPlaygroundProps) => {
  const [slug, setSlug] = useQueryState('slug')
  const [selectedExampleName, setSelectedExampleName] = useState<string>('')
  const [files, setFiles] = useState<Record<string, FileInfo>>({})

  const allForms = useMemo(
    () => [...formDefinitions, ...devFormDefinitions],
    [formDefinitions, devFormDefinitions],
  )

  const selectedForm = useMemo(() => {
    return allForms.find((form) => form.slug === slug) || null
  }, [allForms, slug])

  const defaultFormData = useMemo(
    () => selectedForm ? baGetDefaultFormStateStable(selectedForm.schemas.schema, {}) : {},
    [selectedForm],
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
        const newDefaultData = baGetDefaultFormStateStable(newForm.schemas.schema, {})
        setFormData(newDefaultData)
        setJsonInput(JSON.stringify(newDefaultData, null, 2))
        setFiles({})
      }
    }
  }

  const handleExampleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value
    setSelectedExampleName(selectedValue)

    if (selectedValue === '') {
      setFormData(defaultFormData)
      setJsonInput(JSON.stringify(defaultFormData, null, 2))
      setFiles({})
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
      } else {
        console.warn(`Example "${selectedValue}" not found for form "${selectedForm.slug}"`)
        setFormData(defaultFormData)
        setJsonInput(JSON.stringify(defaultFormData, null, 2))
        setFiles({})
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

  const formOptions = useMemo(() => [
    {
      label: 'Regular Forms',
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
  ], [formDefinitions, devFormDefinitions])

  const exampleOptions: SelectOption[] = useMemo(() => {
    if (!selectedForm) return []
    const currentFormExamples = exampleForms[selectedForm.slug] || []
    return [
      { value: '', label: 'Empty form' },
      ...currentFormExamples.map((example) => ({
        value: example.name,
        label: example.name,
      })),
    ]
  }, [selectedForm])


  return (
    <FormPlaygroundProviders
      formData={formData}
      files={files}
      setFiles={setFiles}
    >
      <div className="flex flex-col lg:flex-row">
        <div className="w-full p-4 lg:sticky lg:top-0 lg:h-screen lg:w-1/3 lg:overflow-y-auto">
          <SelectField
            options={formOptions}
            value={selectedForm ? formOptions
              .flatMap((group) => group.options)
              .find((option) => option.value === selectedForm.slug) : null}
            onChange={handleFormSelect}
            label="Select Form"
            className="mb-4"
          />

          <SelectField
            options={exampleOptions}
            value={exampleOptions.find((option) => option.value === selectedExampleName)}
            onChange={(option) =>
              handleExampleSelect({ target: { value: option?.value || '' } } as any)
            }
            label="Select Example"
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

          <div className="flex gap-2 mt-4">
            <Button
              onPress={exportJson}
              variant="black-solid"
              startIcon={<DownloadIcon />}
            >
              Export JSON
            </Button>
            <Button
              onPress={triggerImportJson}
              variant="black-outline"
              startIcon={<UploadIcon />}
            >
              Import JSON
            </Button>
            <input
              type="file"
              ref={importJsonInputRef}
              onChange={handleImportJson}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
        <div className="w-full p-4 lg:mx-auto lg:w-2/3 lg:max-w-[800px]">
        {selectedForm ?          <ThemedForm
            schema={selectedForm.schemas.schema}
            uiSchema={selectedForm.schemas.uiSchema}
            formData={formData}
            onChange={(e) => {
              setFormData(e.formData)
              setJsonInput(JSON.stringify(e.formData, null, 2))
            }}
            noHtml5Validate
            showErrorList={false}
            {...baFormDefaults}
          >
            {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
            <></>
          </ThemedForm> : null}
        </div>
      </div>
    </FormPlaygroundProviders>
  )
}

export default FormsPlayground
