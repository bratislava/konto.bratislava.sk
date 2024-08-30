import { GenericObjectType } from '@rjsf/utils'
import cx from 'classnames'
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

import FormMarkdown from '../../info-components/FormMarkdown'
import { useFormState } from '../../useFormState'
import { useFormWidget } from '../../useFormWidget'
import AccountMarkdown from '../AccountMarkdown/AccountMarkdown'

/**
 * Extracts the path of the RJSF component position, e.g.
 * "root_danZPozemkov_danZPozemkov_0_pozemky_0_customComponent1_gRbYIKNcAF__anyof_select"
 * to
 * ["danZPozemkov", "danZPozemkov", 0, "pozemky", 0, 0]
 *
 * If `levelsUp` is provided, the last `levelsUp` elements are removed.
 */
function getPath(inputString: string, levelsUp = 0) {
  const customComponentIndex = inputString.indexOf('_customComponent')
  if (customComponentIndex === -1 || !inputString.startsWith('root_')) {
    return null
  }

  // Extract the substring up to 'customComponent'
  const relevantPart = inputString.slice(0, Math.max(0, customComponentIndex))

  const withoutRoot = relevantPart.split('_').slice(1)
  if (levelsUp > 0) {
    return withoutRoot.slice(0, -levelsUp)
  }

  return withoutRoot
}

const Calculator = ({
  label,
  formula,
  dataContextLevelsUp,
  isLast,
  variant,
  missingFieldsMessage,
  unit,
}: CustomComponentCalculator & {
  isLast: boolean
  variant: CustomComponentCalculatorProps['variant']
}) => {
  const formatter = useNumberFormatter()
  const { formData } = useFormState()
  const { widget } = useFormWidget()

  const expression = useMemo(() => getFormCalculatorExpression(formula), [formula])

  const value = useMemo(() => {
    const path = getPath(widget?.id ?? '', dataContextLevelsUp)
    const dataAtPath = path ? (get(formData, path) as GenericObjectType) : null
    if (dataAtPath == null) {
      return null
    }

    return calculateFormCalculatorExpression(expression, dataAtPath)
  }, [expression, formData, dataContextLevelsUp, widget?.id])

  const wrapperClassName = cx('inline-flex items-center justify-start gap-8 self-stretch py-5', {
    'border-b-2': !isLast,
    'border-gray-200': !isLast && variant === 'white',
    'border-white': !isLast && variant === 'black',
  })

  const labelClassName = cx('text-p2-semibold max-w-[400px] shrink font-semibold', {
    'text-gray-800': variant === 'white',
    'text-white': variant === 'black',
  })

  const valueClassName = cx('text-p2-semibold grow basis-0 text-right', {
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
            {formatter.format(value)} <FormMarkdown pAsSpan>{unit}</FormMarkdown>
          </div>
        </>
      )}
    </div>
  )
}

const FormCalculator = ({ variant, label, calculators = [] }: CustomComponentCalculatorProps) => {
  const labelClassName = cx('text-h5', {
    'text-white': variant === 'black',
    'text-gray-700': variant === 'white',
  })

  const wrapperClassName = cx(
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
