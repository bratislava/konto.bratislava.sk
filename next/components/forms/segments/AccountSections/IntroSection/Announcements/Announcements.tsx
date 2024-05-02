import BannerTax from '@assets/images/banner-dane.png'
import { ArrowRightIcon } from '@assets/ui-icons'
import AnnouncementBlock from 'components/forms/segments/AccountSections/IntroSection/Announcements/AnnouncementBlock'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { ROUTES } from '../../../../../../frontend/api/constants'
import { AnchorProps } from '../../../../simple-components/ButtonNew'

type AnnouncementsProps = {
  displayTaxToPayBanner: boolean
}

const Announcements = ({ displayTaxToPayBanner }: AnnouncementsProps) => {
  const { t } = useTranslation('account')

  const announcementContentFirst = displayTaxToPayBanner
    ? `<h3>Daň z nehnuteľností je pripravená na zaplatenie</h3><span>Vygenerovali sme vašu daň z nehnuteľností za rok 2024. Zaplaťte ju jednoducho, digitálne, priamo v konte.</span>`
    : `<h3>${t('account_section_intro.announcement_card_title_first')}</h3><span>${t(
        'account_section_intro.announcement_card_text_first',
      )}</span>`

  const buttons: AnchorProps[] = displayTaxToPayBanner
    ? [
        {
          children: 'Zaplatiť daň z nehnuteľností',
          href: ROUTES.TAXES_AND_FEES_YEAR(2024),
          variant: 'category-solid',
          endIcon: <ArrowRightIcon className="size-6" />,
        },
      ]
    : []

  return (
    <div className="flex flex-col gap-4 px-4 py-6 lg:gap-6 lg:px-0 lg:py-16">
      <h2 className="text-h2">{t('account_section_intro.announcement_title')}</h2>

      <AnnouncementBlock
        announcementContent={announcementContentFirst}
        imagePath={BannerTax}
        buttons={buttons}
      />
    </div>
  )
}

export default Announcements
