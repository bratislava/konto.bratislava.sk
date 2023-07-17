import { FieldProps } from '@rjsf/utils'
import React from 'react'

import { DoubledInputField } from '../../groups'
import { ExplicitOptionalType } from '../../types/ExplicitOptional'
import { FormSpacingType } from '../../types/WidgetOptions'
import {
  InputType,
  isInputSize,
  isLeftIconVariant,
  LeftIconVariants,
} from '../../widget-components/InputField/InputField'
import WidgetWrapper, { isFormSpacingType } from '../WidgetWrapper'

const DoubledInputFieldRJSF = ({
  formData,
  onChange,
  schema,
  uiSchema,
  errorSchema,
}: FieldProps) => {
  const keys = Object.keys({ ...schema.properties })

  const schemaProperties = {
    ...(schema.properties as Record<string, { type: string; title: string }>),
  }
  const uiOptions = uiSchema?.['ui:options'] ?? {}

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const valueFirst = formData?.[keys[0]]
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const valueSecond = formData?.[keys[1]]

  const handleOnChange = (name: string, event?: string) => {
    onChange({
      ...formData,
      [name]: event === '' ? undefined : event,
    })
  }

  const getLabel = (index: 0 | 1) => schemaProperties[keys[index]].title

  const inputType = (inputTypeName: 'FirstInputType' | 'SecondInputType') =>
    uiOptions?.[inputTypeName] === 'password' ? 'password' : 'text'

  const getLeftIcon = (
    iconInputPropValue: 'FirstInputLeftIcon' | 'SecondInputLeftIcon',
  ): LeftIconVariants | undefined => {
    const iconVariant = uiOptions?.[iconInputPropValue]
    return typeof iconVariant === 'string' && isLeftIconVariant(iconVariant)
      ? iconVariant
      : undefined
  }

  const getInputSize = (sizeInputPropValue: 'FirstInputSize' | 'SecondInputSize') => {
    const sizeVariant = uiOptions?.[sizeInputPropValue]
    return typeof sizeVariant === 'string' && isInputSize(sizeVariant) ? sizeVariant : undefined
  }

  const getFormSpacingType = (
    formSpacingType: 'spaceTop' | 'spaceBottom',
  ): FormSpacingType | undefined => {
    const formSpacingTypeVariant = uiOptions?.[formSpacingType]
    return typeof formSpacingTypeVariant === 'string' && isFormSpacingType(formSpacingTypeVariant)
      ? formSpacingTypeVariant
      : undefined
  }

  // TODO: fix this code block. Re check what kind of error message it returns and fix in a new way according new task
  const getErrorMessage = (propKey: string): string[] => errorSchema?.[propKey]?.__errors || []
  return (
    <WidgetWrapper
      accordion={uiSchema?.['ui:accordion']}
      spaceTop={getFormSpacingType('spaceTop')}
      spaceBottom={getFormSpacingType('spaceBottom')}
    >
      <div className={uiOptions?.className as string}>
        <DoubledInputField
          FirstInputLabel={getLabel(0)}
          SecondInputLabel={getLabel(1)}
          FirstInputValue={valueFirst}
          SecondInputValue={valueSecond}
          FirstInputHandler={(e) => handleOnChange(keys[0], e)}
          SecondInputHandler={(e) => handleOnChange(keys[1], e)}
          FirstInputPlaceholder={uiOptions?.FirstInputPlaceholder as string}
          SecondInputPlaceholder={uiOptions?.SecondInputPlaceholder as string}
          FirstInputTooltip={uiOptions?.FirstInputTooltip as string}
          SecondInputTooltip={uiOptions?.SecondInputTooltip as string}
          FirstInputDescription={uiOptions?.FirstInputDescription as string}
          SecondInputDescription={uiOptions?.SecondInputDescription as string}
          FirstInputType={uiOptions.FirstInputType as InputType}
          SecondInputType={inputType('SecondInputType')}
          FirstInputRequired={schema.required?.includes(keys[0])}
          SecondInputRequired={schema.required?.includes(keys[1])}
          FirstInputLeftIcon={getLeftIcon('FirstInputLeftIcon')}
          SecondInputLeftIcon={getLeftIcon('SecondInputLeftIcon')}
          FirstInputExplicitOptional={uiOptions?.FirstInputExplicitOptional as ExplicitOptionalType}
          SecondInputExplicitOptional={
            uiOptions?.SecondInputExplicitOptional as ExplicitOptionalType
          }
          FirstInputResetIcon={uiOptions?.FirstInputResetIcon as unknown as boolean}
          SecondInputResetIcon={uiOptions?.SecondInputResetIcon as unknown as boolean}
          FirstInputClassNames={uiOptions?.FirstInputClassNames as string}
          SecondInputClassNames={uiOptions?.SecondInputClassNames as string}
          FirstInputErrorMessage={getErrorMessage(keys[0])}
          SecondInputErrorMessage={getErrorMessage(keys[1])}
          FirstInputDisabled={uiOptions?.FirstInputDisabled as unknown as boolean}
          SecondInputDisabled={uiOptions?.SecondInputDisabled as unknown as boolean}
          FirstInputSize={getInputSize('FirstInputSize')}
          SecondInputSize={getInputSize('SecondInputSize')}
        />
      </div>
    </WidgetWrapper>
  )
}
export default DoubledInputFieldRJSF
