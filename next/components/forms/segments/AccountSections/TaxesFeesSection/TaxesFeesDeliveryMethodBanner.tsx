import BannerTax from '@assets/images/banner-dane.png'
import { GDPRCategoryEnum, GDPRTypeEnum, } from 'openapi-clients/city-account'
import React from 'react'

import { useUserSubscription } from '../../../../../frontend/hooks/useUser'
import AnnouncementBlock from '../IntroSection/Announcements/AnnouncementBlock'

// TODO: Translations
const content = `## Ušetrite cestu na poštu a chráňte životné prostredie

Zmeňte si spôsob doručovania miestnych daní a poplatkov 
a plaťte cez Bratislavské konto. Vďaka zmene zákona môžete dostávať a platiť dane a poplatky už len elektronicky.`

type TaxesFeesDeliveryMethodBannerProps = {
  onDeliveryMethodChange: () => void
}

const TaxesFeesDeliveryMethodBanner = ({
  onDeliveryMethodChange,
}: TaxesFeesDeliveryMethodBannerProps) => {
  const { changeSubscription, subscriptionChangePending } = useUserSubscription({
    category: GDPRCategoryEnum.Taxes,
    type: GDPRTypeEnum.FormalCommunication,
  })

  return (
    <AnnouncementBlock
      announcementContent={content}
      imageSrc={BannerTax}
      buttons={[
        {
          // TODO: Translations
          children: 'Zmeniť spôsob doručovania dane',
          onPress: onDeliveryMethodChange,
          variant: 'black-solid',
        },
        {
          // TODO: Translations
          children: 'Ponechať doručovanie dane poštou',
          onPress: () => {
            changeSubscription(false)
          },
          variant: 'black-outline',
          isLoading: subscriptionChangePending,
        },
      ]}
    />
  )
}

export default TaxesFeesDeliveryMethodBanner
