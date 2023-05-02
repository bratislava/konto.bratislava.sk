import BratislavaIcon from '@assets/images/account/bratislava-footer.svg'
import logger from '../../../../../frontend/logger'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import ThankYouCard from 'components/forms/segments/AccountSections/ThankYouSection/ThankYouCard'
import Button from 'components/forms/simple-components/Button'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useEffect, useMemo } from 'react'

export const PaymentStatusOptions = {
  FAILED_TO_VERIFY: 'failed-to-verify',
  ALREADY_PAYED: 'payment-already-paid',
  FAILED: 'payment-failed',
  SUCCESS: 'payment-success',
}

const ThankYouSection = () => {
  const { t } = useTranslation('account')
  const router = useRouter()
  const status = useMemo(
    () =>
      typeof router.query.status === 'string' &&
      Object.values(PaymentStatusOptions).includes(router.query.status)
        ? router.query.status
        : PaymentStatusOptions.FAILED_TO_VERIFY,
    [router.query.status],
  )
  const success =
    status === PaymentStatusOptions.SUCCESS || status === PaymentStatusOptions.ALREADY_PAYED
  useEffect(() => {
    if (status === PaymentStatusOptions.FAILED_TO_VERIFY) {
      logger.error('Failed to verify payment', router.query)
    }
  }, [router.query, status])

  return (
    <div className="h-screen bg-gray-0 md:bg-gray-50 pt-16 md:pt-28 flex flex-col justify-between">
      <div className="flex flex-col">
        {success ? (
          <ThankYouCard
            success={success}
            title={t(`thank_you.result.${status}.title`)}
            content={t(`thank_you.result.${status}.content`)}
            firstButtonTitle={t('thank_you.button_to_formular_text')}
            secondButtonTitle={t('thank_you.button_to_profil_text')}
          />
        ) : (
          <ThankYouCard
            success={success}
            title={t(`thank_you.result.${status}.title`)}
            content={t(`thank_you.result.${status}.content`)}
            firstButtonTitle={t('thank_you.button_restart_text')}
            secondButtonTitle={t('thank_you.button_cancel_text')}
          />
        )}
        <div className="max-w-[734px] lg:max-w-[800px] w-full mx-auto mt-0 md:mt-10 px-4 md:px-0">
          <span className="text-p2 flex">
            <AccountMarkdown
              variant="sm"
              content={`<span className='text-p2'>${t(
                'thank_you.subtitle_mail_platbadane',
              )}</span>.`}
            />
          </span>
          <div className="flex flex-col gap-3 mt-4 md:mt-6">
            <Button
              label={t('thank_you.button_faq_text')}
              href="https://www.bratislava.sk/mesto-bratislava/dane-a-poplatky/dan-z-nehnutelnosti/digitalna-platba"
              variant="link-black"
              size="sm"
            />
            <Button
              label={t('thank_you.button_privacy_text')}
              href="https://bratislava.sk/ochrana-osobnych-udajov"
              variant="link-black"
              size="sm"
            />
          </div>
        </div>
      </div>

      <div className="w-full max-w-screen-lg mx-auto hidden lg:flex flex-col items-center gap-6 pb-6">
        <BratislavaIcon />
        <p className="text-p2">{t('thank_you.footer_text')}</p>
      </div>
    </div>
  )
}

export default ThankYouSection
