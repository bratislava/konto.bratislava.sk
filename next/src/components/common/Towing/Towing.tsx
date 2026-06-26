import { Button, Typography } from '@bratislava/component-library'
import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useTranslation } from 'next-i18next/pages'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import Turnstile from 'react-turnstile'
import { useCounter, useTimeout } from 'usehooks-ts'

import { cityAccountClient } from '@/src/clients/city-account'
import TowingNotFound from '@/src/components/common/Towing/TowingNotFound'
import TowingTable from '@/src/components/common/Towing/TowingTable'
import TextField from '@/src/components/fields/TextField'
import Icon from '@/src/components/icon-components/Icon'
import SectionHeader from '@/src/components/layouts/SectionHeader'
import { environment } from '@/src/environment'
import useHookForm from '@/src/frontend/hooks/useHookForm'
import { isBrowser } from '@/src/frontend/utils/general'
import logger from '@/src/frontend/utils/logger'

export type TowingSectionProps = {
  title?: string | null
  text?: string | null
}

type TowingFormData = {
  licensePlate: string
  turnstileToken: string
}

const schema = {
  type: 'object',
  properties: {
    licensePlate: {
      type: 'string',
      minLength: 1,
      errorMessage: { minLength: 'towing.licensePlate_required' },
    },
    turnstileToken: {
      type: 'string',
      minLength: 1,
    },
  },
  required: ['licensePlate', 'turnstileToken'],
}

const Towing = ({ title, text }: TowingSectionProps) => {
  const { t } = useTranslation('account')
  const [captchaWarning, setCaptchaWarning] = useState<'loading' | 'show' | 'hide'>('loading')
  const { count: captchaKey, increment: incrementCaptchaKey } = useCounter(0)

  const {
    handleSubmit,
    control,
    errors,
    formState: { isSubmitting },
  } = useHookForm<TowingFormData>({
    schema,
    defaultValues: { licensePlate: '', turnstileToken: '' },
  })

  useTimeout(() => {
    if (!isBrowser() || captchaWarning === 'hide') return
    setCaptchaWarning('show')
  }, 3000)

  const { mutateAsync, data, isSuccess, variables, error } = useMutation({
    mutationFn: async ({ licensePlate, turnstileToken }: TowingFormData) => {
      const response = await cityAccountClient.towingControllerGetPublicTowingByEcv(licensePlate, {
        turnstileToken,
      })

      return response.data
    },
    onError: (error) => {
      if (!isAxiosError(error) || error.response?.status !== 404) {
        logger.error(
          'Error fetching towing:',
          isAxiosError(error) ? error.response?.data.message : error.message,
        )
      }
    },
    onSettled: () => {
      incrementCaptchaKey()
    },
  })

  const isNotFound = isAxiosError(error) && error.response?.status === 404
  const requestErrorMessage = error && !isNotFound ? t('towing.error') : ''

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader title={title} text={text} />

      <form
        className="flex flex-col justify-center gap-4 rounded-lg border px-5 py-6"
        onSubmit={handleSubmit((formData) => mutateAsync(formData))}
      >
        <Controller
          name="licensePlate"
          control={control}
          render={({ field }) => (
            <TextField
              label={t('towing.licensePlate')}
              displayOptionalLabel={false}
              helptext={t('towing.typeInInstructions')}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck="false"
              {...field}
              onChange={(value) => field.onChange(value.trim().toUpperCase())}
              errorMessage={errors.licensePlate ?? requestErrorMessage}
            />
          )}
        />

        <Button
          type="submit"
          variant="solid"
          fullWidth
          isLoading={isSubmitting}
          loadingText={t('towing.searching')}
          startIcon={<Icon name="search" />}
        >
          {t('towing.searchButton')}
        </Button>

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
                  onChange('')
                }}
                onTimeout={() => {
                  logger.error('Turnstile timeout')
                  setCaptchaWarning('show')
                  onChange('')
                }}
                onExpire={() => {
                  logger.warn('Turnstile expire - should refresh automatically')
                  onChange('')
                }}
              />

              {captchaWarning === 'show' && (
                <Typography variant="p-tiny" className="italic">
                  {t('auth.captcha_warning')}
                </Typography>
              )}
            </>
          )}
        />

        {isSuccess ? (
          <TowingTable vehicle={data} initialLicensePlate={variables.licensePlate} />
        ) : isNotFound ? (
          <TowingNotFound initialLicensePlate={variables?.licensePlate ?? ''} />
        ) : null}
      </form>
    </div>
  )
}

export default Towing
