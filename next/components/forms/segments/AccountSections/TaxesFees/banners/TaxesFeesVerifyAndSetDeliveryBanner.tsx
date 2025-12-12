import ImageMestskeKontoSituacia from '@assets/images/mestske-konto-situacia.png'
import { ROUTES } from 'frontend/api/constants'
import { useSsrAuth } from 'frontend/hooks/useSsrAuth'
import { useTranslation } from 'next-i18next'
import React from 'react'

import AnnouncementBlock from '../../IntroSection/Announcements/AnnouncementBlock'

type TaxesFeesVerifyAndSetDeliveryMethodBannerProps = {
  onDeliveryMethodChange: () => void
}

const TaxesFeesVerifyAndSetDeliveryMethodBanner = ({
  onDeliveryMethodChange,
}: TaxesFeesVerifyAndSetDeliveryMethodBannerProps) => {
  const { t } = useTranslation('account')
  const { tierStatus } = useSsrAuth()
  const { isIdentityVerified } = tierStatus

  const buttonText = isIdentityVerified
    ? t('account_section_payment.set_delivery_method')
    : t('account_section_payment.verify_and_set')

  const announcementContent = isIdentityVerified
    ? t('account_section_payment.set_delivery_method_content')
    : t('account_section_payment.verify_identity_content')

  return (
    <AnnouncementBlock
      announcementContent={announcementContent}
      imageSrc={ImageMestskeKontoSituacia}
      buttons={[
        {
          children: buttonText,
          href: isIdentityVerified ? undefined : ROUTES.IDENTITY_VERIFICATION,
          onPress: isIdentityVerified ? onDeliveryMethodChange : undefined,
          variant: 'black-solid',
          fullWidthMobile: true,
        },
      ]}
    />
  )
}

export default TaxesFeesVerifyAndSetDeliveryMethodBanner
