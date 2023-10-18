// eslint-disable-next-line import/no-extraneous-dependencies
import type { RJSFSchema, UIOptionsType, UiSchema } from '@rjsf/utils'

// eslint-disable-next-line import/no-relative-packages
import { AccordionBase } from '../../components/forms/simple-components/Accordion'

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

export type FormSpacingType = 'large' | 'default' | 'small' | 'medium' | 'none'

export type WidgetUiOptions = {
  tooltip?: string
  helptext?: string
  className?: string
  explicitOptional?: boolean
  spaceBottom?: FormSpacingType
  spaceTop?: FormSpacingType
  belowComponents?: CustomComponentType[]
  rightComponents?: CustomComponentType[]
}

type CheckboxOption = {
  value: string
  tooltip: string
}

export type CheckboxesUiOptions = {
  variant?: 'basic' | 'boxed'
  checkboxOptions?: CheckboxOption[]
} & WidgetUiOptions

export type DatePickerUiOptions = WidgetUiOptions

export type InputFieldUiOptions = {
  type?: 'text' | 'password' | 'email' | 'tel' | 'number'
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
  className?: string
  radioOptions?: RadioOption[]
  variant?: 'basic' | 'boxed' | 'card'
  orientations?: 'column' | 'row'
} & WidgetUiOptions

export type SelectFieldUiOptions = {
  dropdownDivider?: boolean
  selectAllOption?: boolean
  explicitOptional?: boolean
  hideScrollbar?: boolean
  maxWordSize?: number
  // selectType?: 'one' | 'multiple' | 'arrow' | 'radio'
} & WidgetUiOptions

export type TextAreaUiOptions = WidgetUiOptions & Pick<UIOptionsType, 'placeholder'>

export type TimePickerUiOptions = WidgetUiOptions

export type UploadUiOptions = {
  size?: number
  accept?: string
  type?: 'button' | 'dragAndDrop'
} & WidgetUiOptions

export type CustomComponentFieldUiOptions = Pick<WidgetUiOptions, 'spaceTop' | 'spaceBottom'> & {
  customComponents?: CustomComponentType[]
}

export type ArrayFieldUiOptions = Pick<WidgetUiOptions, 'spaceTop' | 'spaceBottom'> & {
  title?: string
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
      }
  )

export type SchemaUiOptions = {
  moreInformationUrl?: string
  titlePath?: string
  titleFallback?: string
}
