import { ClockIcon, MailIcon, PhoneIcon } from '@assets/ui-icons'
import { StrapiTaxAdministrator } from '@backend/utils/strapi-tax-administrator'
import cn from 'frontend/cn'
import { useTranslation } from 'next-i18next'
import { ResponseTaxAdministratorDto } from 'openapi-clients/tax'

import MLinkNew from '../../../../simple-components/MLinkNew'

type TaxesFeesTaxAdministratorCardProps = {
  beTaxAdministrator: ResponseTaxAdministratorDto | null
  strapiTaxAdministrator: StrapiTaxAdministrator | null
  removeBorder?: boolean
}

const normalizeBeTaxAdministrator = (taxAdministrator: ResponseTaxAdministratorDto) => {
  return {
    name: taxAdministrator.name,
    phone: taxAdministrator.phoneNumber,
    email: taxAdministrator.email,
  }
}

const TaxesFeesTaxAdministratorCard = ({
  beTaxAdministrator,
  strapiTaxAdministrator,
  removeBorder = false,
}: TaxesFeesTaxAdministratorCardProps) => {
  const { t } = useTranslation('account')
  const taxAdministrator = beTaxAdministrator
    ? normalizeBeTaxAdministrator(beTaxAdministrator)
    : strapiTaxAdministrator

  if (!taxAdministrator) {
    return null
  }

  return (
    <div
      className={cn(
        'flex w-full flex-1 items-center items-start justify-between gap-4 rounded-lg border-2 border-gray-200 px-4 py-3 lg:p-5',
        {
          'border-none': removeBorder,
        },
      )}
    >
      <div className="flex flex-col gap-4 lg:gap-3">
        <div className="flex flex-col">
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
              href="https://bratislava.sk/mesto-bratislava/dane-a-poplatky/dan-z-nehnutelnosti"
              variant="underlined-medium"
            >
              {t('taxes.tax_administrator_card.working_hours')}
            </MLinkNew>
          </span>
        </div>
      </div>
      {/* TODO: this icon is used /dane-a-poplatky icon in the middle and /dane-a-poplatky/2025 icon in the top */}
      <div className="block rounded-lg bg-gray-100 p-3">
        <PhoneIcon className="size-6" />
      </div>
    </div>
  )
}

export default TaxesFeesTaxAdministratorCard
