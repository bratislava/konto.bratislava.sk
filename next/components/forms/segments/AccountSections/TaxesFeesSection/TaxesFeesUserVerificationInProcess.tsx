import ImageMestskeKontoSituacia from '@assets/images/mestske-konto-situacia.png'
import { useTranslation } from 'next-i18next'
import React from 'react'

import AnnouncementBlock from '../IntroSection/Announcements/AnnouncementBlock'

const TaxesFeesUserVerificationInProcess = () => {
  const { t } = useTranslation('account')

  return (
    <AnnouncementBlock
      announcementContent={t('account_section_payment.verifying_identity_content')}
      imageSrc={ImageMestskeKontoSituacia}
      reversed
    />
  )
}

export default TaxesFeesUserVerificationInProcess
