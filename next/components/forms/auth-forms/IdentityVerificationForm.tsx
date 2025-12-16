import { ArrowRightIcon } from '@assets/ui-icons'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import Turnstile from 'react-turnstile'
import { useCounter, useTimeout } from 'usehooks-ts'

import { environment } from '../../../environment'
import { AccountType } from '../../../frontend/dtos/accountDto'
import useHookForm from '../../../frontend/hooks/useHookForm'
import { useQueryParamRedirect } from '../../../frontend/hooks/useQueryParamRedirect'
import { useSsrAuth } from '../../../frontend/hooks/useSsrAuth'
import { isBrowser } from '../../../frontend/utils/general'
import logger from '../../../frontend/utils/logger'
import AccountErrorAlert from '../segments/AccountErrorAlert/AccountErrorAlert'
import AccountMarkdown from '../segments/AccountMarkdown/AccountMarkdown'
import Button from '../simple-components/Button'
import InputField from '../widget-components/InputField/InputField'

export interface VerificationFormData {
  rc: string
  idCard: string
  turnstileToken: string
}

interface Props {
  onSubmit: (data: VerificationFormData) => void
  error?: Error | null
}

// must use `minLength: 1` to implement required field
const foSchema = {
  type: 'object',
  properties: {
    rc: {
      type: 'string',
      minLength: 1,
      format: 'rc',
      errorMessage: {
        minLength: 'account:auth.fields.rc_required',
        format: 'account:auth.fields.rc_format',
      },
    },
    idCard: {
      type: 'string',
      minLength: 1,
      format: 'idCard',
      errorMessage: {
        minLength: 'account:auth.fields.id_card_required',
        format: 'account:auth.fields.id_card_format',
      },
    },
    turnstileToken: {
      type: 'string',
      minLength: 1,
    },
  },
  required: ['rc', 'idCard', 'turnstileToken'],
}

const IdentityVerificationForm = ({ onSubmit, error }: Props) => {
  const { redirect } = useQueryParamRedirect()
  const { t } = useTranslation('account')
  const { count: captchaKey, increment: incrementCaptchaKey } = useCounter(0)
  const {
    handleSubmit,
    control,
    errors,
    formState: { isSubmitting },
  } = useHookForm<VerificationFormData>({
    schema: foSchema,
    defaultValues: { rc: '', idCard: '' },
  })
  const [captchaWarning, setCaptchaWarning] = useState<'loading' | 'show' | 'hide'>('loading')

  useTimeout(() => {
    if (!isBrowser() || captchaWarning === 'hide') return
    setCaptchaWarning('show')
  }, 3000)

  return (
    <form
      className="flex flex-col gap-4 md:gap-6"
      onSubmit={handleSubmit((data: VerificationFormData) => {
        incrementCaptchaKey()
        return onSubmit(data)
      })}
    >
      <h1 className="text-h3">{t('auth.identity_verification_title')}</h1>
      <p className="text-p2">{t('auth.identity_verification_subtitle')}</p>
      <AccountErrorAlert error={error} />

      <Controller
        name="rc"
        control={control}
        render={({ field }) => (
          <InputField
            required
            helptext={t('auth.fields.rc_description')}
            label={t('auth.fields.rc_label')}
            placeholder={t('auth.fields.rc_placeholder')}
            {...field}
            errorMessage={errors.rc}
          />
        )}
      />
      <Controller
        name="idCard"
        control={control}
        render={({ field }) => (
          <InputField
            required
            label={t('auth.fields.id_card_label')}
            placeholder={t('auth.fields.id_card_placeholder')}
            helptext={t('auth.fields.id_card_description')}
            {...field}
            errorMessage={errors.idCard}
          />
        )}
      />
      <Controller
        name="turnstileToken"
        control={control}
        render={({ field: { onChange } }) => (
          <>
            <Turnstile
              theme="light"
              key={captchaKey}
              sitekey={environment.cloudflareTurnstileSiteKey}
              onVerify={(token) => {
                setCaptchaWarning('hide')
                onChange(token)
              }}
              onError={(error) => {
                logger.error('Turnstile error:', error)
                setCaptchaWarning('show')
                return onChange(null)
              }}
              onTimeout={() => {
                logger.error('Turnstile timeout')
                setCaptchaWarning('show')
                onChange(null)
              }}
              onExpire={() => {
                logger.warn('Turnstile expire - should refresh automatically')
                onChange(null)
              }}
              className="mb-2 self-center"
            />
            {captchaWarning === 'show' && (
              <p className="text-p3 italic">{t('auth.captcha_warning')}</p>
            )}
          </>
        )}
      />
      <Button
        className="min-w-full"
        type="submit"
        text={t('auth.identity_verification_submit')}
        variant="black"
        loading={isSubmitting}
      />
      <Button
        variant="plain-black"
        className="min-w-full"
        onPress={() => redirect()}
        text={t('auth.identity_verification_skip')}
        endIcon={<ArrowRightIcon />}
      />
    </form>
  )
}

export default IdentityVerificationForm
