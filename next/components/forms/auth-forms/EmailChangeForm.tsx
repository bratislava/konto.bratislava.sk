import { useTranslation } from 'next-i18next'
import { Controller } from 'react-hook-form'

import AccountErrorAlert from '@/components/forms/segments/AccountErrorAlert/AccountErrorAlert'
import Button from '@/components/forms/simple-components/Button'
import InputField from '@/components/forms/widget-components/InputField/InputField'
import PasswordField from '@/components/forms/widget-components/PasswordField/PasswordField'
import useHookForm from '@/frontend/hooks/useHookForm'

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
      className="flex flex-col gap-4 md:gap-6"
      onSubmit={handleSubmit((data: Data) => onSubmit(data.newEmail, data.password))}
      data-cy="change-email-form"
    >
      <h1 className="text-h3">{t('auth.email_change_title')}</h1>
      <p className="text-p3 lg:text-p2">{t('auth.email_change_description')}</p>
      <AccountErrorAlert error={error} />
      <Controller
        name="newEmail"
        control={control}
        render={({ field }) => (
          <InputField
            required
            label={t('auth.fields.new_email_label')}
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
            label={t('auth.fields.new_email_password_label')}
            placeholder={t('auth.fields.password_placeholder')}
            {...field}
            errorMessage={errors.password}
          />
        )}
      />
      <Button
        variant="solid"
        type="submit"
        fullWidth
        isDisabled={isSubmitting}
        data-cy="change-email-submit"
      >
        {t('auth.email_change_submit')}
      </Button>
    </form>
  )
}

export default EmailChangeForm
