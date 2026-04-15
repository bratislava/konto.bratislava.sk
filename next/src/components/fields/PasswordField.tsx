import { useTranslation } from 'next-i18next/pages'
import { forwardRef, Ref, useState } from 'react'
import { ToggleButton as RACToggleButton } from 'react-aria-components'

import { EyeHiddenIcon, EyeIcon } from '@/src/assets/ui-icons'

import TextField, { TextFieldProps } from './TextField'

export type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'endIcon' | 'placeholder'>

const PasswordField = (props: PasswordFieldProps, ref: Ref<HTMLInputElement>) => {
  const { t } = useTranslation('account')
  const [isHidden, setIsHidden] = useState(true)

  return (
    <TextField
      {...props}
      ref={ref}
      type={isHidden ? 'password' : 'text'}
      endIcon={
        <RACToggleButton
          aria-label={t('auth.fields.password_eyeButton.aria')}
          isSelected={!isHidden}
          onChange={(selected) => setIsHidden(!selected)}
          // eslint-disable-next-line react/destructuring-assignment
          isDisabled={props.isDisabled}
          className="flex items-center justify-center p-3"
        >
          {isHidden ? <EyeHiddenIcon /> : <EyeIcon />}
        </RACToggleButton>
      }
    />
  )
}

export default forwardRef(PasswordField)
