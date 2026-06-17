import { ButtonAnchorProps } from '@bratislava/component-library'

import { HomepageAnnouncementEntityFragment } from '@/src/clients/graphql-strapi/api'
import Icon from '@/src/components/icon-components/Icon'
import AnnouncementBlock from '@/src/components/segments/Announcements/AnnouncementBlock'

type AnnouncementBlockStrapiProps = {
  announcement: HomepageAnnouncementEntityFragment
  reversed: boolean
}

const AnnouncementBlockStrapi = ({ announcement, reversed }: AnnouncementBlockStrapiProps) => {
  const { title, description, buttonText, href, image } = announcement

  const announcementContent = [`### ${title}`, description].join('\n\n')

  const buttons: ButtonAnchorProps[] = [
    {
      children: buttonText,
      href,
      variant: 'solid',
      endIcon: <Icon name="arrow-right" className="size-6" />,
    },
  ]

  return (
    <AnnouncementBlock
      announcementContent={announcementContent}
      imageSrc={image.url}
      buttons={buttons}
      reversed={reversed}
      reversedMobile
    />
  )
}

export default AnnouncementBlockStrapi
