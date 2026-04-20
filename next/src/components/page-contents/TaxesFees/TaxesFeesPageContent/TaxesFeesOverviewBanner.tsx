import { useTranslation } from 'next-i18next/pages'
import { TaxType } from 'openapi-clients/tax'

import ImageMestskeKontoSituacia from '@/src/assets/images/mestske-konto-situacia.png'
import AnnouncementBlock from '@/src/components/segments/Announcements/AnnouncementBlock'
import { ROUTES } from '@/src/utils/routes'

type Props = {
  variant: 'looking-for' | 'no-results'
  taxType: TaxType
}

const TaxesFeesOverviewBanner = ({ variant, taxType }: Props) => {
  const { t } = useTranslation('account')

  const titleLookingFor = {
    [TaxType.Dzn]: t('account_section_payment.searching_card_title.dzn'),
    [TaxType.Ko]: t('account_section_payment.searching_card_title.ko'),
  }[taxType]

  const textLookingFor = {
    [TaxType.Dzn]: t('account_section_payment.searching_card_text.dzn'),
    [TaxType.Ko]: t('account_section_payment.searching_card_text.ko'),
  }[taxType]

  const titleNoResults = {
    [TaxType.Dzn]: t('account_section_payment.error_card_title.dzn'),
    [TaxType.Ko]: t('account_section_payment.error_card_title.ko'),
  }[taxType]

  const textNoResults = {
    [TaxType.Dzn]: t('account_section_payment.error_card_content.text.dzn', {
      url: ROUTES.MUNICIPAL_SERVICES_FORM('priznanie-k-dani-z-nehnutelnosti'),
    }),
    [TaxType.Ko]: t('account_section_payment.error_card_content.text.ko', {
      url: ROUTES.MUNICIPAL_SERVICES_FORM('oznamenie-o-poplatkovej-povinnosti-za-komunalne-odpady'),
    }),
  }[taxType]

  const content = {
    'looking-for': `<h4>${titleLookingFor}</h4>${textLookingFor}`,
    'no-results': `<h4>${titleNoResults}</h4>${textNoResults}`,
  }[variant]

  return <AnnouncementBlock announcementContent={content} imageSrc={ImageMestskeKontoSituacia} />
}

export default TaxesFeesOverviewBanner
