import BannerTax from '@assets/images/banner-dane.png'
import AnnouncementBlock from 'components/forms/segments/AccountSections/IntroSection/Announcements/AnnouncementBlock'
import { useTranslation } from 'next-i18next'

const Announcements = () => {
  const { t } = useTranslation('account')

  const announcementContentFirst = `
<h3>${t('account_section_intro.announcement_card_title_first')}</h3><span>${t(
    'account_section_intro.announcement_card_text_first',
  )}</span>`

  return (
    <div className="flex flex-col gap-4 px-4 py-6 lg:gap-6 lg:px-0 lg:py-16">
      <h2 className="text-h2">{t('account_section_intro.announcement_title')}</h2>

      <AnnouncementBlock announcementContent={announcementContentFirst} imagePath={BannerTax} />
    </div>
  )
}

export default Announcements
