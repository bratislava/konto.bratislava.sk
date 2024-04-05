import { Castle48PxIcon } from '@assets/ui-icons'
import React from 'react'

import ButtonNew from '../../../simple-components/ButtonNew'

// TODO Implement
const TaxesFeesDeliveryMethodCard = () => {
  return (
    <div className="flex w-full items-start gap-4 rounded-lg border-2 border-gray-200 p-5">
      <div className="hidden rounded-lg border-2 border-gray-200 p-3 sm:block">
        <Castle48PxIcon className="size-6 text-main-700" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-p2">Spôsob doručovania daní a poplatkov</span>
          <span className="text-p1-semibold">Oznámenie cez Bratislavské konto</span>
        </div>
        <div>
          <ButtonNew onPress={() => console.log('Change')} variant="black-link">
            Zmeniť
          </ButtonNew>
        </div>
      </div>
    </div>
  )
}

export default TaxesFeesDeliveryMethodCard
