import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'

import ImageMestskeKontoSituacia from '@/src/assets/images/mestske-konto-situacia.png'
import AnnouncementBlock from '@/src/components/page-contents/IntroPageContent/Announcements/AnnouncementBlock'
import OfficialCorrespondenceChannelChangeModal from '@/src/components/page-contents/TaxesFees/shared/OfficialCorrespondenceChannelChangeModal'

const OfficialCorrespondenceChannelNeededBanner = () => {
  const { t } = useTranslation('account')

  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <OfficialCorrespondenceChannelChangeModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
      <AnnouncementBlock
        announcementContent={t('account_section_payment.set_delivery_method_content')}
        imageSrc={ImageMestskeKontoSituacia}
        buttons={[
          {
            children: t('account_section_payment.set_delivery_method'),
            onPress: () => setIsModalOpen(true),
            variant: 'solid',
            fullWidthMobile: true,
          },
        ]}
      />
    </>
  )
}

export default OfficialCorrespondenceChannelNeededBanner
