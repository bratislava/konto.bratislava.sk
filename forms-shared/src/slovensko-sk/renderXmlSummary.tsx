import React, { DetailedHTMLProps, HTMLAttributes } from 'react'
import {
  SummaryArrayItemRendererProps,
  SummaryArrayRendererProps,
  SummaryFieldRendererProps,
  SummaryFileValueRendererProps,
  SummaryFormRendererProps,
  SummaryRenderer,
  SummaryStepRendererProps,
  SummaryStringValueRendererProps,
} from '../summary-renderer/SummaryRenderer'
import { SummaryJsonForm } from '../summary-json/summaryJsonTypes'
import { FormDefinition } from '../definitions/formDefinitionTypes'
import { GenericObjectType } from '@rjsf/utils'
import { renderToString } from 'react-dom/server'
import { getSummaryJsonNode } from '../summary-json/getSummaryJsonNode'
import { Parser } from 'xml2js'
import { FormsBackendFile } from '../form-files/serverFilesTypes'
import { mergeClientAndServerFilesSummary } from '../form-files/mergeClientAndServerFiles'
import { BaRjsfValidatorRegistry } from '../form-utils/validatorRegistry'
import { FileInfoSummary } from '../form-files/fileStatus'

type SlovenskoSkSummaryXmlProps = {
  summaryJson: SummaryJsonForm
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

const FormRenderer = ({ children, form }: SummaryFormRendererProps) => (
  <slovensko-sk-form title={form.title}>{children}</slovensko-sk-form>
)

const StepRenderer = ({ step, children }: SummaryStepRendererProps) => (
  <slovensko-sk-step id={step.id} title={step.title}>
    {children}
  </slovensko-sk-step>
)

const FieldRenderer = ({ field, children }: SummaryFieldRendererProps) => {
  return (
    <slovensko-sk-field id={field.id} label={field.label}>
      {children}
    </slovensko-sk-field>
  )
}

const StringValueRenderer = ({ value }: SummaryStringValueRendererProps) => {
  return <slovensko-sk-string-value>{value}</slovensko-sk-string-value>
}

const FileValueRenderer = ({ fileInfo }: SummaryFileValueRendererProps) => {
  return <slovensko-sk-file-value id={fileInfo.id}>{fileInfo.fileName}</slovensko-sk-file-value>
}

const NoneValueRenderer = () => {
  return <slovensko-sk-none-value />
}

const InvalidValueRenderer = () => {
  return <slovensko-sk-invalid-value />
}

const ArrayRenderer = ({ array, children }: SummaryArrayRendererProps) => (
  <slovensko-sk-array id={array.id} title={array.title}>
    {children}
  </slovensko-sk-array>
)

const ArrayItemRenderer = ({ arrayItem, children }: SummaryArrayItemRendererProps) => {
  return (
    <slovensko-sk-array-item id={arrayItem.id} title={arrayItem.title}>
      {children}
    </slovensko-sk-array-item>
  )
}

export const SlovenskoSkSummaryXml = ({ summaryJson, fileInfos }: SlovenskoSkSummaryXmlProps) => {
  return (
    <SummaryRenderer
      summaryJson={summaryJson}
      fileInfos={fileInfos}
      renderForm={FormRenderer}
      renderStep={StepRenderer}
      renderField={FieldRenderer}
      renderArray={ArrayRenderer}
      renderArrayItem={ArrayItemRenderer}
      renderStringValue={StringValueRenderer}
      renderFileValue={FileValueRenderer}
      renderNoneValue={NoneValueRenderer}
      renderInvalidValue={InvalidValueRenderer}
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

export async function renderSlovenskoXmlSummary(
  formDefinition: FormDefinition,
  formData: GenericObjectType,
  validatorRegistry: BaRjsfValidatorRegistry,
  serverFiles?: FormsBackendFile[],
) {
  const summaryJson = getSummaryJsonNode(formDefinition.schema, formData, validatorRegistry)
  const fileInfos = mergeClientAndServerFilesSummary([], serverFiles)

  const stringXml = renderToString(
    <SlovenskoSkSummaryXml summaryJson={summaryJson} fileInfos={fileInfos} />,
  )

  return await parser.parseStringPromise(stringXml)
}
