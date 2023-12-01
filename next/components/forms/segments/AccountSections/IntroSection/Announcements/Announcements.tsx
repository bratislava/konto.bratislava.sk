import ConstructionSciFiImg from '@assets/images/construction-sci-fi.png'
import CorporateIdentityImg from '@assets/images/corporate-identity.png'
import KupaliskaImg from '@assets/images/kupaliska.png'
import AnnouncementBlock from 'components/forms/segments/AccountSections/IntroSection/Announcements/AnnouncementBlock'
import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { environment } from '../../../../../../environment'
import { ROUTES } from '../../../../../../frontend/api/constants'

const Announcements = () => {
  const { t } = useTranslation('account')
  const router = useRouter()
  const { isLegalEntity } = useServerSideAuth()

  const announcementContentZero = `
<h4>${t('account_section_intro.announcement_card_title_zero')}</h4><span>${t(
    'account_section_intro.announcement_card_text_zero',
  )}</span>`
  const announcementContentFirst = `
<h4>${t('account_section_intro.announcement_card_title_first')}</h4><span>${t(
    'account_section_intro.announcement_card_text_first',
  )}</span>`
  const announcementContentSecond = `
<h4>${t('account_section_intro.announcement_card_title_second')}</h4><span>${t(
    'account_section_intro.announcement_card_text_second',
  )}</span>`

  return (
    <div className="flex flex-col gap-4 px-4 py-6 lg:gap-6 lg:px-0 lg:py-16">
      <h2 className="text-h2">{t('account_section_intro.announcement_title')}</h2>

      {environment.featureToggles.formsInMenu ? (
        <>
          {!isLegalEntity && (
            <AnnouncementBlock
              announcementContent={announcementContentFirst}
              imagePath={CorporateIdentityImg}
              onPress={() => router.push(ROUTES.REGISTER)}
              buttonTitle={t('account_section_intro.announcement_card_action_first')}
            />
          )}
          <AnnouncementBlock
            announcementContent={announcementContentSecond}
            imagePath={ConstructionSciFiImg}
            onPress={() => router.push(ROUTES.MUNICIPAL_SERVICES)}
            buttonTitle={t('account_section_intro.announcement_card_action_second')}
            reversed
          />
        </>
      ) : (
        <AnnouncementBlock announcementContent={announcementContentZero} imagePath={KupaliskaImg} />
      )}
    </div>
  )
}

export default Announcements
