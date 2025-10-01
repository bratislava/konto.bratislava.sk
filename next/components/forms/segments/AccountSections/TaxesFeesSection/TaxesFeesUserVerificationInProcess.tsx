import MestskeKontoSituacia from '@assets/images/mestske-konto-situacia.svg'
import { useTranslation } from 'next-i18next'
import React from 'react'

import AnnouncementBlock from '../IntroSection/Announcements/AnnouncementBlock'

const TaxesFeesUserVerificationInProcess = () => {
  const { t } = useTranslation('account')

  return (
    <AnnouncementBlock
      announcementContent={t('account_section_payment.verifying_identity_content')}
      icon={<MestskeKontoSituacia className="h-[140px] w-[145px] sm:h-[256px] sm:w-[608px]" />}
      reversed
    />
  )
}

export default TaxesFeesUserVerificationInProcess
