import BannerTax from '@assets/images/banner-dane.png'
import React from 'react'

import AnnouncementBlock from '../IntroSection/Announcements/AnnouncementBlock'

const content = `## Ušetrite cestu na poštu a chráňte životné prostredie

Zmeňte si spôsob doručovania miestnych daní a poplatkov 
a plaťte cez Bratislavské konto. Vďaka zmene zákona môžete dostávať a platiť dane a poplatky už len elektronicky.`

// TODO Implement
const TaxesFeesDeliveryMethodBanner = () => {
  return (
    <AnnouncementBlock
      announcementContent={content}
      buttonTitle="Zmeniť spôsob doručovania dane"
      imagePath={BannerTax}
      buttons={[
        {
          title: 'Zmeniť spôsob doručovania dane',
          onPress: () => {
            console.log('Zmeniť spôsob doručovania dane')
          },
          variant: 'black-solid',
        },
        {
          title: 'Ponechať doručovanie dane poštou',
          onPress: () => {
            console.log('Zistiť viac')
          },
          variant: 'black-outline',
        },
      ]}
    />
  )
}

export default TaxesFeesDeliveryMethodBanner
