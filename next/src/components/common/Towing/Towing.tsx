import { Button, Typography } from '@bratislava/component-library'
import axios from 'axios'
import { useTranslation } from 'next-i18next/pages'
import { useState } from 'react'
import Turnstile from 'react-turnstile'
import { useCounter } from 'usehooks-ts'

import Table from '@/src/components/common/Table/Table'
import TextField from '@/src/components/fields/TextField'
import Markdown from '@/src/components/formatting/Markdown'
import Icon from '@/src/components/icon-components/Icon'
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
    loadingLocation: string
    towReason: string
    unloadingLocation: string
    relocationReason: string
  }>({
    licensePlate: '',
    loadingDate: '',
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

  const handleSubmit = async () => {
    if (!turnstileToken) {
      setErrorMessage('Vyplňte captcha')

      return
    }

    try {
      const response = await axios.post(
        `https://nest-city-account.staging.bratislava.sk/towing/public/${licensePlate}`,
        {
          turnstileToken,
        },
      )
      setVehicle({ licensePlate, ...response.data })
    } catch (error) {
      if (error?.response?.status === 404) {
        setVariant('notFound')
      } else {
        logger.error('Error fetching towing:', error)
        setErrorMessage('Vyskytla sa chyba pri vyhľadávaní odťahu vozidla')
        setVariant(null)
      }
    }
    setVariant(vehicle.unloadingLocation.length > 0 ? 'relay' : 'towing')
    incrementCaptchaKey()
  }

  return (
    <div className="flex flex-col gap-4">
      {title && <Typography variant="h2">{title}</Typography>}
      {description && <Typography variant="p-default">{description}</Typography>}
      <div className="flex flex-col gap-4 rounded-xl border px-5 py-6">
        <Typography variant="p-default">
          Zadajte platné evidenčné číslo vozidla bez medzier.
          <br />
          Napríklad: BA123AB
        </Typography>

        <div className="flex flex-col gap-2 md:flex-row md:gap-6">
          <TextField
            label=""
            displayOptionalLabel={false}
            errorMessage={errorMessage}
            className="h-12"
            onChange={(value) => setLicensePlate(value.trim().toUpperCase())}
          />

          <Button
            onPress={handleSubmit}
            variant="solid"
            fullWidthMobile
            className="mt-2 h-11 lg:h-[50px]"
            isDisabled={licensePlate.length === 0 || !turnstileToken}
          >
            <Icon name="search" />
            Vyhľadať
          </Button>
        </div>

        <Turnstile
          theme="light"
          key={captchaKey}
          sitekey={environment.cloudflareTurnstileSiteKey}
          className="self-center"
          onVerify={(token) => {
            setCaptchaWarning('hide')
            console.log('token', token)
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
            Informácia o {variant === 'towing' ? 'odťahu' : 'preložení'} vozidla s evidenčným číslom{' '}
            {vehicle?.licensePlate}
          </Typography>
        )}

        {(variant === 'towing' || variant === 'relay') && vehicle && (
          <div className="flex flex-col gap-4">
            <Table
              rows={[
                { label: 'EČV vozidla', value: vehicle.licensePlate },
                { label: 'Dátum odťahu', value: `\`${vehicle.loadingDate}\`` },
                { label: 'Miesto odťahu', value: vehicle.loadingLocation },
                ...(vehicle.towReason ? [{ label: 'Dôvod odťahu', value: vehicle.towReason }] : []),
                ...(vehicle.unloadingLocation
                  ? [{ label: 'Miesto preloženia', value: vehicle.unloadingLocation }]
                  : []),
                ...(vehicle.relocationReason
                  ? [{ label: 'Dôvod preloženia', value: vehicle.relocationReason }]
                  : []),
                ...(variant === 'towing'
                  ? [{ label: 'Poplatok za odťah', value: '179.00€ + pokuta' }]
                  : []),
              ]}
              notification={
                variant === 'towing' && (
                  <Alert
                    message='Od 15.04.2023 za každý deň po 10. dni od odtiahnutia do areálu odťahovej služby je účtované "stojné" vo výške 5€ s DPH/deň.'
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
              Vozidlo neevidujeme medzi odtiahnutými alebo preloženými vozidlami.{' '}
            </Typography>

            <Markdown
              content="Skontrolujte, či ste zadali správne evidenčné číslo a skúste vyhľadať znova. Ak
              potrebujete pomoc, kontaktuje Infolinku PAAS na čísle 0800 222 888."
              className="text-center"
            ></Markdown>
          </div>
        )}
      </div>
    </div>
  )
}

export default Towing
