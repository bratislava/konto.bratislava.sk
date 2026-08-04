import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { TaxType } from 'openapi-clients/tax'

import Icon from '@/src/components/icon-components/Icon'
import { TaxAdministrator } from '@/src/components/page-contents/TaxesPageContent/resolveTaxAdministrator'
import MLink from '@/src/components/simple-components/MLink'
import { EXTERNAL_LINKS } from '@/src/utils/routes'

type Props = {
  taxType: TaxType
  taxAdministrator: TaxAdministrator | null
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19565-29864&t=tNzWj4dunEH6eCGu-4
 *
 * TODO unify with DeliveryMethodCardWrapper
 */

const TaxAdministratorCardWrapper = ({ taxAdministrator, taxType }: Props) => {
  const { t } = useTranslation('account')

  if (!taxAdministrator) {
    return null
  }

  const cardTitle = {
    [TaxType.Dzn]: t('TaxAdministratorCardWrapper.title.tax'),
    [TaxType.Ko]: t('TaxAdministratorCardWrapper.title.fee'),
  }[taxType]

  const workingHoursLinkHref = {
    [TaxType.Dzn]: EXTERNAL_LINKS.BRATISLAVA_TAXES_INFO_DZN,
    [TaxType.Ko]: EXTERNAL_LINKS.BRATISLAVA_TAXES_INFO_KO,
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
                {t('TaxAdministratorCardWrapper.workingHours')}
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

export default TaxAdministratorCardWrapper
