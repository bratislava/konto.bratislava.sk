import AccountErrorAlert from 'components/forms/segments/AccountErrorAlert/AccountErrorAlert'
import LoginAccountLink from 'components/forms/segments/LoginAccountLink/LoginAccountLink'
import Button from 'components/forms/simple-components/ButtonNew'
import InputField from 'components/forms/widget-components/InputField/InputField'
import { useTranslation } from 'next-i18next'
import { Controller } from 'react-hook-form'

import useHookForm from '../../../../frontend/hooks/useHookForm'

interface Data {
  email: string
}

interface Props {
  onSubmit: (email: string) => Promise<any>
  error?: Error | null
  lastEmail: string
  setLastEmail: (email: string) => void
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
  },
  required: ['email'],
}

const ForgottenPasswordForm = ({ onSubmit, error, lastEmail, setLastEmail }: Props) => {
  const { t } = useTranslation('account')
  const {
    handleSubmit,
    control,
    errors,
    formState: { isSubmitting },
  } = useHookForm<Data>({
    schema,
    defaultValues: { email: '' },
  })

  return (
    <form
      className="flex flex-col space-y-4"
      data-cy="forgotten-password-form"
      onSubmit={handleSubmit((data: Data) => {
        setLastEmail(data.email)
        return onSubmit(data.email)
      })}
    >
      <h1 className="text-h3">{t('auth.forgotten_password_title')}</h1>
      <AccountErrorAlert error={error} args={{ email: lastEmail }} />
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
      <Button variant="black-solid" type="submit" fullWidth isDisabled={isSubmitting}>
        {t('auth.forgotten_password_submit')}
      </Button>
      <LoginAccountLink />
    </form>
  )
}

export default ForgottenPasswordForm
