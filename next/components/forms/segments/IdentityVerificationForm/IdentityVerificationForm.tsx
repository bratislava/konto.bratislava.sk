import ArrowRightIcon from '@assets/images/new-icons/ui/arrow-right.svg'
import AccountErrorAlert from 'components/forms/segments/AccountErrorAlert/AccountErrorAlert'
import Button from 'components/forms/simple-components/Button'
import InputField from 'components/forms/widget-components/InputField/InputField'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import Turnstile from 'react-turnstile'
import { useCounter, useTimeout } from 'usehooks-ts'

import { ROUTES } from '../../../../frontend/api/constants'
import { AccountError } from '../../../../frontend/hooks/useAccount'
import useHookForm from '../../../../frontend/hooks/useHookForm'
import { isBrowser } from '../../../../frontend/utils/general'
import logger from '../../../../frontend/utils/logger'

interface Data {
  rc: string
  idCard: string
  turnstileToken: string
}

interface Props {
  onSubmit: (rc: string, idCard: string, turnstileToken: string) => void
  error?: AccountError | null | undefined
}

// must use `minLength: 1` to implement required field
const schema = {
  type: 'object',
  properties: {
    rc: {
      type: 'string',
      minLength: 1,
      format: 'rc',
      errorMessage: { minLength: 'account:rc_required', format: 'account:rc_format' },
    },
    idCard: {
      type: 'string',
      minLength: 1,
      format: 'idCard',
      errorMessage: { minLength: 'account:id_card_required', format: 'account:id_card_format' },
    },
    turnstileToken: {
      type: 'string',
      minLength: 1,
    },
  },
  required: ['rc', 'idCard', 'turnstileToken'],
}

const IdentityVerificationForm = ({ onSubmit, error }: Props) => {
  const { t } = useTranslation('account')
  const { count: captchaKey, increment: incrementCaptchaKey } = useCounter(0)
  const router = useRouter()
  const {
    handleSubmit,
    control,
    errors,
    formState: { isSubmitting },
  } = useHookForm<Data>({
    schema,
    defaultValues: { rc: '', idCard: '' },
  })
  const [captchaWarning, setCaptchaWarning] = useState<'loading' | 'show' | 'hide'>('loading')

  useTimeout(() => {
    if (!isBrowser() || captchaWarning === 'hide') return
    setCaptchaWarning('show')
  }, 3000)

  return (
    <form
      className="flex flex-col gap-4 pt-6 md:pt-0"
      onSubmit={handleSubmit((data: Data) => {
        incrementCaptchaKey()
        return onSubmit(data.rc, data.idCard, data.turnstileToken)
      })}
    >
      <h1 className="text-h3">{t('identity_verification_title')}</h1>
      <p className="text-p2">{t('identity_verification_subtitle')}</p>
      <AccountErrorAlert error={error} />
      <Controller
        name="rc"
        control={control}
        render={({ field }) => (
          <InputField
            required
            label={t('rc_label')}
            placeholder={t('rc_placeholder')}
            {...field}
            errorMessage={errors.rc}
          />
        )}
      />
      <div className="pt-0 md:pt-5">
        <Controller
          name="idCard"
          control={control}
          render={({ field }) => (
            <InputField
              required
              label={t('id_card_label')}
              placeholder={t('id_card_placeholder')}
              helptext={t('id_card_description')}
              {...field}
              errorMessage={errors.idCard}
            />
          )}
        />
      </div>
      <Controller
        name="turnstileToken"
        control={control}
        render={({ field: { onChange } }) => (
          <>
            <Turnstile
              theme="light"
              key={captchaKey}
              sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || ''}
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
              className="self-center"
            />
            {captchaWarning === 'show' && <p className="text-p3 italic">{t('captcha_warning')}</p>}
          </>
        )}
      />
      <Button
        className="min-w-full"
        type="submit"
        text={t('identity_verification_submit')}
        variant="category"
        loading={isSubmitting}
      />
      <Button
        variant="plain-black"
        className="min-w-full"
        onPress={() => router.push({ pathname: ROUTES.HOME, query: { from: ROUTES.REGISTER } })}
        text={t('identity_verification_skip')}
        endIcon={<ArrowRightIcon />}
      />
      <div className="flex flex-col gap-3 mb-4 md:mb-0 md:gap-4">
        <div className="flex items-center">
          <span className="w-full h-0.5 bg-gray-200" />
          <span className="text-p2 px-6">{t('identity_verification_choice')}</span>
          <span className="w-full h-0.5 bg-gray-200" />
        </div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-4">
          <Button variant="black-outline" fullWidth text={t('identity_verification_eID')} />
        </div>
      </div>
    </form>
  )
}

export default IdentityVerificationForm
