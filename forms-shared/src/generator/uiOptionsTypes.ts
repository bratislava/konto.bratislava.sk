import type { IntClosedRange } from 'type-fest' with { 'resolution-mode': 'import' }

import { EnumMetadata } from './optionItems'

export type CustomComponentAccordionProps = {
  title: string
  content: string
}

export type CustomComponentAdditionalLinksProps = {
  links: {
    title: string
    href: string
  }[]
}

export type CustomComponentCalculator = {
  label: string
  formula: string
  missingFieldsMessage: string
  unit: string
  unitMarkdown?: boolean
  /**
   * The dataContextLevelsUp is an optional parameter that specifies the number of levels to go up in the JSON data
   * context for formula in hierarchy from the current position. This is useful when you want to retrieve or access data
   * from an upper level in the JSON object.
   */
  dataContextLevelsUp?: number
}

export type CustomComponentAlertProps = {
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
}

export type CustomComponentCalculatorProps = {
  label?: string
  variant: 'white' | 'black'
  calculators: CustomComponentCalculator[]
}

export type CustomComponentType =
  | {
      type: 'accordion'
      props: CustomComponentAccordionProps
    }
  | {
      type: 'additionalLinks'
      props: CustomComponentAdditionalLinksProps
    }
  | {
      type: 'calculator'
      props: CustomComponentCalculatorProps
    }
  | {
      type: 'alert'
      props: CustomComponentAlertProps
    }

export type LabelSize = 'default' | 'h5' | 'h4' | 'h3'

export type FormSpacingType = 'large' | 'default' | 'small' | 'medium' | 'none'

export type WidgetSpacing = {
  spaceTop?: FormSpacingType
  spaceBottom?: FormSpacingType
}

export type WidgetWrapperOptions = {
  className?: string
  belowComponents?: CustomComponentType[]
  rightComponents?: CustomComponentType[]
}

export type WidgetUiOptions = WidgetSpacing &
  WidgetWrapperOptions & {
    helptext?: string
    helptextMarkdown?: boolean
    helptextFooter?: string
    helptextFooterMarkdown?: boolean
    size?: 'full' | 'medium' | 'small'
    labelSize?: LabelSize
    /* @defaultValue `4/4` */
    selfColumn?: '1/4' | '2/4' | '3/4' | '4/4'
  }

export type CheckboxGroupUiOptions = {
  enumMetadata: EnumMetadata<string>[]
  variant?: 'basic' | 'boxed'
} & WidgetUiOptions

export type CheckboxUiOptions = {
  variant?: 'basic' | 'boxed'
  checkboxLabel: string
} & WidgetUiOptions

export type DatePickerUiOptions = WidgetUiOptions

export type InputUiOptionsInputType = 'text' | 'password' | 'email' | 'tel'

export const inputWidthCharactersMin = 1
export const inputWidthCharactersMax = 40

export const inputWidthFractions = ['full', '3/4', '2/3', '1/2', '1/3', '1/4'] as const

export type InputWidthFraction = (typeof inputWidthFractions)[number]

/**
 * A number is an approximate width in characters, an integer between `inputWidthCharactersMin` and
 * `inputWidthCharactersMax`. A fraction is a share of the available width, applied from the `md`
 * breakpoint up and full width below it.
 *
 * Narrows only the input, never past the available space. Label, helptext and error message keep
 * the full width.
 * See the part "Fixed width inputs" on https://design-system.service.gov.uk/components/text-input/
 *
 * TODO: migrate the remaining `size` usages, that will replace current `size` behaviour.
 */
export type InputWidthType =
  | IntClosedRange<typeof inputWidthCharactersMin, typeof inputWidthCharactersMax>
  | InputWidthFraction

export type InputUiOptions = {
  inputType: InputUiOptionsInputType
  inputWidth?: InputWidthType
  placeholder?: string
} & WidgetUiOptions

export type NumberUiOptions = Omit<InputUiOptions, 'inputType'> & {
  formatOptions?: Intl.NumberFormatOptions
  unit?: string
}

export type RadioGroupUiOptions = {
  enumMetadata: EnumMetadata<string | boolean>[]
  variant?: 'basic' | 'boxed' | 'card'
  orientations?: 'column' | 'row'
} & WidgetUiOptions

export type SelectUiOptions = {
  enumMetadata: EnumMetadata<string>[]
  placeholder?: string
} & WidgetUiOptions

export type TextAreaUiOptions = { placeholder?: string } & WidgetUiOptions

export type TimePickerUiOptions = WidgetUiOptions

export type FileUploadUiOptions = {
  slotId: string
  sizeLimit?: number
  accept?: string
  type?: 'button' | 'dragAndDrop'
} & WidgetUiOptions

export type CustomComponentFieldUiOptions = Pick<WidgetUiOptions, 'spaceTop' | 'spaceBottom'> & {
  customComponents?: CustomComponentType[]
}

export type ArrayFieldUiOptions = Pick<WidgetUiOptions, 'spaceTop' | 'spaceBottom'> & {
  hideTitle?: boolean
  description?: string
  descriptionMarkdown?: boolean
  addButtonLabel: string
  itemTitle?: string
  cannotAddItemMessage?: string
} & (
    | {
        variant: 'topLevel'
        addTitle?: string
        addDescription?: string
      }
    | {
        variant: 'nested'
      }
  )

export type ObjectFieldUiOptions = Pick<WidgetUiOptions, 'spaceTop' | 'spaceBottom'> & {
  /* @defaultValue `wrapper` */
  objectDisplay?: 'wrapper' | 'boxed'
  title?: string
  description?: string
  descriptionMarkdown?: boolean
}

export type StepUiOptions = {
  stepQueryParam?: string
  stepperTitle?: string
} & Pick<ObjectFieldUiOptions, 'description' | 'descriptionMarkdown'>

/**
 * Unique prefix for Markdown text.
 */
export const markdownTextPrefix = `markdown_gKgflRNwdS:`

export enum BaWidgetType {
  Select = 'Select',
  SelectMultiple = 'SelectMultiple',
  Input = 'Input',
  Number = 'Number',
  RadioGroup = 'RadioGroup',
  TextArea = 'TextArea',
  Checkbox = 'Checkbox',
  CheckboxGroup = 'CheckboxGroup',
  FileUpload = 'FileUpload',
  FileUploadMultiple = 'FileUploadMultiple',
  DatePicker = 'DatePicker',
  TimePicker = 'TimePicker',
}

export enum BaFieldType {
  CustomComponents = 'CustomComponents',
}
