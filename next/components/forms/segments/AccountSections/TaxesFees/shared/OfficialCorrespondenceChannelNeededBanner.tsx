import ImageMestskeKontoSituacia from '@assets/images/mestske-konto-situacia.png'
import AnnouncementBlock from 'components/forms/segments/AccountSections/IntroSection/Announcements/AnnouncementBlock'
import TaxesFeesDeliveryMethodChangeModal from 'components/forms/segments/AccountSections/TaxesFees/shared/TaxesFeesDeliveryMethod/TaxesFeesDeliveryMethodChangeModal'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'

const OfficialCorrespondenceChannelNeededBanner = () => {
  const { t } = useTranslation('account')

  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <TaxesFeesDeliveryMethodChangeModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
      <AnnouncementBlock
        announcementContent={t('account_section_payment.set_delivery_method_content')}
        imageSrc={ImageMestskeKontoSituacia}
        buttons={[
          {
            children: t('account_section_payment.set_delivery_method'),
            onPress: () => setIsModalOpen(true),
            variant: 'black-solid',
            fullWidthMobile: true,
          },
        ]}
      />
    </>
  )
}

export default OfficialCorrespondenceChannelNeededBanner
