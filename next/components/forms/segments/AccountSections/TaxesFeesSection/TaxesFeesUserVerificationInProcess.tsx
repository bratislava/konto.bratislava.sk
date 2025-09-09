import BannerTaxWaiting from '@assets/images/banner-tax-waiting.png'
import { useTranslation } from 'next-i18next'
import React from 'react'

import AnnouncementBlock from '../IntroSection/Announcements/AnnouncementBlock'

const TaxesFeesUserVerificationInProcess = () => {
  const { t } = useTranslation('account')

  return (
    <AnnouncementBlock
      announcementContent={t('account_section_payment.verifying_identity_content')}
      // TODO change for image without background color white
      imageSrc={BannerTaxWaiting}
      reversed
    />
  )
}

export default TaxesFeesUserVerificationInProcess
