import { PhoneIcon } from '@assets/ui-icons'
import { StrapiTaxAdministrator } from '@backend/utils/tax-administrator'
import React from 'react'

import MLinkNew from '../../../simple-components/MLinkNew'

type TaxesFeesTaxAdministratorCardProps = {
  taxAdministrator: StrapiTaxAdministrator
}

/**
 * TODO: Use card component, translations
 * @param taxAdministrator
 * @constructor
 */
const TaxesFeesTaxAdministratorCard = ({
  taxAdministrator,
}: TaxesFeesTaxAdministratorCardProps) => {
  return (
    <div className="flex w-full items-start gap-4 rounded-lg border-2 border-gray-200 p-5">
      <div className="hidden rounded-lg border-2 border-gray-200 p-3 sm:block">
        <PhoneIcon className="size-6 text-main-700" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-p2">Kontaktná osoba pre daň z nehnuteľností</span>
          <span className="text-p1-semibold">{taxAdministrator.name}</span>
        </div>
        <div>
          <MLinkNew href={`tel:${taxAdministrator.phone}`} variant="underlined-medium">
            {taxAdministrator.phone}
          </MLinkNew>
          <span className="px-2"> • </span>
          <MLinkNew href={`mailto:${taxAdministrator.email}`} variant="underlined-medium">
            {taxAdministrator.email}
          </MLinkNew>
          <span className="px-2"> • </span>
          <br />
          <MLinkNew
            href="https://bratislava.sk/mesto-bratislava/dane-a-poplatky"
            variant="underlined-medium"
          >
            Stránkové hodiny
          </MLinkNew>
        </div>
      </div>
    </div>
  )
}

export default TaxesFeesTaxAdministratorCard
