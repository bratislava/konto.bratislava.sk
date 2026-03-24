import {
  Input,
  TextField as RACTextField,
  TextFieldProps as RACTextFieldProps,
  ValidationResult,
} from 'react-aria-components'

import { FieldSize } from '@/src/components/widget-components/FieldBase'
import Description from '@/src/components/widget-components/TextField/Description'
import ErrorMessage from '@/src/components/widget-components/TextField/ErrorMessage'
import { getDataCyAttribute } from '@/src/components/widget-components/TextField/getDataCyAttribute'
import Label, { LabelProps } from '@/src/components/widget-components/TextField/Label'
import cn from '@/src/utils/cn'

export type TextFieldProps = RACTextFieldProps & {
  label?: string
  helptext?: string
  isMarkdownHelptext?: boolean
  helptextFooter?: string
  isMarkdownHelptextFooter?: boolean
  placeholder?: string
  startIcon?: 'email' // add more if needed
  errorMessage?: string | ((validation: ValidationResult) => string)
  size?: FieldSize
} & Pick<LabelProps, 'labelSize' | 'displayOptionalLabel'>

const TextField = ({
  className,
  size,
  helptext,
  isMarkdownHelptext,
  helptextFooter,
  isMarkdownHelptextFooter,
  errorMessage,
  label,
  labelSize,
  displayOptionalLabel,
  ...rest
}: TextFieldProps) => {
  const style = cn(
    'w-full rounded-lg border bg-background-passive-base text-16 caret-border-active-focused',
    'px-3 py-2 lg:px-4 lg:py-3',
    'border-border-active-default focus:border-border-active-focused focus:outline-hidden',
    rest.isDisabled
      ? 'border-border-active-disabled bg-background-passive-tertiary text-content-passive-tertiary'
      : cn(
          'hover:border-border-active-hover',
          {
            'border-error hover:border-error focus:border-error': errorMessage,
          },
          className,
        ),
  )

  return (
    <RACTextField
      className={cn('flex w-full flex-col gap-2', {
        'max-w-97': size === 'medium',
        'max-w-50': size === 'small',
      })}
      // TODO revisit validation
      isInvalid={!!errorMessage && !rest.isDisabled}
      {...rest}
    >
      <Label labelSize={labelSize} displayOptionalLabel={displayOptionalLabel}>
        {label}
      </Label>

      {helptext ? (
        <Description helptext={helptext} isMarkdownHelptext={isMarkdownHelptext} />
      ) : null}

      <div className="relative">
        <Input className={style} data-cy={getDataCyAttribute('text', rest.name)} />
      </div>

      <ErrorMessage>{errorMessage}</ErrorMessage>

      {helptextFooter ? (
        <Description helptext={helptextFooter} isMarkdownHelptext={isMarkdownHelptextFooter} />
      ) : null}
    </RACTextField>
  )
}

export default TextField
