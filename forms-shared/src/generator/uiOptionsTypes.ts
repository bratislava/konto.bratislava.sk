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

export type WidgetUiOptions = WidgetSpacing & {
  tooltip?: string
  helptext?: string
  helptextHeader?: string
  className?: string
  belowComponents?: CustomComponentType[]
  rightComponents?: CustomComponentType[]
  size?: 'full' | 'medium' | 'small'
  labelSize?: LabelSize
}

export type CheckboxGroupUiOptions = {
  variant?: 'basic' | 'boxed'
} & WidgetUiOptions

export type CheckboxUiOptions = {
  variant?: 'basic' | 'boxed'
  checkboxLabel: string
} & WidgetUiOptions

export type DatePickerUiOptions = WidgetUiOptions

export type InputUiOptionsInputType = 'text' | 'password' | 'email' | 'tel'

export type InputUiOptions = {
  inputType: InputUiOptionsInputType
  resetIcon?: boolean
  leftIcon?: 'person' | 'mail' | 'call' | 'lock' | 'euro'
  placeholder?: string
} & WidgetUiOptions

export type NumberUiOptions = Omit<InputUiOptions, 'inputType'>

type RadioOption = {
  value: string
  description?: string
}

export type RadioGroupUiOptions = {
  className?: string
  radioOptions?: RadioOption[]
  variant?: 'basic' | 'boxed' | 'card'
  orientations?: 'column' | 'row'
} & WidgetUiOptions

type SelectOption = {
  title: string
  description?: string
}

export type SelectUiOptions = {
  selectOptions?: Record<string, SelectOption>
  placeholder?: string
} & WidgetUiOptions

export type TextAreaUiOptions = { placeholder?: string } & WidgetUiOptions

export type TimePickerUiOptions = WidgetUiOptions

export type FileUploadUiOptions = {
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

export type ObjectFieldUiOptions = Pick<WidgetUiOptions, 'spaceTop' | 'spaceBottom'> &
  ({
    /* @defaultValue `wrapper` */
    objectDisplay?: 'wrapper' | 'boxed'
    title?: string
    description?: string
  } & (
    | {
        columns?: false
      }
    | {
        columns: true
        /**
         * Slash separated numeric values, e.g. '1/2' or '1/2/3'
         */
        columnsRatio: string
      }
  ))

export type StepUiOptions = {
  stepQueryParam?: string
  stepperTitle?: string
}

export type SchemaUiOptions = {
  moreInformationUrl?: string
  titlePath?: string
  titleFallback?: string
}

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
  CustomComponents = 'CustomComponents',
}
