import { FormSpacingType } from '../../types/WidgetOptions'
import { isFormSpacingType } from '../WidgetWrapper'

export const getFormSpacingType = (
  formSpacingType: 'spaceTop' | 'spaceBottom',
  spacing: any,
): FormSpacingType | undefined => {
  return typeof spacing === 'string' && isFormSpacingType(spacing) ? spacing : undefined
}
