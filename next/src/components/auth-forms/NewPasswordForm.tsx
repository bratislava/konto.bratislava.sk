import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { useEffect, useState } from 'react'
import { Controller } from 'react-hook-form'

import PasswordField from '@/src/components/fields/PasswordField'
import TextField from '@/src/components/fields/TextField'
import AccountErrorAlert from '@/src/components/segments/AccountErrorAlert/AccountErrorAlert'
import AccountLink from '@/src/components/segments/AccountLink/AccountLink'
import useHookForm from '@/src/frontend/hooks/useHookForm'
import logger from '@/src/frontend/utils/logger'

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
        minLength: 'account:auth.fields.verificationCode.required',
        format: 'account:auth.fields.verificationCode.format',
      },
    },
    password: {
      type: 'string',
      minLength: 1,
      format: 'password',
      errorMessage: {
        minLength: 'account:auth.fields.password.required',
        format: 'account:auth.fields.password.format',
      },
    },
  },
  required: ['verificationCode', 'password'],
}

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=13414-66534
 */

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
      className="flex flex-col gap-4 lg:gap-6"
      data-cy="new-password-form"
      onSubmit={handleSubmit((data: Data) => {
        setLastVerificationCode(data.verificationCode)

        return onSubmit(data.verificationCode, data.password).catch((error_) =>
          logger.error('Submit failed', error_),
        )
      })}
    >
      <Typography variant="h3" as="h1">
        {fromMigration ? t('NewPasswordForm.migrationTitle') : t('NewPasswordForm.title')}
      </Typography>
      <Typography variant="p-small">
        {t('NewPasswordForm.description', { email: lastEmail })}
      </Typography>
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
          <TextField
            isRequired
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            label={t('auth.fields.verificationCode.label')}
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
            isRequired
            autoComplete="new-password"
            label={
              fromMigration ? t('auth.fields.password.label') : t('auth.fields.newPassword.label')
            }
            helptext={t('auth.fields.password.helptext')}
            {...field}
            errorMessage={errors.password}
          />
        )}
      />
      <Button variant="solid" type="submit" fullWidth isDisabled={isSubmitting}>
        {fromMigration ? t('NewPasswordForm.migrationSubmit') : t('NewPasswordForm.submit')}
      </Button>
      <Typography variant="p-small">
        <span>{t('auth.resendCode.description')}</span>{' '}
        {cnt > 0 && <span>{t('auth.resendCode.countdown', { cnt })}</span>}
      </Typography>
      <Button variant="outline" onPress={handleResend} fullWidth isDisabled={cnt > 0}>
        {t('auth.resendCode.button')}
      </Button>
      <AccountLink variant="login" />
    </form>
  )
}

export default NewPasswordForm
