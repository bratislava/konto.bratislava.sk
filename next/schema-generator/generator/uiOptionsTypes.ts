// eslint-disable-next-line import/no-extraneous-dependencies
import type { RJSFSchema, UIOptionsType, UiSchema } from '@rjsf/utils'

// eslint-disable-next-line import/no-relative-packages
import { AccordionBase } from '../../components/forms/simple-components/Accordion'
// eslint-disable-next-line import/no-relative-packages
import { FieldSize } from '../../components/forms/widget-components/FieldBase'

// TODO: Reconsider stability of dependency on AccordionBase type
export type CustomComponentAccordionProps = AccordionBase

export type CustomComponentAdditionalLinksProps = {
  links: {
    title: string
    href: string
  }[]
}

export type CustomComponentPropertyCalculatorProps = {
  title: string
  openButtonLabel: string
  buttonLabel: string
  valueLabel: string
  form: {
    schema: RJSFSchema
    uiSchema: UiSchema
  }
  /**
   * `expr-eval` formula, with custom function `evalRatio` that evaluates ratio in format `A/B` to
   *  decimal number.
   */
  formula: string
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
      type: 'propertyTaxCalculator'
      props: CustomComponentPropertyCalculatorProps
    }

export type LabelSize = 'default' | 'h4' | 'h3'
export type LabelSpacing = 'default' | 'h4' | 'h3'
export type HelptextPosition = 'header' | 'footer'

export type FormSpacingType = 'large' | 'default' | 'small' | 'medium' | 'none'

export type WidgetSpacing = {
  spaceTop?: FormSpacingType
  spaceBottom?: FormSpacingType
}

export type WidgetUiOptions = WidgetSpacing & {
  tooltip?: string
  helptext?: string
  helptextPosition?: HelptextPosition
  className?: string
  belowComponents?: CustomComponentType[]
  rightComponents?: CustomComponentType[]
  size?: FieldSize
  labelSize?: LabelSize
  labelSpacing?: LabelSpacing
}

type CheckboxOption = {
  value: string
  tooltip?: string
}

export type CheckboxGroupUiOptions = {
  variant?: 'basic' | 'boxed'
  checkboxOptions?: CheckboxOption[]
} & WidgetUiOptions

export type DatePickerUiOptions = WidgetUiOptions

export type InputUiOptions = {
  type?: 'text' | 'password' | 'email' | 'tel' | 'number'
  resetIcon?: boolean
  leftIcon?: 'person' | 'mail' | 'call' | 'lock'
} & WidgetUiOptions &
  Pick<UIOptionsType, 'placeholder'>

type RadioOption = {
  value: string
  tooltip?: string
  description?: string
}

export type RadioGroupUiOptions = {
  className?: string
  radioOptions?: RadioOption[]
  variant?: 'basic' | 'boxed' | 'card'
  orientations?: 'column' | 'row'
} & WidgetUiOptions

export type SelectUiOptions = {
  dropdownDivider?: boolean
  selectAllOption?: boolean
  hideScrollbar?: boolean
  maxWordSize?: number
  // selectType?: 'one' | 'multiple' | 'arrow' | 'radio'
} & WidgetUiOptions

export type TextAreaUiOptions = WidgetUiOptions & Pick<UIOptionsType, 'placeholder'>

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
  (
    | {
        objectDisplay?: 'columns'
        /**
         * Slash separated numeric values, e.g. '1/2' or '1/2/3'
         */
        objectColumnRatio?: string
      }
    | {
        objectDisplay?: 'boxed'
        title?: string
        description?: string
      }
  )

export type SchemaUiOptions = {
  moreInformationUrl?: string
  titlePath?: string
  titleFallback?: string
}

/**
 * Unique prefix for Markdown text.
 */
export const markdownTextPrefix = `markdown_gKgflRNwdS:`
