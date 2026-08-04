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
    relay: t('TowingTable.title.relay', { licensePlate }),
    towing: t('TowingTable.title.towing', { licensePlate }),
  }[variant]

  const towReasonTranslation = useMemo(() => {
    const towReasonTranslationMap: Record<TowReason, string> = {
      [TowReason.ReservedParking]: t('TowingTable.towReasons.RESERVED_PARKING'),
      [TowReason.PrivateAccessObstacle]: t('TowingTable.towReasons.PRIVATE_ACCESS_OBSTACLE'),
      [TowReason.ParkingNearPublicTransportStop]: t(
        'TowingTable.towReasons.PARKING_NEAR_PUBLIC_TRANSPORT_STOP',
      ),
      [TowReason.ParkingNearPedestrianCrossing]: t(
        'TowingTable.towReasons.PARKING_NEAR_PEDESTRIAN_CROSSING',
      ),
      [TowReason.ParkingOnSidewalk]: t('TowingTable.towReasons.PARKING_ON_SIDEWALK'),
      [TowReason.ParkingInTrafficLane]: t('TowingTable.towReasons.PARKING_IN_TRAFFIC_LANE'),
      [TowReason.ParkingAtStreetCrossing]: t('TowingTable.towReasons.PARKING_AT_STREET_CROSSING'),
      [TowReason.Other]: t('TowingTable.towReasons.OTHER'),
      [TowReason.TrafficFlowObstacle]: t('TowingTable.towReasons.TRAFFIC_FLOW_OBSTACLE'),
      [TowReason.NoStoppingZone]: t('TowingTable.towReasons.NO_STOPPING_ZONE'),
      [TowReason.StoppedAtCrosswalk]: t('TowingTable.towReasons.STOPPED_AT_CROSSWALK'),
      [TowReason.NoParkingZone]: t('TowingTable.towReasons.NO_PARKING_ZONE'),
    }

    return vehicle.towReason ? towReasonTranslationMap[vehicle.towReason] : undefined
  }, [t, vehicle.towReason])

  return (
    <>
      <Typography variant="h3">{title}</Typography>

      <div className="flex flex-col gap-4">
        <Table
          rows={[
            { label: t('TowingTable.licensePlate'), value: licensePlate },
            {
              label: t('TowingTable.loadingDate'),
              value: formatDate(vehicle.loadingDate, 'sk', 'short'),
            },
            {
              label: t('TowingTable.loadingTime'),
              value: formatDate(vehicle.loadingDate, 'sk', 'time'),
            },
            {
              label: t('TowingTable.loadingLocation'),
              value: vehicle.loadingLocation,
            },
            ...(vehicle.towReason
              ? [
                  {
                    label: t('TowingTable.towReason'),
                    value: towReasonTranslation ?? vehicle.towReason,
                  },
                ]
              : []),
            ...(vehicle.unloadingLocation
              ? [
                  {
                    label: t('TowingTable.unloadingLocation'),
                    value: vehicle.unloadingLocation,
                  },
                ]
              : []),
            ...(vehicle.relocationReason
              ? [
                  {
                    label: t('TowingTable.relocationReason'),
                    value: vehicle.relocationReason,
                  },
                ]
              : []),
            ...(variant === 'towing'
              ? [
                  {
                    label: t('TowingTable.payment'),
                    value: t('TowingTable.paymentValue'),
                    isMarkdown: true,
                  },
                ]
              : []),
          ]}
          notification={
            variant === 'towing' ? (
              <Alert
                message={<Markdown content={t('TowingTable.paymentNotification')} />}
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
