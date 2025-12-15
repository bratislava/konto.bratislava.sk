import ImageMestskeKontoSituacia from '@assets/images/mestske-konto-situacia.png'
import AnnouncementBlock from 'components/forms/segments/AccountSections/IntroSection/Announcements/AnnouncementBlock'
import { useTranslation } from 'next-i18next'
import React from 'react'

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
