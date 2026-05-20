import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { ResponseTaxAdministratorDto, TaxType } from 'openapi-clients/tax'

import { StrapiTaxAdministrator } from '@/src/backend/utils/strapi-tax-administrator'
import Icon from '@/src/components/icon-components/Icon'
import MLink from '@/src/components/simple-components/MLink'
import { EXTERNAL_LINKS } from '@/src/utils/routes'

type Props = {
  taxType: TaxType
  beTaxAdministrator: ResponseTaxAdministratorDto | null
  strapiTaxAdministrator: StrapiTaxAdministrator | null
}

// TODO this normalization shouldn't happen so deep, consider moving to SSR step
const normalizeBeTaxAdministrator = (taxAdministrator: ResponseTaxAdministratorDto) => {
  return {
    name: taxAdministrator.name,
    phone: taxAdministrator.phoneNumber,
    email: taxAdministrator.email,
  }
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19565-29864&t=tNzWj4dunEH6eCGu-4
 *
 * TODO unify with OfficialCorrespondenceChannelCardWrapper
 */

const TaxesFeesAdministratorCardWrapper = ({
  beTaxAdministrator,
  strapiTaxAdministrator,
  taxType,
}: Props) => {
  const { t } = useTranslation('account')

  const taxAdministrator = beTaxAdministrator
    ? normalizeBeTaxAdministrator(beTaxAdministrator)
    : strapiTaxAdministrator

  if (!taxAdministrator) {
    return null
  }

  // TODO Temporarily hidden until we fetch the administator correctly 
  if (taxType !== TaxType.Dzn && !beTaxAdministrator ) {
    return null
  }

  const cardTitle = {
    [TaxType.Dzn]: t('account_section_payment.your_tax_administrator.tax'),
    [TaxType.Ko]: t('account_section_payment.your_tax_administrator.fee'),
  }[taxType]

  const workingHoursLinkHref = {
    [TaxType.Dzn]: EXTERNAL_LINKS.BRATISLAVA_TAXES_AND_FEES_INFO_DZN,
    [TaxType.Ko]: EXTERNAL_LINKS.BRATISLAVA_TAXES_AND_FEES_INFO_KO,
  }[taxType]

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="h5" as="h2">
        {cardTitle}
      </Typography>
      <div className="flex w-full grow items-start justify-between gap-4 rounded-lg border px-4 py-3 lg:p-5">
        <div className="flex flex-col gap-3">
          <Typography variant="p-small" className="font-semibold">
            {taxAdministrator.name}
          </Typography>
          <div className="flex flex-col flex-wrap gap-x-4 gap-y-2 self-stretch break-all lg:flex-row lg:items-center">
            <span className="flex items-center gap-x-2">
              <Icon name="phone-call" className="size-5 shrink-0" />
              <MLink href={`tel:${taxAdministrator.phone}`} variant="underlined-medium">
                {taxAdministrator.phone}
              </MLink>
            </span>

            <span className="flex items-center gap-x-2">
              <Icon name="mail" className="size-5 shrink-0" />
              <MLink href={`mailto:${taxAdministrator.email}`} variant="underlined-medium">
                {taxAdministrator.email}
              </MLink>
            </span>

            <span className="flex items-center gap-x-2">
              <Icon name="clock" className="size-5 shrink-0" />
              <MLink href={workingHoursLinkHref} variant="underlined-medium" target="_blank">
                {t('taxes.tax_administrator_card.working_hours')}
              </MLink>
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-gray-100 p-3 max-lg:hidden">
          <Icon name="phone-call" className="size-6" />
        </div>
      </div>
    </div>
  )
}

export default TaxesFeesAdministratorCardWrapper
