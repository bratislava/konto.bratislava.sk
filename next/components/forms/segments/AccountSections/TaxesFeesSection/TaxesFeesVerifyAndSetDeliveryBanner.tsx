import BannerTaxWaiting from '@assets/images/banner-tax-waiting.png'
import { ROUTES } from 'frontend/api/constants'
import { useSsrAuth } from 'frontend/hooks/useSsrAuth'
import { useTranslation } from 'next-i18next'
import React from 'react'

import AnnouncementBlock from '../IntroSection/Announcements/AnnouncementBlock'

// TODO: Translations
const content = `## Zobrazenie daní a poplatkov

Pre zobrazenie daní a poplatkov je potrebné overiť vašu identitu a nastaviť preferovaný spôsob doručenia. V prípade, že máte aktívnu elektronickú schránku na doručovanie - slovensko.sk nastavenie spôsobu doručenia nebude potrebné.

Prejdite rýchlym procesom overovania a dostanete prehľad daní a poplatkov.`

type TaxesFeesVerifyAndSetDeliveryBannerProps = {
  onDeliveryMethodChange: () => void
}

const TaxesFeesVerifyAndSetDeliveryBanner = ({
  onDeliveryMethodChange,
}: TaxesFeesVerifyAndSetDeliveryBannerProps) => {
  const { t } = useTranslation('account')
  const { tierStatus } = useSsrAuth()
  const { isIdentityVerified } = tierStatus

  return (
    <AnnouncementBlock
      announcementContent={content}
      // TODO change for image without background color white
      imageSrc={BannerTaxWaiting}
      buttons={[
        {
          children: isIdentityVerified
            ? t('account_section_payment.set_delivery_method')
            : t('account_section_payment.verify_and_set'),
          href: isIdentityVerified ? undefined : ROUTES.IDENTITY_VERIFICATION,
          onPress: isIdentityVerified ? onDeliveryMethodChange : undefined,
          variant: 'black-solid',
        },
      ]}
      reversed
    />
  )
}

export default TaxesFeesVerifyAndSetDeliveryBanner
