import { useTranslation } from 'next-i18next'
import { Controller } from 'react-hook-form'

import useHookForm from '../../../frontend/hooks/useHookForm'
import AccountErrorAlert from '../segments/AccountErrorAlert/AccountErrorAlert'
import Button from '../simple-components/Button'
import PasswordField from '../widget-components/PasswordField/PasswordField'

interface Data {
  oldPassword: string
  password: string
}

interface Props {
  onSubmit: (oldPassword: string, password: string) => Promise<any>
  error?: Error | null
}

// must use `minLength: 1` to implement required field
const schema = {
  type: 'object',
  properties: {
    oldPassword: {
      type: 'string',
      // min length set to 2 according to cognito error InvalidParameterException:
      // 1 validation error detected: Value at 'previousPassword' failed to satisfy constraint: Member must satisfy regular expression pattern: ^[\S]+.*[\S]+$
      minLength: 2,
      errorMessage: { minLength: 'account:auth.fields.password_required' },
    },
    password: {
      type: 'string',
      minLength: 1,
      format: 'password',
      errorMessage: {
        minLength: 'account:auth.fields.password_required',
        format: 'account:auth.fields.password_format',
      },
    },
  },
  required: ['oldPassword', 'password'],
}

const PasswordChangeForm = ({ onSubmit, error }: Props) => {
  const { t } = useTranslation('account')
  const {
    handleSubmit,
    control,
    errors,
    formState: { isSubmitting },
  } = useHookForm<Data>({
    schema,
    defaultValues: { oldPassword: '', password: '' },
  })

  return (
    <form
      className="flex flex-col gap-4 md:gap-6"
      onSubmit={handleSubmit((data: Data) => onSubmit(data.oldPassword, data.password))}
      data-cy="change-password-form"
    >
      <h1 className="text-h3">{t('auth.password_change_title')}</h1>
      <AccountErrorAlert error={error} />
      <Controller
        name="oldPassword"
        control={control}
        render={({ field }) => (
          <PasswordField
            required
            label={t('auth.fields.old_password_label')}
            placeholder={t('auth.fields.old_password_placeholder')}
            {...field}
            errorMessage={errors.oldPassword}
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <PasswordField
            required
            autoComplete="new-password"
            label={t('auth.fields.new_password_label')}
            placeholder={t('auth.fields.new_password_placeholder')}
            helptext={t('auth.fields.password_description')}
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
        data-cy="change-password-submit"
      >
        {t('auth.old_password_submit_new')}
      </Button>
    </form>
  )
}

export default PasswordChangeForm
