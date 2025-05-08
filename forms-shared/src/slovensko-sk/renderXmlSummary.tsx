import React, { DetailedHTMLProps, HTMLAttributes } from 'react'
import {
  SummaryArrayComponentProps,
  SummaryArrayItemComponentProps,
  SummaryFieldComponentProps,
  SummaryFileValueComponentProps,
  SummaryFormComponentProps,
  SummaryRenderer,
  SummaryStepComponentProps,
  SummaryStringValueComponentProps,
} from '../summary-renderer/SummaryRenderer'
import { renderToString } from 'react-dom/server'
import { Parser } from 'xml2js'
import { FormsBackendFile } from '../form-files/serverFilesTypes'
import { mergeClientAndServerFilesSummary } from '../form-files/mergeClientAndServerFiles'
import { FileInfoSummary } from '../form-files/fileStatus'
import { FormSummary } from '../summary/summary'

type SlovenskoSkSummaryXmlProps = {
  formSummary: FormSummary
  fileInfos: Record<string, FileInfoSummary>
}

type CustomElement<P = {}> = DetailedHTMLProps<HTMLAttributes<HTMLElement> & P, HTMLElement>

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      // The tags are prefixed with "slovensko-sk" to avoid conflicts with existing HTML tags and tags in the repository,
      // as these are global for the whole package. The tags are mapped to the actual tags in the parser.
      'slovensko-sk-form': CustomElement<{ title: string }>
      'slovensko-sk-step': CustomElement<{ id: string; title: string }>
      'slovensko-sk-array': CustomElement<{ id: string; title: string }>
      'slovensko-sk-array-item': CustomElement<{ id: string; title: string }>
      'slovensko-sk-field': CustomElement<{ id: string; label: string }>
      'slovensko-sk-string-value': CustomElement
      'slovensko-sk-file-value': CustomElement<{ id: string }>
      'slovensko-sk-none-value': CustomElement
      'slovensko-sk-invalid-value': CustomElement
    }
  }
}

const FormComponent = ({ children, form }: SummaryFormComponentProps) => (
  <slovensko-sk-form title={form.title}>{children}</slovensko-sk-form>
)

const StepComponent = ({ step, children }: SummaryStepComponentProps) => (
  <slovensko-sk-step id={step.id} title={step.title}>
    {children}
  </slovensko-sk-step>
)

const FieldComponent = ({ field, children }: SummaryFieldComponentProps) => {
  return (
    <slovensko-sk-field id={field.id} label={field.label}>
      {children}
    </slovensko-sk-field>
  )
}

const StringValueComponent = ({ value }: SummaryStringValueComponentProps) => {
  return <slovensko-sk-string-value>{value}</slovensko-sk-string-value>
}

const FileValueComponent = ({ fileInfo }: SummaryFileValueComponentProps) => {
  return <slovensko-sk-file-value id={fileInfo.id}>{fileInfo.fileName}</slovensko-sk-file-value>
}

const NoneValueComponent = () => {
  return <slovensko-sk-none-value />
}

const InvalidValueComponent = () => {
  return <slovensko-sk-invalid-value />
}

const ArrayComponent = ({ array, children }: SummaryArrayComponentProps) => (
  <slovensko-sk-array id={array.id} title={array.title}>
    {children}
  </slovensko-sk-array>
)

const ArrayItemComponent = ({ arrayItem, children }: SummaryArrayItemComponentProps) => {
  return (
    <slovensko-sk-array-item id={arrayItem.id} title={arrayItem.title}>
      {children}
    </slovensko-sk-array-item>
  )
}

export const SlovenskoSkSummaryXml = ({
  formSummary: { summaryJson },
  fileInfos,
}: SlovenskoSkSummaryXmlProps) => {
  return (
    <SummaryRenderer
      summaryJson={summaryJson}
      fileInfos={fileInfos}
      components={{
        FormComponent,
        StepComponent,
        FieldComponent,
        ArrayComponent,
        ArrayItemComponent,
        StringValueComponent,
        FileValueComponent,
        NoneValueComponent,
        InvalidValueComponent,
      }}
      validationData={null}
    />
  )
}

const map = {
  'slovensko-sk-form': 'Form',
  'slovensko-sk-step': 'Step',
  'slovensko-sk-array': 'Array',
  'slovensko-sk-array-item': 'ArrayItem',
  'slovensko-sk-field': 'Field',
  'slovensko-sk-string-value': 'StringValue',
  'slovensko-sk-file-value': 'FileValue',
  'slovensko-sk-none-value': 'NoneValue',
  'slovensko-sk-invalid-value': 'InvalidValue',
} as Record<string, string>

const parser = new Parser({
  tagNameProcessors: [
    (name) => {
      if (!(name in map)) {
        throw new Error(`Unknown tag ${name}`)
      }
      return map[name]
    },
  ],
})

type RenderSlovenskoXmlSummaryParams = {
  formSummary: FormSummary
  serverFiles?: FormsBackendFile[]
}

export async function renderSlovenskoXmlSummary({
  formSummary,
  serverFiles,
}: RenderSlovenskoXmlSummaryParams) {
  const fileInfos = mergeClientAndServerFilesSummary([], serverFiles)

  const stringXml = renderToString(
    <SlovenskoSkSummaryXml formSummary={formSummary} fileInfos={fileInfos} />,
  )

  return await parser.parseStringPromise(stringXml)
}
