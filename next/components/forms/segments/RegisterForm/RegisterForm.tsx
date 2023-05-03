import AccountErrorAlert from 'components/forms/segments/AccountErrorAlert/AccountErrorAlert'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import LoginAccountLink from 'components/forms/segments/LoginAccountLink/LoginAccountLink'
import Button from 'components/forms/simple-components/Button'
import SingleCheckbox from 'components/forms/widget-components/Checkbox/SingleCheckbox'
import InputField from 'components/forms/widget-components/InputField/InputField'
import PasswordField from 'components/forms/widget-components/PasswordField/PasswordField'
import Radio from 'components/forms/widget-components/RadioButton/Radio'
import RadioGroup from 'components/forms/widget-components/RadioButton/RadioGroup'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import Turnstile from 'react-turnstile'
import { useCounter, useWindowSize } from 'usehooks-ts'

import { AccountError, UserData } from '../../../../frontend/hooks/useAccount'
import useHookForm from '../../../../frontend/hooks/useHookForm'
import { isBrowser } from '../../../../frontend/utils/general'
import logger from '../../../../frontend/utils/logger'

interface Data {
  email: string
  name?: string
  given_name?: string
  family_name?: string
  password: string
  passwordConfirmation: string
  marketingConfirmation: boolean
  turnstileToken: string
  account_type: 'fo' | 'po'
}

interface Props {
  onSubmit: (
    email: string,
    password: string,
    marketingConfirmation: boolean,
    turnstileToken: string,
    userData: UserData,
  ) => Promise<any>
  error?: AccountError | null | undefined
  lastEmail?: string
}

// must use `minLength: 1` to implement required field
const schema = {
  type: 'object',
  properties: {
    account_type: {
      type: 'string',
      enum: ['fo', 'po'],
    },
    email: {
      type: 'string',
      minLength: 1,
      format: 'email',
      errorMessage: { minLength: 'account:email_required', format: 'account:email_format' },
    },
    password: {
      type: 'string',
      minLength: 1,
      format: 'password',
      errorMessage: { minLength: 'account:password_required', format: 'account:password_format' },
    },
    passwordConfirmation: {
      const: {
        $data: '1/password',
      },
      type: 'string',
      errorMessage: { const: 'account:password_confirmation_required' },
    },
    marketingConfirmation: {
      type: 'boolean',
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
            errorMessage: { minLength: 'account:given_name_required' },
          },
          family_name: {
            type: 'string',
            minLength: 1,
            errorMessage: { minLength: 'account:family_name_required' },
          },
        },
        required: ['given_name', 'family_name'],
      },
      else: {
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            errorMessage: { minLength: 'account:business_name_required' },
          },
        },
        required: ['name'],
      },
    },
  ],
  required: [
    'account_type',
    'email',
    'password',
    'passwordConfirmation',
    'marketingConfirmation',
    'turnstileToken',
  ],
}

const RegisterForm = ({ onSubmit, error, lastEmail }: Props) => {
  const { t } = useTranslation('account')
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
      account_type: 'fo',
      email: '',
      family_name: '',
      given_name: '',
      name: '',
      password: '',
      passwordConfirmation: '',
      marketingConfirmation: false,
    },
  })
  const [captchaWarning, setCaptchaWarning] = useState<'loading' | 'show' | 'hide'>('loading')

  useTimeout(() => {
    if (!isBrowser() || captchaWarning === 'hide') return
    setCaptchaWarning('show')
  }, 3000)

  const { width } = useWindowSize()
  const isMobile = width < 768

  const type = watch('account_type')
  return (
    <form
      className="flex flex-col space-y-4"
      onSubmit={handleSubmit((data: Data) => {
        const userData: UserData = {
          email: data.email,
          given_name: data.given_name,
          family_name: data.family_name,
          name: data.name,
          account_type: data.account_type,
        }
        // force rerender on submit - captcha is valid only for single submit
        incrementCaptchaKey()
        return onSubmit(
          data.email,
          data.password,
          data.marketingConfirmation,
          data.turnstileToken,
          userData,
        )
      })}
    >
      <h1 className="text-h2">{t('register_title')}</h1>
      <AccountErrorAlert error={error} args={{ email: lastEmail || '' }} />

      <Controller
        name="account_type"
        control={control}
        render={({ field }) => (
          <RadioGroup
            onChange={field.onChange}
            value={field.value}
            label={t('account_type_label')}
            orientations={isMobile ? 'column' : 'row'}
          >
            <Radio value="fo" variant="boxed">
              {t('fo_label')}
            </Radio>
            <Radio value="po" variant="boxed">
              {t('po_label')}
            </Radio>
          </RadioGroup>
        )}
      />
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <InputField
            required
            helptext={t(`email_${type}_description`)}
            label={t('email_label')}
            placeholder={t('email_placeholder')}
            autoComplete="username"
            {...field}
            errorMessage={errors.email}
          />
        )}
      />
      {type === 'fo' && (
        <>
          <Controller
            name="given_name"
            control={control}
            render={({ field }) => (
              <InputField
                required
                label={t('given_name_label')}
                placeholder={t('given_name_placeholder')}
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
                label={t('family_name_label')}
                placeholder={t('family_name_placeholder')}
                capitalize
                {...field}
                errorMessage={errors.family_name}
              />
            )}
          />
        </>
      )}
      {type === 'po' && (
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <InputField
              required
              label={t('business_name_label')}
              placeholder={t('business_name_placeholder')}
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
            label={t('password_label')}
            placeholder={t('password_placeholder')}
            tooltip={t('password_description')}
            autoComplete="new-password"
            {...field}
            errorMessage={errors.password}
          />
        )}
      />
      <Controller
        name="passwordConfirmation"
        control={control}
        render={({ field }) => (
          <PasswordField
            required
            autoComplete="new-password"
            label={t('password_confirmation_label')}
            placeholder={t('password_confirmation_placeholder')}
            {...field}
            errorMessage={errors.passwordConfirmation}
          />
        )}
      />
      <Controller
        name="marketingConfirmation"
        control={control}
        render={({ field }) => (
          <SingleCheckbox
            value="marketingConfirmation"
            isSelected={field.value}
            onChange={field.onChange}
            fullWidth
            error={errors.marketingConfirmation?.length > 0}
          >
            {t('marketing_confirmation_label')}
          </SingleCheckbox>
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
              sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY}
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
            {captchaWarning === 'show' && <p className="text-p3 italic">{t('captcha_warning')}</p>}
          </>
        )}
      />
      <Button
        className="min-w-full"
        type="submit"
        text={t('register_submit')}
        variant="category"
        disabled={isSubmitting}
      />
      <AccountMarkdown
        variant="sm"
        className="pb-5 md:pb-6 border-b-2 border-gray-200 text-center px-0 md:px-16"
        content={`${t('gdpr_details_link')}`}
      />
      <LoginAccountLink />
    </form>
  )
}

export default RegisterForm
