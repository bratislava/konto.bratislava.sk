import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { TowingSearchResponseDto, TowReason } from 'openapi-clients/city-account'
import { useMemo, useState } from 'react'

import Table from '@/src/components/common/Table/Table'
import { formatDate } from '@/src/components/formatting/FormatDate'
import Markdown from '@/src/components/formatting/Markdown'
import Alert from '@/src/components/simple-components/Alert'

type Props = {
  vehicle: TowingSearchResponseDto
  initialLicensePlate: string
}

const TowingTable = ({ vehicle, initialLicensePlate }: Props) => {
  const { t } = useTranslation('account')

  const [licensePlate] = useState(initialLicensePlate) // TODO: Remove this once the license plate is part of the response
  const variant = vehicle.unloadingLocation ? 'relay' : 'towing'

  const title = {
    relay: t('towing.informationTitle.relay', { licensePlate }),
    towing: t('towing.informationTitle.towing', { licensePlate }),
  }[variant]

  const towReasonTranslation = useMemo(() => {
    const towReasonTranslationMap: Record<TowReason, string> = {
      [TowReason.ReservedParking]: t('towing.towReason.RESERVED_PARKING'),
      [TowReason.PrivateAccessObstacle]: t('towing.towReason.PRIVATE_ACCESS_OBSTACLE'),
      [TowReason.ParkingNearPublicTransportStop]: t(
        'towing.towReason.PARKING_NEAR_PUBLIC_TRANSPORT_STOP',
      ),
      [TowReason.ParkingNearPedestrianCrossing]: t(
        'towing.towReason.PARKING_NEAR_PEDESTRIAN_CROSSING',
      ),
      [TowReason.ParkingOnSidewalk]: t('towing.towReason.PARKING_ON_SIDEWALK'),
      [TowReason.ParkingInTrafficLane]: t('towing.towReason.PARKING_IN_TRAFFIC_LANE'),
      [TowReason.ParkingAtStreetCrossing]: t('towing.towReason.PARKING_AT_STREET_CROSSING'),
      [TowReason.Other]: t('towing.towReason.OTHER'),
      [TowReason.TrafficFlowObstacle]: t('towing.towReason.TRAFFIC_FLOW_OBSTACLE'),
      [TowReason.NoStoppingZone]: t('towing.towReason.NO_STOPPING_ZONE'),
      [TowReason.StoppedAtCrosswalk]: t('towing.towReason.STOPPED_AT_CROSSWALK'),
      [TowReason.NoParkingZone]: t('towing.towReason.NO_PARKING_ZONE'),
    }

    return vehicle.towReason ? towReasonTranslationMap[vehicle.towReason] : undefined
  }, [t, vehicle.towReason])

  return (
    <>
      <Typography variant="h3">{title}</Typography>

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
                    value: towReasonTranslation ?? vehicle.towReason,
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
