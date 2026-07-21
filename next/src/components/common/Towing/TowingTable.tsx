import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { TowingSearchResponseDto, TowingSearchResponseDtoTowReasonEnum } from 'openapi-clients/city-account'
import { useState } from 'react'

import Table from '@/src/components/common/Table/Table'
import { formatDate } from '@/src/components/formatting/FormatDate'
import Markdown from '@/src/components/formatting/Markdown'
import Alert from '@/src/components/simple-components/Alert'

type Props = {
  vehicle: TowingSearchResponseDto
  initialLicensePlate: string
}

// The API returns the raw `TowReason` enum value; map it to the localized label's translation key here.
const towReasonTranslationKeyMap: Record<TowingSearchResponseDtoTowReasonEnum, string> = {
  [TowingSearchResponseDtoTowReasonEnum.ReservedParking]: 'towing.towReason.RESERVED_PARKING',
  [TowingSearchResponseDtoTowReasonEnum.PrivateAccessObstacle]: 'towing.towReason.PRIVATE_ACCESS_OBSTACLE',
  [TowingSearchResponseDtoTowReasonEnum.ParkingNearPublicTransportStop]:
    'towing.towReason.PARKING_NEAR_PUBLIC_TRANSPORT_STOP',
  [TowingSearchResponseDtoTowReasonEnum.ParkingNearPedestrianCrossing]:
    'towing.towReason.PARKING_NEAR_PEDESTRIAN_CROSSING',
  [TowingSearchResponseDtoTowReasonEnum.ParkingOnSidewalk]: 'towing.towReason.PARKING_ON_SIDEWALK',
  [TowingSearchResponseDtoTowReasonEnum.ParkingInTrafficLane]: 'towing.towReason.PARKING_IN_TRAFFIC_LANE',
  [TowingSearchResponseDtoTowReasonEnum.ParkingAtStreetCrossing]: 'towing.towReason.PARKING_AT_STREET_CROSSING',
  [TowingSearchResponseDtoTowReasonEnum.Other]: 'towing.towReason.OTHER',
  [TowingSearchResponseDtoTowReasonEnum.TrafficFlowObstacle]: 'towing.towReason.TRAFFIC_FLOW_OBSTACLE',
  [TowingSearchResponseDtoTowReasonEnum.NoStoppingZone]: 'towing.towReason.NO_STOPPING_ZONE',
  [TowingSearchResponseDtoTowReasonEnum.StoppedAtCrosswalk]: 'towing.towReason.STOPPED_AT_CROSSWALK',
  [TowingSearchResponseDtoTowReasonEnum.NoParkingZone]: 'towing.towReason.NO_PARKING_ZONE',
}

const TowingTable = ({ vehicle, initialLicensePlate }: Props) => {
  const [licensePlate] = useState(initialLicensePlate) // TODO: Remove this once the license plate is part of the response
  const { t } = useTranslation('account')
  const variant = vehicle.unloadingLocation ? 'relay' : 'towing'

  const titleTranslationMap = {
    relay: t('towing.informationTitle.relay', { licensePlate }),
    towing: t('towing.informationTitle.towing', { licensePlate }),
  }

  const towReasonTranslationKey = vehicle.towReason
    ? towReasonTranslationKeyMap[vehicle.towReason]
    : undefined

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
              ? [
                  {
                    label: t('towing.informationTable.towReason'),
                    value: towReasonTranslationKey ? t(towReasonTranslationKey) : vehicle.towReason,
                  },
                ]
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
