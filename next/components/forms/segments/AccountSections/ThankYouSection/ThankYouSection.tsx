import BratislavaIcon from '@assets/images/bratislava-footer.svg'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import ThankYouCard from 'components/forms/segments/AccountSections/ThankYouSection/ThankYouCard'
import Button from 'components/forms/simple-components/Button'
import { ROUTES } from 'frontend/api/constants'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useEffect, useMemo } from 'react'

import logger from '../../../../../frontend/utils/logger'
import { useStrapiTax } from '../TaxesFeesSection/useStrapiTax'

export const PaymentStatusOptions = {
  FAILED_TO_VERIFY: 'failed-to-verify',
  ALREADY_PAID: 'payment-already-paid',
  FAILED: 'payment-failed',
  SUCCESS: 'payment-success',
}

export enum PaymentTypeEnum {
  DZN = 'DzN',
}

const statusToTranslationPath = {
  [PaymentStatusOptions.FAILED_TO_VERIFY]: {
    title: 'thank_you.result.failed_to_verify.title',
    content: 'thank_you.result.failed_to_verify.content',
  },
  [PaymentStatusOptions.ALREADY_PAID]: {
    title: 'thank_you.result.payment_already_paid.title',
    content: 'thank_you.result.payment_already_paid.content',
  },
  [PaymentStatusOptions.FAILED]: {
    title: 'thank_you.result.payment_failed.title',
    content: 'thank_you.result.payment_failed.content',
  },
  [PaymentStatusOptions.SUCCESS]: {
    title: 'thank_you.result.payment_success.title',
    content: 'thank_you.result.payment_success.content',
  },
}

const getTaxDetailLink = (year?: string, paymentType?: PaymentTypeEnum) => {
  if (year && paymentType === PaymentTypeEnum.DZN) {
    return ROUTES.TAXES_AND_FEES_YEAR(Number(year))
  }
  return ROUTES.TAXES_AND_FEES
}

const ThankYouSection = () => {
  const { t } = useTranslation('account')
  const router = useRouter()
  const { paymentSuccessFeedbackLink, paymentSuccessPrivacyPolicyLink, paymentSuccessFaqLink } =
    useStrapiTax()

  const status = useMemo(
    () =>
      typeof router.query.status === 'string' &&
      Object.values(PaymentStatusOptions).includes(router.query.status)
        ? router.query.status
        : PaymentStatusOptions.FAILED_TO_VERIFY,
    [router.query.status],
  )

  const paymentType = useMemo(
    () =>
      typeof router.query.paymentType === 'string' &&
      Object.values(PaymentTypeEnum).includes(router.query.paymentType as PaymentTypeEnum) // test how this behaves when string is not a valid PaymentTypeEnum
        ? (router.query.paymentType as PaymentTypeEnum)
        : undefined,
    [router.query.paymentType],
  )
  const year = useMemo(
    () => (typeof router.query.year === 'string' ? router.query.year : undefined),
    [router.query.year],
  )
  const success =
    status === PaymentStatusOptions.SUCCESS || status === PaymentStatusOptions.ALREADY_PAID
  useEffect(() => {
    if (status === PaymentStatusOptions.FAILED_TO_VERIFY) {
      logger.error('Failed to verify payment', router.query)
    }
  }, [router.query, status])

  return (
    <div className="flex flex-col justify-between bg-gray-0 pt-16 md:bg-gray-50 md:pt-8">
      <div className="flex flex-col">
        {success ? (
          <ThankYouCard
            success={success}
            title={t(statusToTranslationPath[status].title)}
            content={`<span className='text-p2'>${t(statusToTranslationPath[status].content)}</span>`}
            firstButtonTitle={t('thank_you.button_to_formular_text')}
            secondButtonTitle={t('thank_you.button_to_tax_detail_text')}
            secondButtonLink={getTaxDetailLink(year, paymentType)}
            feedbackLink={paymentSuccessFeedbackLink ?? undefined}
          />
        ) : (
          <ThankYouCard
            success={success}
            title={t(statusToTranslationPath[status].title)}
            content={`<span className='text-p2'>${t(statusToTranslationPath[status].content)}</span>`}
            firstButtonTitle={t('thank_you.button_restart_text')}
            firstButtonLink={getTaxDetailLink(year, paymentType)}
            secondButtonTitle={t('thank_you.button_cancel_text')}
          />
        )}
        <div className="mx-auto mt-0 w-full max-w-[734px] px-4 md:mt-10 md:px-0 lg:max-w-[800px]">
          <span className="flex text-p2">
            <AccountMarkdown
              variant="sm"
              content={`<span className='text-p2'>${t(
                'thank_you.subtitle_mail_platbadane',
              )}</span>.`}
            />
          </span>
          {paymentSuccessFaqLink || paymentSuccessPrivacyPolicyLink ? (
            <div className="mt-4 flex flex-col gap-3 md:mt-6">
              {paymentSuccessFaqLink ? (
                <Button
                  label={t('thank_you.button_faq_text')}
                  href={paymentSuccessFaqLink}
                  variant="link-black"
                  size="sm"
                />
              ) : null}
              {paymentSuccessPrivacyPolicyLink ? (
                <Button
                  label={t('thank_you.button_privacy_text')}
                  href="https://bratislava.sk/ochrana-osobnych-udajov"
                  variant="link-black"
                  size="sm"
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mx-auto hidden w-full max-w-(--breakpoint-lg) flex-col items-center gap-6 pb-6 lg:flex">
        <BratislavaIcon />
        <p className="text-p2">
          {t('thank_you.footer_text', { currentYear: new Date().getFullYear() })}
        </p>
      </div>
    </div>
  )
}

export default ThankYouSection
