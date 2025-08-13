import { ClockIcon, MailIcon, PhoneIcon } from '@assets/ui-icons'
import { StrapiTaxAdministrator } from '@backend/utils/strapi-tax-administrator'
import { ResponseTaxAdministratorDto } from 'openapi-clients/tax'

import MLinkNew from '../../../simple-components/MLinkNew'

type TaxesFeesTaxAdministratorCardProps = {
  beTaxAdministrator: ResponseTaxAdministratorDto | null
  strapiTaxAdministrator: StrapiTaxAdministrator | null
}

const normalizeBeTaxAdministrator = (taxAdministrator: ResponseTaxAdministratorDto) => {
  return {
    name: taxAdministrator.name,
    phone: taxAdministrator.phoneNumber,
    email: taxAdministrator.email,
  }
}

/**
 * TODO: Use card component, translations
 */
const TaxesFeesTaxAdministratorCard = ({
  beTaxAdministrator,
  strapiTaxAdministrator,
}: TaxesFeesTaxAdministratorCardProps) => {
  const taxAdministrator = beTaxAdministrator
    ? normalizeBeTaxAdministrator(beTaxAdministrator)
    : strapiTaxAdministrator

  if (!taxAdministrator) {
    return null
  }
  return (
    <div className="flex w-full items-center justify-between gap-4 rounded-lg border-2 border-gray-200 p-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-p1-semibold">{taxAdministrator.name}</span>
        </div>
        <div className="flex flex-wrap content-center items-center gap-x-5 gap-y-2 self-stretch">
          <span className="flex items-center gap-x-2">
            <PhoneIcon className="size-5" />
            <MLinkNew href={`tel:${taxAdministrator.phone}`} variant="underlined-medium">
              {taxAdministrator.phone}
            </MLinkNew>
          </span>

          <span className="flex items-center gap-x-2">
            <MailIcon className="size-5" />
            <MLinkNew href={`mailto:${taxAdministrator.email}`} variant="underlined-medium">
              {taxAdministrator.email}
            </MLinkNew>
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
      <div className="hidden rounded-lg border-2 border-gray-200 p-3 sm:block">
        <PhoneIcon className="size-6 text-main-700" />
      </div>
    </div>
  )
}

export default TaxesFeesTaxAdministratorCard
