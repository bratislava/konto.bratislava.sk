import { AlertIcon, ChevronDownIcon } from '@assets/ui-icons'
import { useFormData } from 'components/forms/useFormData'
import { getSummaryJsonBrowser } from 'forms-shared/summary-json/getSummaryJsonBrowser'
import {
  SummaryArrayItemRendererProps,
  SummaryArrayRendererProps,
  SummaryFieldRendererProps,
  SummaryFileValueRendererProps,
  SummaryFormRendererProps,
  SummaryRenderer,
  SummaryStepRendererProps,
  SummaryStringValueRendererProps,
} from 'forms-shared/summary-renderer/SummaryRenderer'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'
import { useIsSSR } from 'react-aria'

import { useFormContext } from '../../useFormContext'
import { useFormState } from '../../useFormState'
import { useFormValidatorRegistry } from '../../useFormValidatorRegistry'
import SummaryFile from './SummaryFile'
import SummaryRow from './SummaryRow'
import { useFormSummary } from './useFormSummary'

const FormRenderer = ({ children }: SummaryFormRendererProps) => (
  <div className="flex flex-col gap-8">{children}</div>
)

const StepRenderer = ({ step, children }: SummaryStepRendererProps) => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-h3-semibold">{step.title}</h3>
      <div>{children}</div>
    </div>
  )
}

const FieldRenderer = ({ field, hasError, children }: SummaryFieldRendererProps) => {
  const { goToStepByFieldId } = useFormState()

  return (
    <SummaryRow
      data={{
        label: field.label,
        value: <div className="flex flex-col gap-2">{children}</div>,
        name: field.id,
        isError: hasError,
      }}
      onGoToStep={() => {
        goToStepByFieldId(field.id)
      }}
      isEditable
      size="small"
    />
  )
}

const StringValueRenderer = ({ value }: SummaryStringValueRendererProps) => {
  return <span className="line-clamp-3 whitespace-pre-wrap">{value}</span>
}

const FileValueRenderer = ({ fileInfo }: SummaryFileValueRendererProps) => {
  return <SummaryFile fileInfo={fileInfo} />
}

const NoneValueRenderer = () => {
  const { t } = useTranslation('forms')

  return <span>{t('summary.none_value')}</span>
}

const InvalidValueRenderer = () => {
  const { t } = useTranslation('forms')

  return (
    <span>
      <div className="flex items-center gap-3 text-error">
        <div className="shrink-0">
          <AlertIcon />
        </div>
        {t('summary.invalid_value')}
      </div>
    </span>
  )
}

const ArrayRenderer = ({ array, children }: SummaryArrayRendererProps) => {
  return (
    <div className="mt-4">
      <div className="mb-4 text-p2-semibold">{array.title}</div>
      {children}
    </div>
  )
}

/**
 * Returns the depth of the array based on how many times the id contains a number, which is reliable for our use case.
 */
const getArrayDepth = (id: string) => id.split('_').filter((part) => part.match(/^\d+$/)).length

const ArrayItemRenderer = ({ arrayItem, children, hasError }: SummaryArrayItemRendererProps) => {
  const { t } = useTranslation('forms')
  const arrayDepth = getArrayDepth(arrayItem.id)

  if (arrayDepth === 1) {
    return (
      <details
        className="group mb-4 rounded-xl border border-gray-200 open:border-gray-700 hover:border-gray-500 open:hover:border-gray-700"
        open={false}
      >
        <summary className="group flex w-full cursor-pointer p-6">
          <div className="flex grow flex-col gap-1">
            <span className="text-p2-semibold">{arrayItem.title}</span>
            {hasError && (
              <div className="text-p2 text-category-700 group-open:hidden">
                {t('summary.contains_errors')}
              </div>
            )}
          </div>
          <span className="shrink-0" aria-hidden>
            <ChevronDownIcon className="transition-transform group-open:rotate-180" />
          </span>
        </summary>
        <div className="p-6 pt-0">{children}</div>
      </details>
    )
  }

  return (
    <div className="mb-4">
      <div className="mb-2 inline-block rounded-xl bg-gray-100 px-2 text-p2-semibold">
        {arrayItem.title}
      </div>
      {children}
    </div>
  )
}

const SummaryDetails = () => {
  const { formData } = useFormData()
  const { getValidatedSummary, fileInfos } = useFormSummary()
  const { validationData } = getValidatedSummary()
  const {
    formDefinition: { schema },
    initialSummaryJson,
  } = useFormContext()
  const validatorRegistry = useFormValidatorRegistry()
  const isSSR = useIsSSR()

  const summaryJson = useMemo(() => {
    if (isSSR) {
      // Node needs to use a different method to get the summary JSON (see `getSummaryJsonNode`).
      // No need to check if schema/formData matches the summary JSON as it is rendered only once on the server.
      return initialSummaryJson
    }

    return getSummaryJsonBrowser({ schema, formData, validatorRegistry })
  }, [isSSR, initialSummaryJson, schema, formData, validatorRegistry])

  if (!summaryJson) {
    return null
  }

  return (
    <SummaryRenderer
      summaryJson={summaryJson}
      fileInfos={fileInfos}
      validationData={validationData}
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

export default SummaryDetails
