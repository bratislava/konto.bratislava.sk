import { Button, Spinner, Typography } from '@bratislava/component-library'
import { useMutation } from '@tanstack/react-query'
import axios, { isAxiosError } from 'axios'
import { useTranslation } from 'next-i18next/pages'
import { useState } from 'react'
import Turnstile from 'react-turnstile'
import { useCounter } from 'usehooks-ts'

import TowingTable from '@/src/components/common/Towing/TowingTable'
import TextField from '@/src/components/fields/TextField'
import Markdown from '@/src/components/formatting/Markdown'
import Icon from '@/src/components/icon-components/Icon'
import SectionHeader from '@/src/components/layouts/SectionHeader'
import { environment } from '@/src/environment'
import logger from '@/src/frontend/utils/logger'

export type TowingSectionProps = {
  title?: string | null
  text?: string | null
}

const Towing = ({ title, text }: TowingSectionProps) => {
  const { t } = useTranslation('account')
  const [licensePlate, setLicensePlate] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [captchaWarning, setCaptchaWarning] = useState<'loading' | 'show' | 'hide'>('loading')
  const { count: captchaKey, increment: incrementCaptchaKey } = useCounter(0)

  const {
    mutateAsync: handleSubmit,
    data: response,
    isSuccess,
    isPending,
    error,
  } = useMutation({
    mutationFn: async () => {
      if (!turnstileToken) {
        setErrorMessage(t('auth.finish_captcha'))
        throw new Error('Turnstile token is required')
      }

      const response = await axios.get(
        `https://nest-enforcement-backend.bratislava.sk/api/public/tow/${licensePlate}`,
      )

      return response.data
    },
    onSuccess: () => {
      setErrorMessage('')
    },
    onError: (error) => {
      if (!isAxiosError(error) || error.response?.status !== 404) {
        logger.error('Error fetching towing:', error.response?.data.message)
        setErrorMessage(t('towing.error'))
      }
    },
    onSettled: () => {
      incrementCaptchaKey()
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader title={title} text={text} />

      <div className="flex flex-col gap-4 rounded-lg border px-5 py-6">
        <TextField
          label={t('towing.licensePlate')}
          displayOptionalLabel={false}
          errorMessage={errorMessage}
          onChange={(value) => setLicensePlate(value.trim().toUpperCase())}
          helptext={t('towing.typeInInstructions')}
        />

        <Button
          onPress={() => handleSubmit()}
          variant="solid"
          fullWidth
          isDisabled={licensePlate.length === 0 || !turnstileToken}
        >
          <Icon name="search" className="size-6" />

          <Typography variant="p-small">{t('button.search')}</Typography>
        </Button>

        <Turnstile
          theme="light"
          key={captchaKey}
          sitekey={environment.cloudflareTurnstileSiteKey}
          className="self-center"
          onVerify={(token) => {
            setCaptchaWarning('hide')
            setTurnstileToken(token)
          }}
          onError={(error) => {
            logger.error('Turnstile error:', error)
            setCaptchaWarning('show')

            return setTurnstileToken(null)
          }}
          onTimeout={() => {
            logger.error('Turnstile timeout')
            setCaptchaWarning('show')
            setTurnstileToken(null)
          }}
          onExpire={() => {
            logger.warn('Turnstile expire - should refresh automatically')
            setTurnstileToken(null)
          }}
        />

        {captchaWarning === 'show' && (
          <Typography variant="p-tiny" className="italic">
            {t('auth.captcha_warning')}
          </Typography>
        )}

        {isPending ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : isSuccess ? (
          <TowingTable vehicle={response} initialLicensePlate={licensePlate} />
        ) : isAxiosError(error) && error.response?.status === 404 ? (
          <div className="flex flex-col items-center gap-6 rounded-xl border p-12">
            <Icon name="tow-car" />

            <Typography variant="p-large" className="text-center">
              {t('towing.notFound.title')}
            </Typography>

            <Markdown content={t('towing.notFound.content')} className="text-center" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default Towing
