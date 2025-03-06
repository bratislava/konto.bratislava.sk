import { GenericObjectType } from '@rjsf/utils'
import { useFormData } from 'components/forms/useFormData'
import {
  calculateFormCalculatorExpression,
  getFormCalculatorExpression,
} from 'forms-shared/form-calculators/calculators'
import {
  CustomComponentCalculator,
  CustomComponentCalculatorProps,
} from 'forms-shared/generator/uiOptionsTypes'
import get from 'lodash/get'
import React, { useMemo } from 'react'
import { useNumberFormatter } from 'react-aria'

import ConditionalFormMarkdown from '../../info-components/ConditionalFormMarkdown'
import AccountMarkdown from '../AccountMarkdown/AccountMarkdown'
import cn from '../../../../frontend/cn'

/**
 * Extracts the path of the RJSF component position, e.g.
 * `"root_danZPozemkov_danZPozemkov_0_pozemky_0_kalkulacka" is converted`
 * to
 * `["danZPozemkov", "danZPozemkov", "0", "pozemky", "0"]`
 *
 * If `levelsUp` is provided, the last `levelsUp` elements are removed.
 */
function getPath(id: string, levelsUp = 0) {
  const idParts = id.split('_')
  const withoutRootAndSelf = idParts.slice(1, -1)

  if (levelsUp > 0) {
    return withoutRootAndSelf.slice(0, -levelsUp)
  }

  return withoutRootAndSelf
}

const getDataAtPath = (formData: GenericObjectType, path: string[] | null) => {
  if (path == null) {
    return null
  }
  // Lodash's get function does not handle empty paths
  if (path.length === 0) {
    return formData
  }

  return get(formData, path) as GenericObjectType
}

const Calculator = ({
  label,
  formula,
  dataContextLevelsUp,
  id,
  isLast,
  variant,
  missingFieldsMessage,
  unit,
  unitMarkdown,
}: CustomComponentCalculator & {
  id: string
  isLast: boolean
  variant: CustomComponentCalculatorProps['variant']
}) => {
  const formatter = useNumberFormatter()
  const { formData } = useFormData()

  const expression = useMemo(() => getFormCalculatorExpression(formula, true), [formula])
  const dataAtPath = useMemo(() => {
    const path = getPath(id, dataContextLevelsUp)
    return getDataAtPath(formData, path)
  }, [id, dataContextLevelsUp, formData])
  const value = useMemo(() => {
    if (dataAtPath == null) {
      return null
    }

    return calculateFormCalculatorExpression(expression, dataAtPath, true)
  }, [expression, dataAtPath])

  const wrapperClassName = cn('inline-flex items-center justify-start gap-8 self-stretch py-5', {
    'border-b-2': !isLast,
    'border-gray-200': !isLast && variant === 'white',
    'border-white': !isLast && variant === 'black',
  })

  const labelClassName = cn('max-w-[400px] shrink text-p2-semibold font-semibold', {
    'text-gray-800': variant === 'white',
    'text-white': variant === 'black',
  })

  const valueClassName = cn('grow basis-0 text-right text-p2-semibold', {
    'text-gray-700': variant === 'white',
    'text-white': variant === 'black',
  })

  return (
    <div className={wrapperClassName}>
      {value == null ? (
        <AccountMarkdown content={missingFieldsMessage} variant="sm" />
      ) : (
        <>
          <div className={labelClassName}>{label}</div>
          <div className={valueClassName}>
            {formatter.format(value)}{' '}
            <ConditionalFormMarkdown isMarkdown={unitMarkdown} pAsSpan>
              {unit}
            </ConditionalFormMarkdown>
          </div>
        </>
      )}
    </div>
  )
}

const FormCalculator = ({
  id,
  variant,
  label,
  calculators = [],
}: CustomComponentCalculatorProps & { id: string }) => {
  const labelClassName = cn('text-h5', {
    'text-white': variant === 'black',
    'text-gray-700': variant === 'white',
  })

  const wrapperClassName = cn(
    'flex flex-col items-start justify-center gap-2 rounded-lg p-6 pb-1',
    {
      'pt-1': !label,
      'bg-gray-800 text-white': variant === 'black',
      'border border-zinc-300': variant === 'white',
    },
  )

  return (
    <div>
      <div className={wrapperClassName}>
        {label && <span className={labelClassName}>{label}</span>}
        <div className="flex flex-col items-start justify-center self-stretch">
          {calculators.map((calculator, index) => (
            <Calculator
              key={index}
              {...calculator}
              id={id}
              isLast={index === calculators.length - 1}
              variant={variant}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default FormCalculator
