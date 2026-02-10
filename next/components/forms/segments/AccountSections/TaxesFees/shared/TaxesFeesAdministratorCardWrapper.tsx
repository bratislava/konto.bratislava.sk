import { ClockIcon, MailIcon, PhoneIcon } from '@assets/ui-icons'
import { StrapiTaxAdministrator } from '@backend/utils/strapi-tax-administrator'
import MLink from 'components/forms/simple-components/MLink'
import { EXTERNAL_LINKS } from 'frontend/api/constants'
import { useTranslation } from 'next-i18next'
import { ResponseTaxAdministratorDto, TaxType } from 'openapi-clients/tax'
import React from 'react'

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
      <h2 className="text-h5-semibold">{cardTitle}</h2>
      <div className="flex w-full grow items-start justify-between gap-4 rounded-lg border px-4 py-3 lg:p-5">
        <div className="flex flex-col gap-3">
          <p className="text-p1-semibold">{taxAdministrator.name}</p>
          <div className="flex flex-col flex-wrap gap-x-4 gap-y-2 self-stretch break-all lg:flex-row lg:items-center">
            <span className="flex items-center gap-x-2">
              <PhoneIcon className="size-5 shrink-0" />
              <MLink href={`tel:${taxAdministrator.phone}`} variant="underlined-medium">
                {taxAdministrator.phone}
              </MLink>
            </span>

            <span className="flex items-center gap-x-2">
              <MailIcon className="size-5 shrink-0" />
              <MLink href={`mailto:${taxAdministrator.email}`} variant="underlined-medium">
                {taxAdministrator.email}
              </MLink>
            </span>

            <span className="flex items-center gap-x-2">
              <ClockIcon className="size-5 shrink-0" />
              <MLink href={workingHoursLinkHref} variant="underlined-medium" target="_blank">
                {t('taxes.tax_administrator_card.working_hours')}
              </MLink>
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-gray-100 p-3 max-lg:hidden">
          <PhoneIcon className="size-6" />
        </div>
      </div>
    </div>
  )
}

export default TaxesFeesAdministratorCardWrapper
