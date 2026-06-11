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
    dateOfTowing: string
    timeOfTowing: string
    towingLocation: string
    towingReason: string
    towingFine: string
  } | null>(null)
  const [licensePlate, setLicensePlate] = useState('bengoro')
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

      setVariant('towing')
    } catch (error) {
      if (error.response.status === 404) {
        setVariant('notFound')
      } else {
        logger.error('Error fetching towing:', error)
        setErrorMessage('Vyskytla sa chyba pri vyhľadávaní odťahu vozidla')
      }
    }

    incrementCaptchaKey()
    console.log('turnstileToken', turnstileToken)
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

        <div className="flex flex-col gap-2 md:flex-row md:gap-6">
          <TextField
            label=""
            displayOptionalLabel={false}
            errorMessage={errorMessage}
            className="h-12"
            onChange={setLicensePlate}
          />

          <Button onPress={handleSubmit} variant="solid" fullWidthMobile className="mt-2 h-11">
            <Icon name="search" />
            Vyhľadať
          </Button>
        </div>
        {variant === 'towing' && (
          <div className="flex flex-col gap-4">
            <Typography variant="h3">
              Informácia o odťahu vozidla s evidenčným číslom {vehicle.licensePlate}
            </Typography>

            <Table
              rows={Object.keys(vehicle).map((key) => ({ label: key, value: vehicle[key] }))}
              notification={
                <Alert
                  message='Od 15.04.2023 za každý deň po 10. dni od odtiahnutia do areálu odťahovej služby je účtované "stojné" vo výške 5€ s DPH/deň.'
                  type="info"
                  fullWidth
                />
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
