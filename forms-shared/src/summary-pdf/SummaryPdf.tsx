import React from 'react'
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
import Markdown from 'react-markdown'
import cx from 'classnames'
import { GenericObjectType, ValidationData } from '@rjsf/utils'
import { FileInfoSummary } from '../form-files/fileStatus'
import { FormSummary } from '../summary/summary'

type SummaryPdfProps = {
  formSummary: FormSummary
  cssToInject: string
  fileInfos: Record<string, FileInfoSummary>
  validationData: ValidationData<GenericObjectType> | null
}

const FormComponent = ({ form, children }: SummaryFormComponentProps) => (
  <div className="flex flex-col gap-8">
    <h1 className="text-2xl font-semibold">{form.title}</h1>
    {children}
  </div>
)

const StepComponent = ({ step, children }: SummaryStepComponentProps) => (
  <div className="flex flex-col gap-4">
    <h2 className="text-xl font-semibold">{step.title}</h2>
    <div>{children}</div>
  </div>
)

const FieldComponent = ({ field, hasError, children }: SummaryFieldComponentProps) => {
  const wrapperClass = cx('flex flex-row flex-nowrap gap-2 border-b-2 py-2.5', {
    'border-gray-200': !hasError,
    'border-red-500': hasError,
  })

  return (
    <div className={wrapperClass}>
      <p className="font-semibold flex-1">{field.label}</p>
      <div className="flex flex-1 flex-col gap-2">{children}</div>
    </div>
  )
}

const StringValueComponent = ({ value }: SummaryStringValueComponentProps) => {
  return <span className="whitespace-pre-wrap">{value}</span>
}

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M10.96 19.01c-1.39 1.39-3.81 1.39-5.2 0l-.41-.41a4.183 4.183 0 0 1 0-5.91l8.43-8.44c.99-.99 2.73-.99 3.72 0 .5.5.77 1.16.77 1.86 0 .7-.27 1.36-.77 1.86L9.07 16.4a.984.984 0 0 1-1.4 0c-.38-.39-.39-1.02 0-1.4l7.48-7.48-1.06-1.06-7.48 7.48c-.97.97-.97 2.55 0 3.52.97.97 2.55.97 3.52 0l8.43-8.43c.78-.78 1.21-1.82 1.21-2.92 0-1.1-.43-2.14-1.21-2.92a4.108 4.108 0 0 0-2.92-1.21c-1.1 0-2.14.43-2.92 1.21l-8.43 8.43a5.704 5.704 0 0 0 0 8.04l.41.41c.98.98 2.28 1.52 3.66 1.52 1.38 0 2.68-.54 3.66-1.52l7.78-7.78-1.06-1.06-7.78 7.78Z"
    />
  </svg>
)

const FileValueComponent = ({ fileInfo }: SummaryFileValueComponentProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="shrink-0">
        <FileIcon />
      </div>
      <span>{fileInfo.fileName}</span>
    </div>
  )
}

const NoneValueComponent = () => {
  return <span>-</span>
}

const InvalidValueComponent = () => {
  return <span className="text-red-500">Neznáma hodnota</span>
}

const ArrayComponent = ({ array, children }: SummaryArrayComponentProps) => (
  <div className="mt-4">
    <div className="mb-4 font-semibold">{array.title}</div>
    {children}
  </div>
)

const getArrayDepth = (id: string): number =>
  id.split('_').filter((part) => !isNaN(parseInt(part))).length

const ArrayItemComponent = ({ arrayItem, children }: SummaryArrayItemComponentProps) => {
  const arrayDepth = getArrayDepth(arrayItem.id)

  const wrapperClass = cx('flex flex-col mb-4', {
    'rounded-xl border border-gray-200 p-6 gap-6': arrayDepth === 1,
    'gap-2': arrayDepth !== 1,
  })

  const spanClass = cx('font-semibold', {
    'inline-block bg-gray-100 px-2 rounded-xl self-start': arrayDepth !== 1,
  })

  return (
    <div className={wrapperClass}>
      <span className={spanClass}>{arrayItem.title}</span>
      <div>{children}</div>
    </div>
  )
}

const SummaryMarkdown = ({ className, children }: { className: string; children: string }) => {
  return (
    <Markdown
      className={className}
      components={{
        h2: ({ children }) => <h2 className="text-h-xl font-semibold mb-4">{children}</h2>,
        h3: ({ children }) => <h3 className="text-h-lg font-semibold mb-3">{children}</h3>,
        h4: ({ children }) => <h4 className="text-h-md font-semibold mb-2">{children}</h4>,
        h5: ({ children }) => <h5 className="text-h-base font-semibold mb-2">{children}</h5>,
        h6: ({ children }) => <h6 className="text-h-xs font-semibold mb-2">{children}</h6>,
        p: ({ children }) => <p className="text-p-md font-normal mb-4">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        ol: ({ children }) => <ol className="list-decimal pl-8 mb-4">{children}</ol>,
        ul: ({ children }) => <ul className="list-disc pl-8 mb-4">{children}</ul>,
        li: ({ children }) => <li className="text-p-md font-normal mb-2">{children}</li>,
        a: ({ children, href }) => (
          <a href={href} className="font-semibold underline" target="_blank">
            {children}
          </a>
        ),
      }}
    >
      {children}
    </Markdown>
  )
}

const AdditionalInfo = ({ additionalInfo }: { additionalInfo: string | null }) => {
  if (!additionalInfo) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Doplňujúce informácie</h2>
      <SummaryMarkdown className="rounded-xl bg-gray-50 p-6">{additionalInfo}</SummaryMarkdown>
    </div>
  )
}

const TermsAndConditions = ({ termsAndConditions }: { termsAndConditions: string }) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Ochrana osobných údajov</h2>
      <SummaryMarkdown className="rounded-xl bg-gray-50 p-6">{termsAndConditions}</SummaryMarkdown>
    </div>
  )
}

export const SummaryPdf = ({
  formSummary: { summaryJson, additionalInfo, termsAndConditions },
  cssToInject,
  fileInfos,
  validationData,
}: SummaryPdfProps) => {
  return (
    <html>
      <head>
        <title>{summaryJson.title}</title>
        <style type="text/css" dangerouslySetInnerHTML={{ __html: cssToInject }} />
      </head>
      <body className="font-sans text-[#333]">
        <div className="flex flex-col gap-8">
          <SummaryRenderer
            summaryJson={summaryJson}
            fileInfos={fileInfos}
            validationData={validationData}
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
          />
          <AdditionalInfo additionalInfo={additionalInfo} />
          <TermsAndConditions termsAndConditions={termsAndConditions} />
        </div>
      </body>
    </html>
  )
}
