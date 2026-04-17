import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { ReactNode, useContext } from 'react'
import {
  RadioGroup as RACRadioGroup,
  RadioGroupProps as RACRadioGroupProps,
  RadioGroupStateContext,
} from 'react-aria-components'

import cn from '@/src/utils/cn'

import FieldWrapper from './_shared/FieldWrapper'
import { FieldBaseProps } from './_shared/types'

export interface RadioGroupProps extends Omit<RACRadioGroupProps, 'orientation'>, FieldBaseProps {
  orientation?: 'vertical' | 'horizontal'
  children: ReactNode
}

// Must be rendered as a descendant of RACRadioGroup to access RadioGroupStateContext.
// Calling setSelectedValue(null) on the shared state reliably clears the selection
// (natively typed to accept null), unlike calling the group's onChange prop with null.
const ResetButton = () => {
  const state = useContext(RadioGroupStateContext)
  const { t } = useTranslation('account')

  if (!state) return null

  return (
    <Button
      variant="plain"
      size="small"
      className="self-end font-medium"
      onPress={() => state.setSelectedValue(null)}
    >
      {t('RadioGroup.resetChoice')}
    </Button>
  )
}

const RadioGroup = ({
  label,
  displayOptionalLabel,
  labelSize,
  helptext,
  helptextFooter,
  errorMessage,
  orientation = 'vertical',
  children,
  ...rest
}: RadioGroupProps) => (
  <RACRadioGroup
    {...rest}
    orientation={orientation}
    isInvalid={!!errorMessage}
    validationBehavior="aria"
    className={cn('flex w-full flex-col gap-2', rest.className)}
  >
    <FieldWrapper
      label={label}
      isRequired={rest.isRequired}
      displayOptionalLabel={displayOptionalLabel}
      labelSize={labelSize}
      helptext={helptext}
      helptextFooter={helptextFooter}
      errorMessage={errorMessage}
    >
      <div className="flex flex-col gap-2">
        <div
          className={cn('flex', {
            'flex-col gap-3': orientation === 'vertical',
            'flex-row gap-6': orientation === 'horizontal',
          })}
        >
          {children}
        </div>

        {/* RadioGroup should usually be used as required. If it is not, consider another UI such as Select,
            or provide "None of above" option and make the group required.
            But in case it is optional, reset button is present. */}
        {rest.isRequired ? null : <ResetButton />}
      </div>
    </FieldWrapper>
  </RACRadioGroup>
)

export default RadioGroup
