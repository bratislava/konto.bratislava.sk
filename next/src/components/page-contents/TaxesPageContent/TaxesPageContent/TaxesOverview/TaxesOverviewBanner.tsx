import { useTranslation } from 'next-i18next/pages'
import { TaxType } from 'openapi-clients/tax'

import ImageMestskeKontoSituacia from '@/src/assets/images/mestske-konto-situacia.png'
import AnnouncementBlock from '@/src/components/segments/Announcements/AnnouncementBlock'
import { ROUTES } from '@/src/utils/routes'

type Props = {
  variant: 'looking-for' | 'no-results'
  taxType: TaxType
}

const TaxesOverviewBanner = ({ variant, taxType }: Props) => {
  const { t } = useTranslation('account')

  const titleLookingFor = {
    [TaxType.Dzn]: t('TaxesOverviewBanner.lookingFor.title.dzn'),
    [TaxType.Ko]: t('TaxesOverviewBanner.lookingFor.title.ko'),
  }[taxType]

  const textLookingFor = {
    [TaxType.Dzn]: t('TaxesOverviewBanner.lookingFor.content.dzn'),
    [TaxType.Ko]: t('TaxesOverviewBanner.lookingFor.content.ko'),
  }[taxType]

  const titleNoResults = {
    [TaxType.Dzn]: t('TaxesOverviewBanner.noResults.title.dzn'),
    [TaxType.Ko]: t('TaxesOverviewBanner.noResults.title.ko'),
  }[taxType]

  const textNoResults = {
    [TaxType.Dzn]: t('TaxesOverviewBanner.noResults.content.dzn', {
      url: ROUTES.MUNICIPAL_SERVICES_FORM('priznanie-k-dani-z-nehnutelnosti'),
    }),
    [TaxType.Ko]: t('TaxesOverviewBanner.noResults.content.ko', {
      url: ROUTES.MUNICIPAL_SERVICES_FORM('oznamenie-o-poplatkovej-povinnosti-za-komunalne-odpady'),
    }),
  }[taxType]

  const content = {
    'looking-for': `#### ${titleLookingFor} \n ${textLookingFor}`,
    'no-results': `#### ${titleNoResults} \n ${textNoResults}`,
  }[variant]

  return <AnnouncementBlock announcementContent={content} imageSrc={ImageMestskeKontoSituacia} />
}

export default TaxesOverviewBanner
