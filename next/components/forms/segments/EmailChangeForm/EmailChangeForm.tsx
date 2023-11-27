import AccountErrorAlert from 'components/forms/segments/AccountErrorAlert/AccountErrorAlert'
import Button from 'components/forms/simple-components/Button'
import InputField from 'components/forms/widget-components/InputField/InputField'
import PasswordField from 'components/forms/widget-components/PasswordField/PasswordField'
import useHookForm from 'frontend/hooks/useHookForm'
import { useTranslation } from 'next-i18next'
import { Controller } from 'react-hook-form'

interface Data {
  newEmail: string
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
    newEmail: {
      type: 'string',
      minLength: 1,
      format: 'email',
      errorMessage: { minLength: 'account:email_required', format: 'account:email_format' },
    },
    password: {
      type: 'string',
      minLength: 1,
      errorMessage: { minLength: 'account:password_required' },
    },
  },
  required: ['newEmail', 'password'],
}

const EmailChangeForm = ({ onSubmit, error }: Props) => {
  const { t } = useTranslation('account')

  const {
    handleSubmit,
    control,
    errors,
    formState: { isSubmitting },
  } = useHookForm<Data>({
    schema,
    defaultValues: { newEmail: '', password: '' },
  })

  return (
    <form
      className="flex flex-col space-y-4"
      onSubmit={handleSubmit((data: Data) => onSubmit(data.newEmail, data.password))}
    >
      <h1 className="text-h3">{t('email_change_title')}</h1>
      <p className="text-p3 lg:text-p2">{t('new_email_text')}</p>
      <AccountErrorAlert error={error} />
      <Controller
        name="newEmail"
        control={control}
        render={({ field }) => (
          <InputField
            required
            label={t('new_email_label')}
            placeholder={t('email_placeholder')}
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
            label={t('new_email_password_label')}
            placeholder={t('password_placeholder')}
            {...field}
            errorMessage={errors.password}
          />
        )}
      />
      <Button
        className="min-w-full"
        type="submit"
        text={t('new_email_submit')}
        variant="category"
        disabled={isSubmitting}
      />
    </form>
  )
}

export default EmailChangeForm
