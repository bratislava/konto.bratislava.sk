import { useTranslation } from 'next-i18next'
import { Controller } from 'react-hook-form'

import useHookForm from '../../../frontend/hooks/useHookForm'
import { useAmplifyClientOAuthContext } from '../../../frontend/utils/useAmplifyClientOAuthContext'
import AccountErrorAlert from '../segments/AccountErrorAlert/AccountErrorAlert'
import AccountLink from '../segments/AccountLink/AccountLink'
import Button from '../simple-components/Button'
import InputField from '../widget-components/InputField/InputField'
import PasswordField from '../widget-components/PasswordField/PasswordField'

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
        minLength: 'account:auth.fields.email_required',
        format: 'account:auth.fields.email_format',
      },
    },
    password: {
      type: 'string',
      minLength: 1,
      errorMessage: { minLength: 'account:auth.fields.password_required' },
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
      className="flex flex-col gap-4 md:gap-6"
      onSubmit={handleSubmit((data: Data) => onSubmit(data.email, data.password))}
      data-cy="login-container"
    >
      <h1 className="text-h3">{t('auth.login_title')}</h1>
      <AccountErrorAlert error={error} />
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <InputField
            required
            label={t('auth.fields.email_label')}
            placeholder={t('auth.fields.email_placeholder')}
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
            required
            label={t('auth.fields.password_label')}
            placeholder={t('auth.fields.password_placeholder')}
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
          ? t('auth.login_page.continue_to_oauth_origin', { clientTitle })
          : t('auth.login_submit')}
      </Button>
    </form>
  )
}

export default LoginForm
