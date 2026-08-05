import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { Controller } from 'react-hook-form'

import PasswordField from '@/src/components/fields/PasswordField'
import TextField from '@/src/components/fields/TextField'
import AccountErrorAlert from '@/src/components/segments/AccountErrorAlert/AccountErrorAlert'
import AccountLink from '@/src/components/segments/AccountLink/AccountLink'
import { useAmplifyClientOAuthContext } from '@/src/frontend/hooks/useAmplifyClientOAuthContext'
import useHookForm from '@/src/frontend/hooks/useHookForm'

interface Data {
  email: string
  password: string
}

interface Props {
  onSubmit: (email: string, password: string) => Promise<any>
  error?: Error | null
}

// must use `minLength: 1` to implement required field
const schema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      minLength: 1,
      format: 'email',
      errorMessage: {
        minLength: 'account:auth.fields.email.required',
        format: 'account:auth.fields.email.format',
      },
    },
    password: {
      type: 'string',
      minLength: 1,
      errorMessage: { minLength: 'account:auth.fields.password.required' },
    },
  },
  required: ['email', 'password'],
}

const LoginForm = ({ onSubmit, error }: Props) => {
  const { t } = useTranslation('account')
  const { isOAuthLogin, clientTitle } = useAmplifyClientOAuthContext()

  const {
    handleSubmit,
    control,
    errors,
    formState: { isSubmitting },
  } = useHookForm<Data>({
    schema,
    defaultValues: { email: '', password: '' },
  })

  return (
    <form
      className="flex flex-col gap-4 lg:gap-6"
      onSubmit={handleSubmit((data: Data) => onSubmit(data.email, data.password))}
      data-cy="login-container"
    >
      <Typography variant="h3" as="h1">
        {t('LoginForm.title')}
      </Typography>
      <AccountErrorAlert error={error} />
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            isRequired
            label={t('auth.fields.email.label')}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            {...field}
            errorMessage={errors.email}
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <PasswordField
            isRequired
            label={t('auth.fields.password.label')}
            autoComplete="current-password"
            {...field}
            errorMessage={errors.password}
          />
        )}
      />
      <AccountLink variant="forgotten-password" />
      <Button
        variant="solid"
        type="submit"
        fullWidth
        isDisabled={isSubmitting}
        data-cy="login-button"
      >
        {isOAuthLogin && clientTitle
          ? t('LoginForm.continueToOauthOrigin', { clientTitle })
          : t('LoginForm.submit')}
      </Button>
    </form>
  )
}

export default LoginForm
