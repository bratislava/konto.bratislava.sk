import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'
import { Controller } from 'react-hook-form'

import useHookForm from '../../../frontend/hooks/useHookForm'
import logger from '../../../frontend/utils/logger'
import AccountErrorAlert from '../segments/AccountErrorAlert/AccountErrorAlert'
import AccountLink from '../segments/AccountLink/AccountLink'
import Button from '../simple-components/Button'
import InputField from '../widget-components/InputField/InputField'
import PasswordField from '../widget-components/PasswordField/PasswordField'

interface Data {
  verificationCode: string
  password: string
}

interface Props {
  onSubmit: (verificationCode: string, password: string) => Promise<any>
  onResend: () => Promise<any>
  error?: Error | null
  lastEmail: string
  fromMigration?: boolean
}

// must use `minLength: 1` to implement required field
const schema = {
  type: 'object',
  properties: {
    verificationCode: {
      type: 'string',
      minLength: 1,
      format: 'verificationCode',
      errorMessage: {
        minLength: 'account:auth.fields.verification_code_required',
        format: 'account:auth.fields.verification_code_format',
      },
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
  required: ['verificationCode', 'password'],
}

const NewPasswordForm = ({ onSubmit, error, onResend, lastEmail, fromMigration }: Props) => {
  const [lastVerificationCode, setLastVerificationCode] = useState<string>('')
  const { t } = useTranslation('account')
  const {
    handleSubmit,
    control,
    errors,
    formState: { isSubmitting },
  } = useHookForm<Data>({
    schema,
    defaultValues: { verificationCode: '', password: '' },
  })

  const [cnt, setCnt] = useState(60)
  useEffect(() => {
    if (cnt > 0) {
      setTimeout(() => setCnt((state) => state - 1), 1000)
    }
  }, [cnt])

  const handleResend = async () => {
    setCnt(60)
    await onResend()
  }

  return (
    <form
      className="flex flex-col gap-4 md:gap-6"
      data-cy="new-password-form"
      onSubmit={handleSubmit((data: Data) => {
        setLastVerificationCode(data.verificationCode)
        return onSubmit(data.verificationCode, data.password).catch((error_) =>
          logger.error('Submit failed', error_),
        )
      })}
    >
      <h1 className="text-h3">
        {fromMigration ? t('auth.migration_new_password_title') : t('auth.new_password_title')}
      </h1>
      <p className="text-p3 lg:text-p2">
        {t('auth.new_password_description', { email: lastEmail })}
      </p>
      <AccountErrorAlert
        error={error}
        args={{
          verificationCode: lastVerificationCode,
          email: lastEmail,
        }}
      />
      <Controller
        name="verificationCode"
        control={control}
        render={({ field }) => (
          <InputField
            required
            autoComplete="off"
            label={t('auth.fields.verification_code_label')}
            placeholder={t('auth.fields.verification_code_placeholder')}
            {...field}
            errorMessage={errors.verificationCode}
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
            label={
              fromMigration ? t('auth.fields.password_label') : t('auth.fields.new_password_label')
            }
            placeholder={
              fromMigration
                ? t('auth.fields.password_placeholder')
                : t('auth.fields.new_password_placeholder')
            }
            helptext={t('auth.fields.password_description')}
            {...field}
            errorMessage={errors.password}
          />
        )}
      />
      <Button variant="black-solid" type="submit" fullWidth isDisabled={isSubmitting}>
        {fromMigration ? t('auth.migration_new_password_submit') : t('auth.new_password_submit')}
      </Button>
      <div className="text-p3 lg:text-p2">
        <span>{t('auth.verification_description')}</span>{' '}
        {cnt > 0 && <span>{t('auth.verification_cnt_description', { cnt })}</span>}
      </div>
      <Button variant="black-outline" onPress={handleResend} fullWidth isDisabled={cnt > 0}>
        {t('auth.verification_resend')}
      </Button>
      <AccountLink variant="login" />
    </form>
  )
}

export default NewPasswordForm
