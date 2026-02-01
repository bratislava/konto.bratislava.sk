import { EyeHiddenIcon, EyeIcon } from "@assets/ui-icons"
import cn from "frontend/cn"
import { useTranslation } from "next-i18next"
import { ButtonHTMLAttributes } from "react"

type Props = {
  isPasswordHidden: boolean

} & ButtonHTMLAttributes<HTMLButtonElement>

/**
 * Inspired by https://medium.com/@web-accessibility-education/dos-and-donts-of-accessible-show-password-buttons-9a5fbc2c566b
 */

const PasswordEyeButton = ({ isPasswordHidden, className, ...props }: Props) => {
  const { t } = useTranslation('account')

  return (
    <button
      type="button"
      aria-label={t('auth.fields.password_eyeButton.aria')}
      aria-pressed={!isPasswordHidden}
      className={cn("absolute inset-y-1/2 right-1 flex size-11 -translate-y-2/4 cursor-pointer items-center justify-center", className)}
      {...props}
    >
      {isPasswordHidden ? <EyeHiddenIcon /> : <EyeIcon />}
    </button>
  )
}

export default PasswordEyeButton
