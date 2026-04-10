import { useTranslation } from 'next-i18next'
import { forwardRef, Ref, useState } from 'react'
import { ToggleButton as RACToggleButton } from 'react-aria-components'

import { EyeHiddenIcon, EyeIcon } from '@/src/assets/ui-icons'
import cn from '@/src/utils/cn'

import TextField, { TextFieldProps } from './TextField'

export interface PasswordFieldProps extends Omit<TextFieldProps, 'type' | 'endIcon'> {}

const PasswordField = ({ ...props }: PasswordFieldProps,
  ref: Ref<HTMLInputElement>) => {
  const { t } = useTranslation('account')
  const [isPasswordHidden, setIsPasswordHidden] = useState(true)

  return (
    <TextField
      {...props}
      ref={ref}
      type={isPasswordHidden ? 'password' : 'text'}
      endIcon={
        <RACToggleButton
          aria-label={t('auth.fields.password_eyeButton.aria')}
          isSelected={!isPasswordHidden}
          onChange={(selected) => setIsPasswordHidden(!selected)}
          isDisabled={props.isDisabled}
          className={cn(
            'absolute inset-y-1/2 right-1 flex aspect-square h-full -translate-y-2/4 items-center justify-center',
          )}
        >
          {isPasswordHidden ? <EyeHiddenIcon /> : <EyeIcon />}
        </RACToggleButton>
      }
    />
  )
}

export default forwardRef(PasswordField)
