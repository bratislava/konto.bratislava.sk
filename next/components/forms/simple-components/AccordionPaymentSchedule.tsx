import { ChevronDownIcon } from '@assets/ui-icons'
import { AddToCalendarButton } from 'add-to-calendar-button-react'
import cx from 'classnames'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'

import { Tax } from '../../../frontend/dtos/taxDto'
import { formatCurrency } from '../../../frontend/utils/general'
import PersonIcon from '../icon-components/PersonIcon'
import AccountMarkdownModal from '../segments/AccountModal/AccountModal'

export type AccordionSizeType = 'xs' | 'sm' | 'md' | 'lg'

export type AccordionBase = {
  size: AccordionSizeType
  title: string
  icon?: boolean
  className?: string
  tax: Tax
}
export const isAccordionSizeType = (size: string) =>
  ['xs', 'sm', 'md', 'lg'].includes(size) ? size : 'sm'

interface PaymentScheduleViewProps {
  tax: Tax
}

const PaymentScheduleView = ({ tax }: PaymentScheduleViewProps) => {
  const { t } = useTranslation('account')
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
        <div className=" flex w-full flex-col items-center gap-4 md:flex-row lg:gap-6">
          <div className="text-h6 grow font-semibold md:text-h-md">{t('tax_determined')}</div>
          <AddToCalendarButton
            name="Splátka dane z nehnuteľností 2023"
            dates={`[
              {
                "name":"Splátka dane z nehnuteľností 2023 2/3",
                "startDate":"2023-08-31"
              },
              {
                "name":"Splátka dane z nehnuteľností 2023 3/3",
                "startDate":"2023-10-31"
              }
            ]`}
            label="Pridať termíny do kalendára"
            options={['Google', 'Microsoft365', 'Apple', 'iCal']}
          />
        </div>
        <div className="flex w-full flex-col items-start gap-4 rounded-lg bg-gray-50 p-6 lg:gap-6">
          {tax?.taxInstallments?.[0] && (
            <div
              id="content"
              className="flex w-full flex-col items-start gap-3 lg:flex-row lg:gap-6"
            >
              <div className="grow items-start">
                {t('payment_schedule.first_piece')}{' '}
                <div className="text-h5 inline">{t('payment_schedule.first_piece_to')}</div>
              </div>
              <div className="text-h5">{formatCurrency(tax.taxInstallments[0]?.amount)}</div>
            </div>
          )}
          {tax?.taxInstallments?.[1] && (
            <>
              <div id="divider" className="h-0.5 w-full bg-gray-200" />
              <div
                id="content"
                className="flex w-full flex-col items-start gap-3 lg:flex-row lg:gap-6"
              >
                <div className="grow items-start">
                  {t('payment_schedule.second_piece')}
                  <div className="text-h5 inline">{t('payment_schedule.second_piece_to')}</div>
                </div>
                <div className="text-h5">{formatCurrency(tax.taxInstallments[1]?.amount)}</div>
              </div>
            </>
          )}
          {tax?.taxInstallments?.[2] && (
            <>
              <div id="divider" className="h-0.5 w-full bg-gray-200" />
              <div
                id="content"
                className="flex w-full flex-col items-start gap-3 lg:flex-row lg:gap-6"
              >
                <div className="grow items-start">
                  {t('payment_schedule.third_piece')}
                  <div className="text-h5 inline">{t('payment_schedule.third_piece_to')}</div>
                </div>
                <div className="text-h5">{formatCurrency(tax.taxInstallments[2]?.amount)}</div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3 lg:gap-0">
        <div className="text-h5">{t('payment_schedule.pay_with_qr')}</div>
        <div className="text-h5-normal">{t('payment_schedule.change_amount')}</div>
      </div>
    </div>
  )
}

const AccordionPaymentSchedule = ({
  title,
  size = 'sm',
  icon = false,
  className,
  tax,
}: AccordionBase) => {
  const [isActive, setIsActive] = useState(false)

  const accordionSize = isAccordionSizeType(size) as AccordionSizeType

  const paddingStyles = cx({
    'px-4 py-3 lg:p-4': accordionSize === 'xs',
    'p-4 lg:p-5': accordionSize === 'sm',
    'p-4 lg:px-8 lg:py-6': accordionSize === 'md',
    'px-6 py-5 lg:px-10 lg:py-8': accordionSize === 'lg',
  })

  const accordionHeaderStyle = cx(
    'flex w-full flex-col gap-4 rounded-xl bg-gray-0',
    className,
    paddingStyles,
  )
  const accordionContainerStyle = cx(
    'flex w-full flex-col rounded-xl border-2 border-solid border-gray-200 bg-gray-0 hover:border-gray-500',
    className,
    {
      'border-2 border-gray-700 hover:border-gray-700': isActive,
    },
  )
  const { t } = useTranslation('account')
  return (
    <div className="h-auto w-full">
      <div className="block lg:hidden">
        <AccountMarkdownModal
          show={isActive}
          onClose={() => setIsActive(false)}
          content={<PaymentScheduleView tax={tax} />}
          onSubmit={() => {}}
          header={title}
        />
      </div>
      <div className={accordionContainerStyle}>
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          onKeyDown={() => setIsActive(!isActive)}
          className={cx('no-tap-highlight flex gap-4', accordionHeaderStyle)}
        >
          {icon && (
            <div
              className={cx('flex items-center justify-center lg:items-start', {
                'h-6 w-6': accordionSize === 'sm' || accordionSize === 'xs',
                'h-8 w-8': accordionSize === 'md',
                'h-10 w-10': accordionSize === 'lg',
              })}
            >
              <PersonIcon
                className={cx('', {
                  'h-4 w-4': accordionSize === 'sm' || accordionSize === 'xs',
                  'h-5 w-5': accordionSize === 'md',
                  'h-6 w-6': accordionSize === 'lg',
                })}
              />
            </div>
          )}
          <div className="flex w-full flex-col gap-2 lg:gap-4">
            <div className="flex items-center gap-4 lg:items-start">
              <div className="flex grow flex-col items-start sm:flex-row">
                <div className="flex grow flex-col items-start gap-3">
                  <div
                    className={cx('flex w-full grow', {
                      'text-h6': accordionSize === 'xs',
                      'text-h5': accordionSize === 'sm',
                      'text-h4': accordionSize === 'md',
                      'text-h3': accordionSize === 'lg',
                    })}
                  >
                    {title}
                  </div>
                  <div className={cx('text-20 flex hidden w-max grow lg:block')}>
                    {t('payment_schedule.three_pieces')}
                    <div className="text-h5 inline">{t('payment_schedule.paid_at_once')}</div>
                    {t('payment_schedule.not_later')}
                  </div>
                </div>
              </div>
              <ChevronDownIcon
                className={cx('flex items-center justify-center text-main-700', {
                  'h-8 w-8 lg:h-10 lg:w-10': accordionSize === 'lg',
                  'h-6 w-6 lg:h-8 lg:w-8': accordionSize === 'md',
                  'h-6 w-6': accordionSize === 'sm' || accordionSize === 'xs',
                  'rotate-180 transform': isActive,
                  'rotate-270 transform md:rotate-0': !isActive,
                })}
              />
            </div>
          </div>
        </button>
        <div
          className={cx('h-0.5 w-full bg-gray-200', {
            hidden: !isActive,
          })}
        />
        {isActive && (
          <div
            className={cx('flex hidden flex-col font-normal lg:block', paddingStyles, {
              'text-h6': accordionSize === 'sm' || accordionSize === 'xs',
              'text-20': accordionSize === 'lg' || accordionSize === 'md',
            })}
          >
            <PaymentScheduleView tax={tax} />
          </div>
        )}
      </div>
    </div>
  )
}

export default AccordionPaymentSchedule
