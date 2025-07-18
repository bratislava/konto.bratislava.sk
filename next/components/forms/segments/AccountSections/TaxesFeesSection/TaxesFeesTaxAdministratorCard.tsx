import { ClockIcon, MailIcon, PhoneIcon } from '@assets/ui-icons'
import { StrapiTaxAdministrator } from '@backend/utils/strapi-tax-administrator'

import MLinkNew from '../../../simple-components/MLinkNew'

type TaxesFeesTaxAdministratorCardProps = {
  strapiTaxAdministrator: StrapiTaxAdministrator
}

/**
 * TODO: Use card component, translations
 */
const TaxesFeesTaxAdministratorCard = ({
  strapiTaxAdministrator,
}: TaxesFeesTaxAdministratorCardProps) => {
  return (
    <div className="flex w-full items-start gap-4 rounded-lg border-2 border-gray-200 p-5">
      <div className="hidden rounded-lg border-2 border-gray-200 p-3 sm:block">
        <PhoneIcon className="size-6 text-main-700" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-p2">Kontaktná osoba pre daň z nehnuteľností</span>
          <span className="text-p1-semibold">{strapiTaxAdministrator.name}</span>
        </div>
        <div className="flex flex-wrap content-center items-center gap-x-3 gap-y-2 self-stretch">
          <span className="flex items-center gap-x-2">
            <PhoneIcon className="size-5" />
            <MLinkNew href={`tel:${strapiTaxAdministrator.phone}`} variant="underlined-medium">
              {strapiTaxAdministrator.phone}
            </MLinkNew>
            <span> • </span>
          </span>

          <span className="flex items-center gap-x-2">
            <MailIcon className="size-5" />
            <MLinkNew href={`mailto:${strapiTaxAdministrator.email}`} variant="underlined-medium">
              {strapiTaxAdministrator.email}
            </MLinkNew>
            <span> • </span>
          </span>

          <span className="flex items-center gap-x-2">
            <ClockIcon className="size-5" />
            <MLinkNew
              href="https://bratislava.sk/mesto-bratislava/dane-a-poplatky"
              variant="underlined-medium"
            >
              Stránkové hodiny
            </MLinkNew>
          </span>
        </div>
      </div>
    </div>
  )
}

export default TaxesFeesTaxAdministratorCard
