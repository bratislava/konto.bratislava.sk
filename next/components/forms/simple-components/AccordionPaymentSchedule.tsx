import cx from 'classnames'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'

import { FormatCurrencyFromCents } from '../../../frontend/utils/formatCurrency'
import { useTaxFeeSection } from '../segments/AccountSections/TaxesFeesSection/useTaxFeeSection'
import AccordionV2 from './AccordionV2'

const PaymentScheduleView = () => {
  const { taxData } = useTaxFeeSection()
  const { t } = useTranslation('account')
  const taxInstallmentsTranslationKeys = [
    'payment_schedule.first_installment',
    'payment_schedule.second_installment',
    'payment_schedule.third_installment',
  ]

  return (
    <div className="no-scrollbar flex w-full flex-col items-start gap-4 overflow-auto lg:gap-6">
      <div className="flex w-full flex-col items-start gap-4 lg:gap-6">
        <div className="flex w-full flex-col gap-4 lg:hidden">
          <div className={cx('text-h6-normal flex')}>
            <div className={cx('text-h6-normal grow')}>
              {t('payment_schedule.three_pieces')}
              <div className="inline">{t('payment_schedule.paid_at_once')}</div>
              {t('payment_schedule.not_later')}
            </div>
          </div>
          <div id="divider" className="h-0.5 w-full bg-gray-200" />
        </div>
        <div className="flex w-full flex-col gap-4 md:flex-row lg:gap-6">
          <div className="text-h6 grow font-semibold md:text-h-md">{t('tax_determined')}</div>
          {/* <AddToCalendarButton */}
          {/*  name="Splátka dane z nehnuteľností 2023" */}
          {/*  dates={`[ */}
          {/*    { */}
          {/*      "name":"Splátka dane z nehnuteľností 2023 2/3", */}
          {/*      "startDate":"2023-08-31" */}
          {/*    }, */}
          {/*    { */}
          {/*      "name":"Splátka dane z nehnuteľností 2023 3/3", */}
          {/*      "startDate":"2023-10-31" */}
          {/*    } */}
          {/*  ]`} */}
          {/*  label="Pridať termíny do kalendára" */}
          {/*  options={['Google', 'Microsoft365', 'Apple', 'iCal']} */}
          {/* /> */}
        </div>
        <div className="flex w-full flex-col items-start gap-4 rounded-lg bg-gray-50 p-6 lg:gap-6">
          {taxData.taxInstallments?.map((taxInstallment, index) => (
            <>
              {index !== 0 && <div className="h-0.5 w-full bg-gray-200" />}
              <div
                key={index}
                className="flex w-full flex-col items-start gap-3 lg:flex-row lg:items-center lg:gap-6"
              >
                <div className="text-p1 grow">
                  <Trans
                    ns="account"
                    i18nKey={taxInstallmentsTranslationKeys[index]}
                    components={{ strong: <strong className="font-semibold" /> }}
                  />
                </div>
                <div className="text-p1-semibold">
                  <FormatCurrencyFromCents value={taxInstallment.amount} />
                </div>
              </div>
            </>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3 lg:gap-0">
        <div className="text-h5">{t('payment_schedule.pay_with_qr')}</div>
        <div className="text-h5-normal">{t('payment_schedule.change_amount')}</div>
      </div>
    </div>
  )
}

const AccordionPaymentSchedule = () => {
  const { t } = useTranslation('account')

  return (
    <AccordionV2 title={t('payment_schedule.title')}>
      <PaymentScheduleView />
    </AccordionV2>
  )
}

export default AccordionPaymentSchedule
