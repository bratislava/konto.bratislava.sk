import BannerSwimmingPools from '@assets/images/banner-kupaliska.png'
import BannerGardens from '@assets/images/banner-zahrady.png'
import { ArrowRightIcon } from '@assets/ui-icons'
import AnnouncementBlock from 'components/forms/segments/AccountSections/IntroSection/Announcements/AnnouncementBlock'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { AnchorProps } from '../../../../simple-components/ButtonNew'

const Announcements = () => {
  const { t } = useTranslation('account')

  const announcementContentFirst = `<h3>${t('account_section_intro.announcement_card_title_first')}</h3><span>${t(
    'account_section_intro.announcement_card_text_first',
  )}</span>`
  const announcementContentSecond = `<h3>${t('account_section_intro.announcement_card_title_second')}</h3><span>${t(
    'account_section_intro.announcement_card_text_second',
  )}</span>`

  const buttonsFirst: AnchorProps[] = [
    {
      children: t('account_section_intro.announcement_card_button_first'),
      href: 'https://kupaliska.bratislava.sk',
      variant: 'category-solid',
      endIcon: <ArrowRightIcon className="size-6" />,
    },
  ]
  const buttonsSecond: AnchorProps[] = [
    {
      children: t('account_section_intro.announcement_card_button_second'),
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
        imagePath={BannerSwimmingPools}
        buttons={buttonsFirst}
      />
      <AnnouncementBlock
        announcementContent={announcementContentSecond}
        imagePath={BannerGardens}
        buttons={buttonsSecond}
        reversed
      />
    </div>
  )
}

export default Announcements
