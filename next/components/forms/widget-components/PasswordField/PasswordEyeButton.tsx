import { EyeHiddenIcon, EyeIcon } from "@assets/ui-icons"
import cn from "frontend/cn"
import { useTranslation } from "next-i18next"
import { ToggleButton as RACToggleButton, ToggleButtonProps } from "react-aria-components"

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
      className={cn("flex size-11 items-center justify-center", className)}
      {...restProps}
    >
      {isPasswordHidden ? <EyeHiddenIcon /> : <EyeIcon />}
    </RACToggleButton>
  )
}

export default PasswordEyeButton
