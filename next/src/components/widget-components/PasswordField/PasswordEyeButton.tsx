import { useTranslation } from 'next-i18next/pages'
import {
  ToggleButton as RACToggleButton,
  ToggleButtonProps,
} from 'react-aria-components/ToggleButton'

import Icon from '@/src/components/icon-components/Icon'
import cn from '@/src/utils/cn'

type Props = {
  isPasswordHidden: boolean
  onToggle: (isPasswordHidden: boolean) => void
} & Omit<ToggleButtonProps, 'isSelected' | 'onChange' | 'children'>

/**
 * Based on RAC ToggleButton: https://react-spectrum.adobe.com/react-aria/ToggleButton.html
 * Read more: https://medium.com/@web-accessibility-education/dos-and-donts-of-accessible-show-password-buttons-9a5fbc2c566b
 */

const PasswordEyeButton = ({ isPasswordHidden, onToggle, className, ...restProps }: Props) => {
  const { t } = useTranslation('account')

  return (
    <RACToggleButton
      aria-label={t('auth.fields.password_eyeButton.aria')}
      isSelected={!isPasswordHidden}
      onChange={(selected) => onToggle(!selected)}
      className={cn('flex items-center justify-center base-focus-ring', className)}
      {...restProps}
    >
      {isPasswordHidden ? <Icon name="eye-hide" /> : <Icon name="eye" />}
    </RACToggleButton>
  )
}

export default PasswordEyeButton
