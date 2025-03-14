import BannerTaxes from '@assets/images/banner-dane.png'
import BannerRental from '@assets/images/banner-najomne-byvanie.png'
import BannerGardens from '@assets/images/banner-zahrady.png'
import { ArrowRightIcon } from '@assets/ui-icons'
import AnnouncementBlock from 'components/forms/segments/AccountSections/IntroSection/Announcements/AnnouncementBlock'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { ROUTES } from '../../../../../../frontend/api/constants'
import { useSsrAuth } from '../../../../../../frontend/hooks/useSsrAuth'
import { AnchorProps } from '../../../../simple-components/ButtonNew'

const Announcements = () => {
  const { isLegalEntity } = useSsrAuth()
  const { t } = useTranslation('account')

  const announcementContentFirst = `<h3>${t('account_section_intro.announcement_card_title_first')}</h3><span>${t(
    'account_section_intro.announcement_card_text_first',
  )}</span>`
  const announcementContentSecond = `<h3>${t('account_section_intro.announcement_card_title_second')}</h3><span>${t(
    'account_section_intro.announcement_card_text_second',
  )}</span>`
  const announcementContentThird = `<h3>${t('account_section_intro.announcement_card_title_third')}</h3><span>${t(
    'account_section_intro.announcement_card_text_third',
  )}</span>`

  const buttonsFirst: AnchorProps[] = [
    {
      children: t('account_section_intro.announcement_card_button_first'),
      href: ROUTES.TAXES_AND_FEES,
      variant: 'category-solid',
      endIcon: <ArrowRightIcon className="size-6" />,
    },
  ]
  const buttonsSecond: AnchorProps[] = [
    {
      children: t('account_section_intro.announcement_card_button_second'),
      href: ROUTES.MUNICIPAL_SERVICES_FORM('ziadost-o-najom-bytu'),
      variant: 'category-solid',
      endIcon: <ArrowRightIcon className="size-6" />,
    },
  ]
  const buttonsThird: AnchorProps[] = [
    {
      children: t('account_section_intro.announcement_card_button_third'),
      href: 'https://bratislava.sk/zivotne-prostredie-a-vystavba/zelen/udrzba-a-tvorba-zelene/komunitne-zahrady',
      variant: 'category-solid',
      endIcon: <ArrowRightIcon className="size-6" />,
    },
  ]

  return (
    <div className="flex flex-col gap-4 px-4 py-6 lg:gap-6 lg:px-0 lg:py-16">
      <h2 className="text-h2">{t('account_section_intro.announcement_title')}</h2>
      <AnnouncementBlock
        announcementContent={announcementContentFirst}
        imagePath={BannerTaxes}
        buttons={buttonsFirst}
      />
      {!isLegalEntity && (
        <AnnouncementBlock
          announcementContent={announcementContentSecond}
          imagePath={BannerRental}
          buttons={buttonsSecond}
          reversed
        />
      )}
      <AnnouncementBlock
        announcementContent={announcementContentThird}
        imagePath={BannerGardens}
        buttons={buttonsThird}
        reversed={isLegalEntity}
      />
    </div>
  )
}

export default Announcements
