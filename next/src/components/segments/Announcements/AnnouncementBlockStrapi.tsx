import { ButtonAnchorProps } from '@bratislava/component-library'

import { ArrowRightIcon } from '@/src/assets/ui-icons'
import { HomepageAnnouncementEntityFragment } from '@/src/clients/graphql-strapi/api'
import AnnouncementBlock from '@/src/components/segments/Announcements/AnnouncementBlock'

type AnnouncementBlockStrapiProps = {
  announcement: HomepageAnnouncementEntityFragment
  reversed: boolean
}

const AnnouncementBlockStrapi = ({ announcement, reversed }: AnnouncementBlockStrapiProps) => {
  if (!announcement.attributes) {
    return null
  }

  const { title, description, buttonText, href, image } = announcement.attributes

  const announcementContent = [`### ${title}`, description].join('\n\n')

  const buttons: ButtonAnchorProps[] = [
    {
      children: buttonText,
      href,
      variant: 'solid',
      endIcon: <ArrowRightIcon className="size-6" />,
    },
  ]

  return (
    <AnnouncementBlock
      announcementContent={announcementContent}
      imageSrc={image?.data?.attributes?.url}
      buttons={buttons}
      reversed={reversed}
      reversedMobile
    />
  )
}

export default AnnouncementBlockStrapi
