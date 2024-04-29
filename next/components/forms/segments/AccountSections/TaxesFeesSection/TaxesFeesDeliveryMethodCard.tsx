import { Castle48PxIcon } from '@assets/ui-icons'
import { UserOfficialCorrespondenceChannelEnum } from '@clients/openapi-city-account'
import React from 'react'

import { useUser } from '../../../../../frontend/hooks/useUser'
import ButtonNew from '../../../simple-components/ButtonNew'

type TaxesFeesDeliveryMethodCardProps = {
  onDeliveryMethodChange: () => void
}

const TaxesFeesDeliveryMethodCard = ({
  onDeliveryMethodChange,
}: TaxesFeesDeliveryMethodCardProps) => {
  const { userData } = useUser()

  // TODO: Translations
  const type = {
    [UserOfficialCorrespondenceChannelEnum.Email]: 'Oznámenie cez Bratislavské konto',
    [UserOfficialCorrespondenceChannelEnum.Postal]: 'Rozhodnutie poštou do vlastných rúk',
    [UserOfficialCorrespondenceChannelEnum.Edesk]:
      'Rozhodnutie do elektronickej schránky (slovensko.sk) s možnosťou platby v Bratislavskom konte',
  }[userData.officialCorrespondenceChannel]
  const displayChangeButton =
    userData.officialCorrespondenceChannel !== UserOfficialCorrespondenceChannelEnum.Edesk

  return (
    <div className="flex w-full items-start gap-4 rounded-lg border-2 border-gray-200 p-4 lg:p-5">
      <div className="hidden rounded-lg border-2 border-gray-200 p-3 sm:block">
        {/* TODO: Icon */}
        <Castle48PxIcon className="size-6 text-main-700" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          {/* TODO: Translations */}
          <span className="text-p2">Spôsob doručovania daní a poplatkov</span>
          <span className="text-p1-semibold">{type}</span>
        </div>
        {displayChangeButton && (
          <div>
            <ButtonNew onPress={onDeliveryMethodChange} variant="black-link">
              {/* TODO: Translations */}
              Zmeniť
            </ButtonNew>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaxesFeesDeliveryMethodCard
