import { ReactNode } from 'react'

export type LabelSize = 'default' | 'h3' | 'h4' | 'h5'

/**
 * Props added on top of RAC's native props.
 * isRequired, isDisabled, className, name etc. come from RAC's props types.
 */
export interface FieldBaseProps {
  label: string
  displayOptionalLabel?: boolean
  labelSize?: LabelSize
  helptext?: ReactNode
  helptextFooter?: ReactNode
  errorMessage?: string
}
