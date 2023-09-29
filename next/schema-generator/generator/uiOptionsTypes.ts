// eslint-disable-next-line import/no-extraneous-dependencies
import { EnumOptionsType, UIOptionsType } from '@rjsf/utils'

// eslint-disable-next-line import/no-relative-packages
import { AccordionBase } from '../../components/forms/simple-components/Accordion'

export type FormSpacingType = 'large' | 'default' | 'small' | 'medium' | 'none'

export type WidgetUiOptions = {
  tooltip?: string
  helptext?: string
  // description prop is system prop that we need to be, we use helptext prop instead of description prop
  description?: string
  className?: string
  explicitOptional?: boolean
  accordion?: AccordionBase | AccordionBase[]
  additionalLinks?: Array<{
    title: string
    href: string
  }>
  spaceBottom?: FormSpacingType
  spaceTop?: FormSpacingType
}

type CheckboxOption = {
  value: string
  tooltip: string
}

export type CheckboxesUiOptions = {
  enumOptions?: EnumOptionsType[]
  variant?: 'basic' | 'boxed'
  checkboxOptions?: CheckboxOption[]
} & WidgetUiOptions

export type DatePickerUiOptions = WidgetUiOptions

export type InputFieldUiOptions = {
  type?: 'text' | 'password'
  resetIcon?: boolean
  leftIcon?: 'person' | 'mail' | 'call' | 'lock'
  size?: 'large' | 'default' | 'small'
} & WidgetUiOptions &
  Pick<UIOptionsType, 'placeholder'>

type RadioOption = {
  value: string
  tooltip: string
}

export type RadioButtonUiOptions = {
  enumOptions?: EnumOptionsType[]
  className?: string
  radioOptions?: RadioOption[]
  variant?: 'basic' | 'boxed' | 'card'
  orientations?: 'column' | 'row'
} & WidgetUiOptions

export type SelectFieldUiOptions = {
  enumOptions?: EnumOptionsType[]
  dropdownDivider?: boolean
  selectAllOption?: boolean
  explicitOptional?: boolean
  hideScrollbar?: boolean
  maxWordSize?: number
  // selectType?: 'one' | 'multiple' | 'arrow' | 'radio'
} & WidgetUiOptions

export type TextAreaUiOptions = WidgetUiOptions

export type TimePickerUiOptions = WidgetUiOptions

export type UploadUiOptions = {
  enumOptions?: EnumOptionsType[]
  size?: number
  accept?: string
  type?: 'button' | 'dragAndDrop'
} & WidgetUiOptions

export type ObjectFieldUiOptions = {
  objectDisplay?: 'columns'
  /**
   * Slash separated numeric values, e.g. '1/2' or '1/2/3'
   */
  objectColumnRatio?: string
}

export type SchemaUiOptions = {
  moreInformationUrl?: string
  titlePath?: string
  titleFallback?: string
}
