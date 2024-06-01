import React from 'react'
import SummaryRenderer, {
  SummaryArrayItemRendererProps,
  SummaryArrayRendererProps,
  SummaryDisplayValueRendererProps,
  SummaryFieldRendererProps,
  SummaryFormRendererProps,
  SummaryStepRendererProps,
} from '../summary-renderer/SummaryRenderer'
import { SummaryDisplayValueType } from '../summary-json/getSummaryDisplayValue'
import { SummaryJsonForm } from '../summary-json/summaryJsonTypes'

type SummaryPdfProps = {
  tailwindCss: string
  summaryJson: SummaryJsonForm
}

const FormRenderer = ({ children }: SummaryFormRendererProps) => (
  <div className="flex flex-col gap-8">{children}</div>
)

const StepRenderer = ({ step, children }: SummaryStepRendererProps) => (
  <div className="flex flex-col gap-4">
    <h2 className="text-lg font-bold">{step.title}</h2>
    <div>{children}</div>
  </div>
)

const FieldRenderer = ({ field, children }: SummaryFieldRendererProps) => (
  <div className="flex flex-col py-2.5 border-b-2 border-gray-200">
    <p className="font-semibold">{field.label}</p>
    <div className="flex flex-row items-center">
      <span>{children || '-'}</span>
    </div>
  </div>
)

const DisplayValueRenderer = ({ displayValue }: SummaryDisplayValueRendererProps) => {
  switch (displayValue.type) {
    case SummaryDisplayValueType.String:
      return <span>{displayValue.value}</span>
    case SummaryDisplayValueType.File:
      return <span>{displayValue.id}</span>
    case SummaryDisplayValueType.Invalid:
      return <span className="text-red-500">Neznáma hodnota</span>
    case SummaryDisplayValueType.None:
      return <span>-</span>
    default:
      return null
  }
}

const ArrayRenderer = ({ array, children }: SummaryArrayRendererProps) => (
  <div className="mt-4">
    <div className="mb-4 font-semibold">{array.title}</div>
    {children}
  </div>
)

// Utility function to calculate array depth
const getArrayDepth = (id: string): number =>
  id.split('_').filter((part) => !isNaN(parseInt(part))).length

const ArrayItemRenderer = ({ arrayItem, children }: SummaryArrayItemRendererProps) => {
  const depth = getArrayDepth(arrayItem.id)
  const depthClass = depth > 1 ? 'pl-4 border-l-4 border-gray-300' : ''

  return (
    <div className={`mb-4 ${depthClass}`}>
      <div className="mb-2 font-semibold bg-gray-100 px-2 inline-block rounded-full">
        {arrayItem.title}
      </div>
      {children}
    </div>
  )
}

export const SummaryPdf = ({ tailwindCss, summaryJson }: SummaryPdfProps) => {
  return (
    <html>
      <head>
        <title>Summary PDF</title>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <style type="text/css">{tailwindCss}</style>
      </head>
      <body className="font-sans">
        <SummaryRenderer
          summaryJson={summaryJson}
          renderForm={FormRenderer}
          renderStep={StepRenderer}
          renderField={FieldRenderer}
          renderArray={ArrayRenderer}
          renderArrayItem={ArrayItemRenderer}
          renderDisplayValue={DisplayValueRenderer}
        />
      </body>
    </html>
  )
}
