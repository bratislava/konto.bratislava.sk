import { useTranslation } from 'next-i18next/pages'
import { useState } from 'react'

import ImageMestskeKontoSituacia from '@/src/assets/images/mestske-konto-situacia.png'
import DeliveryMethodChangeModal from '@/src/components/page-contents/TaxesPageContent/shared/DeliveryMethodChangeModal'
import AnnouncementBlock from '@/src/components/segments/Announcements/AnnouncementBlock'

const DeliveryMethodNeededBanner = () => {
  const { t } = useTranslation()

  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <DeliveryMethodChangeModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
      <AnnouncementBlock
        announcementContent={t('DeliveryMethodNeededBanner.content')}
        imageSrc={ImageMestskeKontoSituacia}
        buttons={[
          {
            children: t('DeliveryMethodNeededBanner.button'),
            onPress: () => setIsModalOpen(true),
            variant: 'solid',
            fullWidthMobile: true,
          },
        ]}
      />
    </>
  )
}

export default DeliveryMethodNeededBanner
