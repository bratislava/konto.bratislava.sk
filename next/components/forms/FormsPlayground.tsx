import Editor from '@monaco-editor/react'
import { FormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { exampleDevForms, exampleForms } from 'forms-shared/example-forms/exampleForms'
import { FileInfo, FileStatusType } from 'forms-shared/form-files/fileStatus'
import { mergeClientAndServerFiles } from 'forms-shared/form-files/mergeClientAndServerFiles'
import { baGetDefaultFormStateStable } from 'forms-shared/form-utils/defaultFormState'
import { baFormDefaults } from 'forms-shared/form-utils/formDefaults'
import { useQueryState } from 'nuqs'
import React, { Fragment, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import ThemedForm from './ThemedForm'
import { FormFileUploadContext } from './useFormFileUpload'
import { FormStateContext } from './useFormState'
import SelectField, { SelectOption } from './widget-components/SelectField/SelectField'

export type FormsPlaygroundProps = {
  formDefinitions: FormDefinition[]
  devFormDefinitions: FormDefinition[]
  exampleForms: typeof exampleForms
  exampleDevForms: typeof exampleDevForms
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
    const form = allForms.find((form) => form.slug === slug)
    return form || allForms[0]
  }, [allForms, slug])

  const defaultFormData = useMemo(
    () => baGetDefaultFormStateStable(selectedForm.schemas.schema, {}),
    [selectedForm],
  )

  const [formData, setFormData] = useState(defaultFormData)
  const [jsonInput, setJsonInput] = useState(JSON.stringify(defaultFormData, null, 2))

  const handleFormSelect = (option: SelectOption | null) => {
    if (option) {
      const newSlug = option.value
      setSlug(newSlug)
      setSelectedExampleName('')
      const newForm = allForms.find((form) => form.slug === newSlug)!
      const newDefaultData = baGetDefaultFormStateStable(newForm.schemas.schema, {})
      setFormData(newDefaultData)
      setJsonInput(JSON.stringify(newDefaultData, null, 2))
      setFiles({})
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
    [files],
  )
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
    const currentFormExamples = exampleForms[selectedForm.slug] || []
    return [
      { value: '', label: 'Empty form' },
      ...currentFormExamples.map((example) => ({
        value: example.name,
        label: example.name,
      })),
    ]
  }, [selectedForm.slug, exampleForms])

  return (
    <div className="flex flex-col lg:flex-row">
      <div className="w-full p-4 lg:sticky lg:top-0 lg:h-screen lg:w-1/3 lg:overflow-y-auto">
        <SelectField
          options={formOptions}
          value={formOptions
            .flatMap((group) => group.options)
            .find((option) => option.value === selectedForm.slug)}
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
      </div>
      <div className="w-full p-4 lg:mx-auto lg:w-2/3 lg:max-w-[800px]">
        <Fragment key={selectedForm.slug}>
          {/* @ts-ignore */}
          <FormFileUploadContext.Provider value={formFileUploadContextValue}>
            {/* @ts-ignore */}
            <FormStateContext.Provider value={{ formData }}>
              <ThemedForm
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
                {/* There must be an empty fragment inside the form, otherwise RJSF renders submit button
                 * inside the form. */}
                {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
                <></>
              </ThemedForm>
            </FormStateContext.Provider>
          </FormFileUploadContext.Provider>
        </Fragment>
      </div>
    </div>
  )
}

export default FormsPlayground
