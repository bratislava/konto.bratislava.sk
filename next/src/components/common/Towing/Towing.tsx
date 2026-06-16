import { Button, Typography } from '@bratislava/component-library'
import { useMutation } from '@tanstack/react-query'
import axios, { isAxiosError } from 'axios'
import { useTranslation } from 'next-i18next/pages'
import { useState } from 'react'
import Turnstile from 'react-turnstile'
import { useCounter } from 'usehooks-ts'

import Table from '@/src/components/common/Table/Table'
import TextField from '@/src/components/fields/TextField'
import Markdown from '@/src/components/formatting/Markdown'
import Icon from '@/src/components/icon-components/Icon'
import SectionHeader from '@/src/components/layouts/SectionHeader'
import Alert from '@/src/components/simple-components/Alert'
import { environment } from '@/src/environment'
import logger from '@/src/frontend/utils/logger'

export type TowingSectionProps = {
  title: string
  description: string
}

const Towing = ({ title, description }: TowingSectionProps) => {
  const { t } = useTranslation('account')

  const [vehicle, setVehicle] = useState<{
    licensePlate: string
    loadingDate: string
    loadingTime: string
    loadingLocation: string
    towReason: string
    unloadingLocation: string
    relocationReason: string
  }>({
    licensePlate: '',
    loadingDate: '',
    loadingTime: '',
    loadingLocation: '',
    towReason: '',
    unloadingLocation: '',
    relocationReason: '',
  })
  const [licensePlate, setLicensePlate] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [captchaWarning, setCaptchaWarning] = useState<'loading' | 'show' | 'hide'>('loading')
  const { count: captchaKey, increment: incrementCaptchaKey } = useCounter(0)
  const [variant, setVariant] = useState<'relay' | 'towing' | 'notFound' | null>(null)

  const { mutateAsync: handleSubmit } = useMutation({
    mutationFn: async () => {
      if (!turnstileToken) {
        setErrorMessage(t('auth.finish_captcha'))

        return
      }
      const response = await axios.post(
        `https://nest-city-account.staging.bratislava.sk/towing/public/${licensePlate}`,
        {
          turnstileToken,
        },
      )
      const loadingDate = response.data.loadingDate.split('T')[0].split('-').reverse().join('.')
      const loadingTime = response.data.loadingDate.split('T')[1].slice(0, 5)
      setVehicle({
        ...response.data,
        licensePlate,
        loadingDate,
        loadingTime,
      })
      setVariant(response.data.unloadingLocation ? 'relay' : 'towing')
      setErrorMessage('')
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 404) {
        setVehicle({
          licensePlate,
          loadingDate: '',
          loadingTime: '',
          loadingLocation: '',
          towReason: '',
          unloadingLocation: '',
          relocationReason: '',
        })
        setVariant('notFound')
        setErrorMessage('')
      } else {
        logger.error('Error fetching towing:', error.response?.data.message)
        setErrorMessage(t('towing.error'))
        setVariant(null)
      }
    },
    onSettled: incrementCaptchaKey,
  })

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader title={title} text={description} />

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

        {variant && (
          <Typography variant="h3">
            {t(`towing.informationTitle.${variant}`, { ecv: vehicle?.licensePlate })}
          </Typography>
        )}

        {(variant === 'towing' || variant === 'relay') && (
          <div className="flex flex-col gap-4">
            <Table
              rows={[
                { label: t('towing.informationTable.licensePlate'), value: vehicle.licensePlate },
                { label: t('towing.informationTable.loadingDate'), value: vehicle.loadingDate },
                { label: t('towing.informationTable.loadingTime'), value: vehicle.loadingTime },
                {
                  label: t('towing.informationTable.loadingLocation'),
                  value: vehicle.loadingLocation,
                },
                ...(vehicle.towReason
                  ? [{ label: t('towing.informationTable.towReason'), value: vehicle.towReason }]
                  : []),
                ...(vehicle.unloadingLocation
                  ? [
                      {
                        label: t('towing.informationTable.unloadingLocation'),
                        value: vehicle.unloadingLocation,
                      },
                    ]
                  : []),
                ...(vehicle.relocationReason
                  ? [
                      {
                        label: t('towing.informationTable.relocationReason'),
                        value: vehicle.relocationReason,
                      },
                    ]
                  : []),
                ...(variant === 'towing'
                  ? [
                      {
                        label: t('towing.informationTable.payment'),
                        value: `**${t('towing.informationTable.paymentValue')}**`,
                        isMarkdown: true,
                      },
                    ]
                  : []),
              ]}
              notification={
                variant === 'towing' && (
                  <Alert
                    message={
                      <Markdown content={t('towing.informationTable.paymentNotification')} />
                    }
                    type="info"
                    fullWidth
                  />
                )
              }
            />
          </div>
        )}

        {variant === 'notFound' && (
          <div className="flex flex-col items-center gap-6 rounded-xl border p-12">
            <Icon name="tow-car" />

            <Typography variant="p-large" className="text-center">
              {t('towing.notFound.title')}
            </Typography>

            <Markdown content={t('towing.notFound.content')} className="text-center" />
          </div>
        )}
      </div>
    </div>
  )
}

export default Towing
