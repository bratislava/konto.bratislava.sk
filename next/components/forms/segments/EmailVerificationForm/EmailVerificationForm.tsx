import AccountErrorAlert from 'components/forms/segments/AccountErrorAlert/AccountErrorAlert'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import Button from 'components/forms/simple-components/ButtonNew'
import InputField from 'components/forms/widget-components/InputField/InputField'
import useHookForm from 'frontend/hooks/useHookForm'
import logger from 'frontend/utils/logger'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'
import { Controller } from 'react-hook-form'

interface Data {
  verificationCode: string
}

interface Props {
  onSubmit: (verificationCode: string) => Promise<any>
  onResend: () => Promise<any>
  error?: Error | null
  lastEmail: string
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
  },
  required: ['verificationCode'],
}

const EmailVerificationForm = ({ onSubmit, error, onResend, lastEmail }: Props) => {
  const [lastVerificationCode, setLastVerificationCode] = useState('')
  const [resendIsLoading, setResendIsLoading] = useState(false)
  const { t } = useTranslation('account')
  const noError: boolean = error === null || error === undefined
  const {
    handleSubmit,
    control,
    errors,
    formState: { isSubmitting },
  } = useHookForm<Data>({
    schema,
    defaultValues: { verificationCode: '' },
  })
  const [count, setCount] = useState(60)
  useEffect(() => {
    if (count > 0) {
      setTimeout(() => setCount((state) => state - 1), 1000)
    }
  }, [count])

  const handleResend = async () => {
    setCount(60)
    setResendIsLoading(true)
    await onResend()
    setResendIsLoading(false)
  }

  return (
    <form
      className="flex flex-col space-y-4"
      data-cy="verification-form"
      onSubmit={handleSubmit((data: Data) => {
        setLastVerificationCode(data.verificationCode)
        return onSubmit(data.verificationCode).catch((error_) =>
          logger.error('Submit failed', error_),
        )
      })}
    >
      <h1 className="text-h3">{t('auth.email_verification_title')}</h1>
      <p className="text-p3 lg:text-p2" data-cy="verification-description">
        {t('auth.email_verification_description', { email: lastEmail || '' })}
      </p>
      <AccountErrorAlert
        error={error}
        args={{
          email: lastEmail || '',
          verificationCode: lastVerificationCode,
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
      <Button variant="black-solid" type="submit" fullWidth isDisabled={isSubmitting}>
        {t('auth.email_verification_submit')}
      </Button>
      {/* don't show timer if error */}

      <div className="text-p3 lg:text-p2">
        {noError && count > 0 && (
          <div className="mb-4">
            <span>{t('auth.verification_description')}</span>{' '}
            <span>{t('auth.verification_cnt_description', { cnt: count })}</span>
          </div>
        )}
        <AccountMarkdown variant="sm" content={t('auth.verification_cnt_info')} />
      </div>

      <Button
        variant="black-outline"
        onPress={handleResend}
        fullWidth
        isDisabled={count > 0 && noError}
        isLoading={resendIsLoading}
      >
        {t('auth.verification_resend')}
      </Button>
    </form>
  )
}

export default EmailVerificationForm
