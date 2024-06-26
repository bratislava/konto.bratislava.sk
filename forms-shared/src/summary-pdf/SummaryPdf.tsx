import React from 'react'
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
import Markdown from 'react-markdown'
import { generalTermsAndConditions } from '../definitions/termsAndConditions'
import cx from 'classnames'
import { ValidatedSummary } from '../summary-renderer/validateSummary'

type SummaryPdfProps = {
  cssToInject: string
  summaryJson: SummaryJsonForm
  validatedSummary: ValidatedSummary
}

const FormRenderer = ({ form, children }: SummaryFormRendererProps) => (
  <div className="flex flex-col gap-8">
    <h1 className="text-2xl font-semibold">{form.title}</h1>
    {children}
  </div>
)

const StepRenderer = ({ step, children }: SummaryStepRendererProps) => (
  <div className="flex flex-col gap-4">
    <h2 className="text-xl font-semibold">{step.title}</h2>
    <div>{children}</div>
  </div>
)

const FieldRenderer = ({ field, hasError, children }: SummaryFieldRendererProps) => {
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

const StringValueRenderer = ({ value }: SummaryStringValueRendererProps) => {
  return <span>{value}</span>
}

const FileValueRenderer = ({ fileInfo }: SummaryFileValueRendererProps) => {
  return <span>{fileInfo.fileName}</span>
}

const NoneValueRenderer = () => {
  return <span>-</span>
}

const InvalidValueRenderer = () => {
  return <span className="text-red-500">Neznáma hodnota</span>
}

const ArrayRenderer = ({ array, children }: SummaryArrayRendererProps) => (
  <div className="mt-4">
    <div className="mb-4 font-semibold">{array.title}</div>
    {children}
  </div>
)

const getArrayDepth = (id: string): number =>
  id.split('_').filter((part) => !isNaN(parseInt(part))).length

const ArrayItemRenderer = ({ arrayItem, children }: SummaryArrayItemRendererProps) => {
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

export const SummaryPdf = ({ cssToInject, summaryJson, validatedSummary }: SummaryPdfProps) => {
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
            validatedSummary={validatedSummary}
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
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Ochrana osobných údajov</h2>
            <Markdown
              className="rounded-xl bg-gray-50 p-6"
              components={{
                a: ({ children, href }) => (
                  <a href={href} className="font-semibold underline" target="_blank">
                    {children}
                  </a>
                ),
              }}
            >
              {/* TODO: Use from form definition. */}
              {generalTermsAndConditions}
            </Markdown>
          </div>
        </div>
      </body>
    </html>
  )
}
