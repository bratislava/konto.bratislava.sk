import { ClockIcon, ErrorIcon } from '@assets/ui-icons'
import { GetFormResponseDtoStateEnum } from '@clients/openapi-forms'
import cx from 'classnames'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactNode } from 'react'

import FormatDate from '../../../simple-components/FormatDate'

export type MyApplicationsSentCardProps = {
  title: string
  linkHref: string
  category?: string
  subtext?: string
  filedAt: string
  status: GetFormResponseDtoStateEnum
  statusAt?: string
}

const StatusIndicator = ({
  status,
  statusAt,
}: Pick<MyApplicationsSentCardProps, 'status' | 'statusAt'>) => {
  const { t } = useTranslation('account', { keyPrefix: 'account_section_applications' })

  const statusObj: {
    [key in GetFormResponseDtoStateEnum]: { icon: ReactNode; label: string }
  } = {
    [GetFormResponseDtoStateEnum.Draft]: { icon: <ClockIcon />, label: t('status.draft') },
    [GetFormResponseDtoStateEnum.Queued]: { icon: <ClockIcon />, label: t('status.toSend') },
    [GetFormResponseDtoStateEnum.Checking]: { icon: <ClockIcon />, label: t('status.toSend') },
    [GetFormResponseDtoStateEnum.Sending]: {
      icon: <ClockIcon />,
      label: t('status.toSend'),
    },
    [GetFormResponseDtoStateEnum.Sent]: { icon: <ClockIcon />, label: t('status.sent') },
    [GetFormResponseDtoStateEnum.Processing]: {
      icon: <ClockIcon />,
      label: t('status.processing'),
    },
    [GetFormResponseDtoStateEnum.Finished]: { icon: <ClockIcon />, label: t('status.finished') },
    [GetFormResponseDtoStateEnum.Rejected]: { icon: <ClockIcon />, label: t('status.rejected') },
    [GetFormResponseDtoStateEnum.QueuedError]: { icon: <ErrorIcon />, label: t('status.error') },
    [GetFormResponseDtoStateEnum.CheckingError]: { icon: <ErrorIcon />, label: t('status.error') },
    [GetFormResponseDtoStateEnum.SendingError]: { icon: <ErrorIcon />, label: t('status.error') },
    [GetFormResponseDtoStateEnum.SentError]: { icon: <ErrorIcon />, label: t('status.error') },
    [GetFormResponseDtoStateEnum.ProcessingError]: {
      icon: <ErrorIcon />,
      label: t('status.error'),
    },
  }

  const isError =
    status === GetFormResponseDtoStateEnum.QueuedError ||
    status === GetFormResponseDtoStateEnum.CheckingError ||
    status === GetFormResponseDtoStateEnum.SendingError ||
    status === GetFormResponseDtoStateEnum.SentError ||
    status === GetFormResponseDtoStateEnum.ProcessingError

  return (
    <div
      className={cx('flex items-start gap-2', {
        'text-gray-500':
          status === GetFormResponseDtoStateEnum.Queued || GetFormResponseDtoStateEnum.Checking,
        'text-education-700': status === GetFormResponseDtoStateEnum.Sent,
        'text-warning-700': status === GetFormResponseDtoStateEnum.Processing,
        'text-success-700': status === GetFormResponseDtoStateEnum.Finished,
        'text-negative-700': status === GetFormResponseDtoStateEnum.Rejected || isError,
      })}
    >
      <div>{statusObj[status].icon}</div>
      <div className="flex flex-col gap-1 max-md:hidden">
        <div className="text-16-semibold text-b">{statusObj[status].label}</div>
        {statusAt && (
          <div className="text-gray-700">
            <FormatDate>{statusAt}</FormatDate>
          </div>
        )}
      </div>
    </div>
  )
}

const MyApplicationsSentCard = ({
  title,
  category,
  subtext,
  linkHref,
  status,
  statusAt,
  filedAt,
}: MyApplicationsSentCardProps) => {
  const { t } = useTranslation('account')

  return (
    <>
      {/* Desktop */}
      <div className="group relative flex w-full items-stretch rounded-lg border-2 border-gray-200 bg-white p-6 max-lg:hidden">
        <div className="flex w-full gap-6">
          <div className="flex w-full grow flex-col gap-1">
            {category && <div className="text-p3-semibold text-main-700">{category}</div>}
            <h3 className="text-20-semibold">
              <Link href={linkHref} className="after:absolute after:inset-0 hover:underline">
                {title}
              </Link>
            </h3>
            {subtext && <div className="text-p3">{subtext}</div>}
          </div>

          <div className="flex items-center gap-10">
            <div className="flex w-[200px] flex-col gap-1">
              <div className="text-16-semibold">
                {t('account_section_applications.navigation_sent')}
              </div>
              <div>
                <FormatDate>{filedAt}</FormatDate>
              </div>
            </div>

            <div className="h-full w-0.5 bg-gray-200" aria-hidden />

            <div className="flex w-[200px] flex-col gap-1">
              <StatusIndicator status={status} statusAt={statusAt} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="relative flex w-full items-start justify-between border-b-2 border-gray-200 bg-white py-4 lg:hidden">
        <div className="flex w-full flex-col gap-1.5">
          {category && <div className="text-p3-semibold text-main-700">{category}</div>}
          <h3 className="text-p2-semibold leading-5">
            <Link href={linkHref} className="after:absolute after:inset-0">
              {title}
            </Link>
          </h3>
        </div>
        <StatusIndicator status={status} />
      </div>
    </>
  )
}

export default MyApplicationsSentCard
