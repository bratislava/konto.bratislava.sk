import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import Turnstile from 'react-turnstile'
import { useCounter, useTimeout } from 'usehooks-ts'

import AccountErrorAlert from '@/components/forms/segments/AccountErrorAlert/AccountErrorAlert'
import AccountMarkdown from '@/components/forms/segments/AccountMarkdown/AccountMarkdown'
import Button from '@/components/forms/simple-components/Button'
import InputField from '@/components/forms/widget-components/InputField/InputField'
import PasswordField from '@/components/forms/widget-components/PasswordField/PasswordField'
import Radio from '@/components/forms/widget-components/RadioButton/Radio'
import RadioGroup from '@/components/forms/widget-components/RadioButton/RadioGroup'
import { environment } from '@/environment'
import { AccountType, UserAttributes } from '@/frontend/dtos/accountDto'
import useHookForm from '@/frontend/hooks/useHookForm'
import { isBrowser } from '@/frontend/utils/general'
import logger from '@/frontend/utils/logger'
import { useAmplifyClientOAuthContext } from '@/frontend/utils/useAmplifyClientOAuthContext'

interface Data {
  email: string
  name?: string
  given_name?: string
  family_name?: string
  password: string
  turnstileToken: string
  account_type: AccountType
}

interface Props {
  onSubmit: (
    email: string,
    password: string,
    turnstileToken: string,
    userAttributes: UserAttributes,
  ) => Promise<any>
  error?: Error | null
  lastEmail?: string
  // used to disabled registration as a legal entity in production (for now)
  disablePO?: boolean
}

// must use `minLength: 1` to implement required field
const schema = {
  type: 'object',
  properties: {
    account_type: {
      type: 'string',
      enum: Object.values(AccountType),
    },
    email: {
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
      format: 'password',
      errorMessage: {
        minLength: 'account:auth.fields.password_required',
        format: 'account:auth.fields.password_format',
      },
    },
    turnstileToken: {
      type: 'string',
      minLength: 1,
    },
  },
  allOf: [
    {
      if: {
        properties: {
          account_type: {
            const: 'fo',
          },
        },
      },
      then: {
        properties: {
          given_name: {
            type: 'string',
            minLength: 1,
            errorMessage: { minLength: 'account:auth.fields.given_name_required' },
          },
          family_name: {
            type: 'string',
            minLength: 1,
            errorMessage: { minLength: 'account:auth.fields.family_name_required' },
          },
        },
        required: ['given_name', 'family_name'],
      },
      else: {
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            errorMessage: { minLength: 'account:auth.fields.business_name_required' },
          },
        },
        required: ['name'],
      },
    },
  ],
  required: ['account_type', 'email', 'password', 'turnstileToken'],
}

const RegisterForm = ({ onSubmit, error, lastEmail, disablePO }: Props) => {
  const { t } = useTranslation('account')

  const { clientInfo } = useAmplifyClientOAuthContext()

  const { count: captchaKey, increment: incrementCaptchaKey } = useCounter(0)
  const {
    handleSubmit,
    control,
    errors,
    watch,
    formState: { isSubmitting },
  } = useHookForm<Data>({
    schema,
    defaultValues: {
      account_type: AccountType.FyzickaOsoba,
      email: '',
      family_name: '',
      given_name: '',
      name: '',
      password: '',
    },
  })
  const [captchaWarning, setCaptchaWarning] = useState<'loading' | 'show' | 'hide'>('loading')

  useTimeout(() => {
    if (!isBrowser() || captchaWarning === 'hide') return
    setCaptchaWarning('show')
  }, 3000)

  const type = watch('account_type')

  const emailHelptextTranslationMap = {
    fo: t('auth.fields.email_fo_description'),
    'fo-p': t('auth.fields.email_fo-p_description'),
    po: t('auth.fields.email_po_description'),
  } satisfies Record<AccountType, string>

  return (
    <form
      className="flex flex-col gap-4 md:gap-6"
      data-cy="register-form"
      onSubmit={handleSubmit((data: Data) => {
        const userAttributes: UserAttributes = {
          email: data.email,
          given_name: data.given_name,
          family_name: data.family_name,
          name: data.name,
          'custom:account_type': data.account_type,
          // Add client id and name only for registrations that happened through oauth
          ...(clientInfo && {
            'custom:origin_client_id': clientInfo.clientId,
            'custom:origin_client_name': clientInfo.clientName,
          }),
        }
        // force rerender on submit - captcha is valid only for single submit
        incrementCaptchaKey()
        // marketing confirmation always set to true (with new gdpr document we get consent with the registration itself)
        return onSubmit(data.email, data.password, data.turnstileToken, userAttributes)
      })}
    >
      <h1 className="text-h2" data-cy="register-form-title">
        {t('auth.register_title')}
      </h1>
      <AccountErrorAlert error={error} args={{ email: lastEmail || '' }} />

      {disablePO ? null : (
        <Controller
          name="account_type"
          control={control}
          render={({ field }) => (
            <RadioGroup
              required
              onChange={field.onChange}
              value={field.value}
              label={t('auth.fields.account_type_label')}
              orientation="vertical"
            >
              <Radio value="fo" variant="boxed">
                {t('auth.fields.fo_label')}
              </Radio>
              <Radio value="fo-p" variant="boxed">
                {t('auth.fields.fop_label')}
              </Radio>
              <Radio value="po" variant="boxed">
                {t('auth.fields.po_label')}
              </Radio>
            </RadioGroup>
          )}
        />
      )}
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <InputField
            required
            helptext={emailHelptextTranslationMap[type]}
            label={t('auth.fields.email_label')}
            placeholder={t('auth.fields.email_placeholder')}
            autoComplete="username"
            {...field}
            errorMessage={errors.email}
          />
        )}
      />
      {type === AccountType.FyzickaOsoba && (
        <>
          <Controller
            name="given_name"
            control={control}
            render={({ field }) => (
              <InputField
                required
                label={t('auth.fields.given_name_label')}
                placeholder={t('auth.fields.given_name_placeholder')}
                capitalize
                {...field}
                errorMessage={errors.given_name}
              />
            )}
          />
          <Controller
            name="family_name"
            control={control}
            render={({ field }) => (
              <InputField
                required
                label={t('auth.fields.family_name_label')}
                placeholder={t('auth.fields.family_name_placeholder')}
                capitalize
                {...field}
                errorMessage={errors.family_name}
              />
            )}
          />
        </>
      )}
      {(type === AccountType.PravnickaOsoba || type === AccountType.FyzickaOsobaPodnikatel) && (
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <InputField
              required
              label={t('auth.fields.business_name_label')}
              placeholder={t('auth.fields.business_name_placeholder')}
              capitalize
              {...field}
              errorMessage={errors.name}
            />
          )}
        />
      )}
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <PasswordField
            required
            label={t('auth.fields.password_label')}
            placeholder={t('auth.fields.password_placeholder')}
            helptext={t('auth.fields.password_description')}
            autoComplete="new-password"
            {...field}
            errorMessage={errors.password}
          />
        )}
      />
      <AccountMarkdown
        variant="sm"
        className="text-center"
        content={`${t('auth.marketing_confirmation_text')}`}
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
              className="self-center"
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
            />
            {captchaWarning === 'show' && (
              <p className="text-p3 italic">{t('auth.captcha_warning')}</p>
            )}
          </>
        )}
      />
      <Button variant="solid" type="submit" fullWidth isDisabled={isSubmitting}>
        {t('auth.register_submit')}
      </Button>
    </form>
  )
}

export default RegisterForm
