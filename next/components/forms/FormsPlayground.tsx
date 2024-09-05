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
    return allForms.find((form) => form.slug === slug) || allForms[0]
  }, [allForms, slug])

  const defaultFormData = useMemo(
    () => baGetDefaultFormStateStable(selectedForm.schemas.schema, {}),
    [selectedForm],
  )

  const [formData, setFormData] = useState(defaultFormData)
  const [jsonInput, setJsonInput] = useState(JSON.stringify(defaultFormData, null, 2))

  const handleFormSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSlug = event.target.value
    setSlug(newSlug)
    setSelectedExampleName('')
    const newDefaultData = baGetDefaultFormStateStable(
      allForms.find((form) => form.slug === newSlug)!.schemas.schema,
      {},
    )
    setFormData(newDefaultData)
    setJsonInput(JSON.stringify(newDefaultData, null, 2))
    setFiles({})
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

  const handleJsonInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(event.target.value)
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

  return (
    <div className="flex">
      <div className="w-1/3 p-4">
        <select onChange={handleFormSelect} value={selectedForm.slug} className="mb-4 w-full">
          {allForms.map((form) => (
            <option key={form.slug} value={form.slug}>
              {form.title}
            </option>
          ))}
        </select>

        <select onChange={handleExampleSelect} value={selectedExampleName} className="mb-4 w-full">
          <option value="">Select an example</option>
          {(exampleForms[selectedForm.slug] || []).map((example) => (
            <option key={example.name} value={example.name}>
              {example.name}
            </option>
          ))}
        </select>

        <textarea
          value={jsonInput}
          onChange={handleJsonInputChange}
          onBlur={handleJsonInputBlur}
          className="h-64 w-full rounded border p-2"
          placeholder="Enter form data JSON here"
        />
      </div>
      <div className="w-2/3 p-4">
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
              />
            </FormStateContext.Provider>
          </FormFileUploadContext.Provider>
        </Fragment>
      </div>
    </div>
  )
}

export default FormsPlayground
