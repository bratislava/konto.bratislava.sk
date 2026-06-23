import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { TowingSearchResponseDto } from 'openapi-clients/city-account'
import { useState } from 'react'

import Table from '@/src/components/common/Table/Table'
import { formatDate } from '@/src/components/formatting/FormatDate'
import Markdown from '@/src/components/formatting/Markdown'
import Alert from '@/src/components/simple-components/Alert'

type Props = {
  vehicle: TowingSearchResponseDto
  initialLicensePlate: string
}

const TowingTable = ({ vehicle, initialLicensePlate }: Props) => {
  const [licensePlate] = useState(initialLicensePlate) // TODO: Remove this once the license plate is part of the response
  const { t } = useTranslation('account')
  const variant = vehicle.unloadingLocation ? 'relay' : 'towing'

  const titleTranslationMap = {
    relay: t('towing.informationTitle.relay', { licensePlate }),
    towing: t('towing.informationTitle.towing', { licensePlate }),
  }

  return (
    <>
      <Typography variant="h3">{titleTranslationMap[variant]}</Typography>

      <div className="flex flex-col gap-4">
        <Table
          rows={[
            { label: t('towing.informationTable.licensePlate'), value: licensePlate },
            {
              label: t('towing.informationTable.loadingDate'),
              value: formatDate(vehicle.loadingDate, 'sk', 'short'),
            },
            {
              label: t('towing.informationTable.loadingTime'),
              value: formatDate(vehicle.loadingDate, 'sk', 'time'),
            },
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
                    value: t('towing.informationTable.paymentValue'),
                    isMarkdown: true,
                  },
                ]
              : []),
          ]}
          notification={
            variant === 'towing' ? (
              <Alert
                message={<Markdown content={t('towing.informationTable.paymentNotification')} />}
                type="info"
                fullWidth
              />
            ) : undefined
          }
        />
      </div>
    </>
  )
}

export default TowingTable
