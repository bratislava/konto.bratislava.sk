import { UserOfficialCorrespondenceChannelEnum } from '@clients/openapi-city-account'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'

import { FormatCurrencyFromCents } from '../../../frontend/utils/formatCurrency'
import { useTaxChannel } from '../segments/AccountSections/TaxesFeesSection/useTaxChannel'
import { useTaxFeeSection } from '../segments/AccountSections/TaxesFeesSection/useTaxFeeSection'
import AccordionV2 from './AccordionV2'

const PaymentScheduleView = () => {
  const { taxData } = useTaxFeeSection()
  const { channelCurrentYearEffective } = useTaxChannel()

  const { t } = useTranslation('account')
  const taxInstallmentsTranslationKeys = [
    channelCurrentYearEffective === UserOfficialCorrespondenceChannelEnum.Email
      ? 'payment_schedule.first_installment_email_channel'
      : 'payment_schedule.first_installment',
    'payment_schedule.second_installment',
    'payment_schedule.third_installment',
  ]

  return (
    <div className="scrollbar-hide flex w-full flex-col items-start gap-4 overflow-auto lg:gap-6">
      <div className="flex w-full flex-col items-start gap-4 lg:gap-6">
        <div className="flex w-full flex-col gap-4">
          <span className="text-p1">
            <Trans
              ns="account"
              i18nKey="payment_schedule.subtitle"
              components={{ strong: <strong className="font-semibold" /> }}
            />
          </span>
          <div id="divider" className="h-0.5 w-full bg-gray-200" />
        </div>
        <div className="flex w-full flex-col gap-4 md:flex-row lg:gap-6">
          <div className="grow text-h4 font-semibold">{t('tax_determined')}</div>
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
        <div className="flex w-full flex-col items-start gap-4 rounded-lg bg-gray-50 p-4 lg:gap-6 lg:p-6">
          {taxData.taxInstallments?.map((taxInstallment, index) => (
            <>
              {index !== 0 && <div className="h-0.5 w-full bg-gray-200" />}
              <div
                key={index}
                className="flex w-full flex-col items-start gap-3 lg:flex-row lg:items-center lg:gap-6"
              >
                <div className="grow text-p1">
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
      <div>
        <p className="text-p1-semibold">{t('payment_schedule.pay_with_qr')}</p>
        <p className="text-p1">{t('payment_schedule.change_amount')}</p>
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
