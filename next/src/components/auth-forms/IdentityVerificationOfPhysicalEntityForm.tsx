import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import Turnstile from 'react-turnstile'
import { useCounter, useTimeout } from 'usehooks-ts'

import TextField from '@/src/components/fields/TextField'
import Markdown from '@/src/components/formatting/Markdown'
import Icon from '@/src/components/icon-components/Icon'
import AccountErrorAlert from '@/src/components/segments/AccountErrorAlert/AccountErrorAlert'
import { environment } from '@/src/environment'
import useHookForm from '@/src/frontend/hooks/useHookForm'
import { useQueryParamRedirect } from '@/src/frontend/hooks/useQueryParamRedirect'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'
import { isBrowser } from '@/src/frontend/utils/general'
import logger from '@/src/frontend/utils/logger'

export interface IdentityVerificationOfPhysicalEntityFormData {
  givenName: string
  familyName: string
  rc: string
  idCard: string
  turnstileToken: string
}

interface Props {
  onSubmit: (data: IdentityVerificationOfPhysicalEntityFormData) => void
  error?: Error | null
  showSkipButton?: boolean
}

// must use `minLength: 1` to implement required field
const foSchema = {
  type: 'object',
  properties: {
    givenName: {
      type: 'string',
      minLength: 1,
      errorMessage: { minLength: 'account:auth.fields.given_name_required' },
    },
    familyName: {
      type: 'string',
      minLength: 1,
      errorMessage: { minLength: 'account:auth.fields.family_name_required' },
    },
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
  required: ['givenName', 'familyName', 'rc', 'idCard', 'turnstileToken'],
}

const IdentityVerificationOfPhysicalEntityForm = ({
  onSubmit,
  error,
  showSkipButton = true,
}: Props) => {
  const { t } = useTranslation('account')
  const { redirect } = useQueryParamRedirect()

  const { userAttributes } = useSsrAuth()

  const { family_name: familyName, given_name: givenName } = userAttributes ?? {}

  const { count: captchaKey, increment: incrementCaptchaKey } = useCounter(0)

  const {
    handleSubmit,
    control,
    errors,
    formState: { isSubmitting },
  } = useHookForm<IdentityVerificationOfPhysicalEntityFormData>({
    schema: foSchema,
    defaultValues: {
      givenName: givenName ?? '',
      familyName: familyName ?? '',
      rc: '',
      idCard: '',
    },
  })
  const [captchaWarning, setCaptchaWarning] = useState<'loading' | 'show' | 'hide'>('loading')

  useTimeout(() => {
    if (!isBrowser() || captchaWarning === 'hide') return
    setCaptchaWarning('show')
  }, 3000)

  return (
    <form
      className="flex flex-col gap-4 md:gap-6"
      onSubmit={handleSubmit((data: IdentityVerificationOfPhysicalEntityFormData) => {
        incrementCaptchaKey()

        return onSubmit(data)
      })}
    >
      <Typography variant="h3" as="h1">
        {t('auth.identity_verification.fo.init.title')}
      </Typography>
      <Markdown variant="small" content={t('auth.identity_verification.fo.init.content')} />
      <AccountErrorAlert error={error} />

      <Controller
        name="givenName"
        control={control}
        render={({ field }) => (
          <TextField
            isRequired
            label={t('auth.fields.given_name_label')}
            helptext={t('auth.identity_verification.fo.init.given_name_helptext')}
            autoComplete="given-name"
            autoCapitalize="on"
            autoCorrect="off"
            spellCheck="false"
            {...field}
            errorMessage={errors.givenName}
          />
        )}
      />
      <Controller
        name="familyName"
        control={control}
        render={({ field }) => (
          <TextField
            isRequired
            label={t('auth.fields.family_name_label')}
            helptext={t('auth.identity_verification.fo.init.family_name_helptext')}
            autoComplete="family-name"
            autoCapitalize="on"
            autoCorrect="off"
            spellCheck="false"
            {...field}
            errorMessage={errors.familyName}
          />
        )}
      />
      <Controller
        name="rc"
        control={control}
        render={({ field }) => (
          <TextField
            isRequired
            helptext={t('auth.fields.rc_description')}
            label={t('auth.fields.rc_label')}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            {...field}
            errorMessage={errors.rc}
          />
        )}
      />
      <Controller
        name="idCard"
        control={control}
        render={({ field }) => (
          <TextField
            isRequired
            label={t('auth.fields.id_card_label')}
            helptext={t('auth.fields.id_card_description')}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
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
              <Typography variant="p-tiny" className="italic">
                {t('auth.captcha_warning')}
              </Typography>
            )}
          </>
        )}
      />
      <div className="flex flex-col gap-3 lg:gap-4">
        <Button variant="solid" fullWidth type="submit" isLoading={isSubmitting}>
          {t('auth.identity_verification.fo.init.submit_button_text')}
        </Button>
        {showSkipButton ? (
          <Button
            variant="plain"
            fullWidth
            onPress={() => redirect()}
            endIcon={<Icon name="arrow-right" />}
          >
            {t('auth.identity_verification.common.skip_verification_button_text')}
          </Button>
        ) : null}
      </div>
    </form>
  )
}

export default IdentityVerificationOfPhysicalEntityForm
