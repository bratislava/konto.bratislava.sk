import { ButtonProps } from '@bratislava/component-library'

import { HomepageAnnouncementEntityFragment } from '@/src/clients/graphql-strapi/api'
import AnnouncementBlock from '@/src/components/segments/Announcements/AnnouncementBlock'
import { getLinkProps } from '@/src/utils/getLinkProps'

type AnnouncementBlockStrapiProps = {
  announcement: HomepageAnnouncementEntityFragment
  reversed: boolean
}

const AnnouncementBlockStrapi = ({ announcement, reversed }: AnnouncementBlockStrapiProps) => {
  const { title, description, primaryButton, buttonText, href, image } = announcement

  const announcementContent = [`### ${title}`, description].join('\n\n')

  // TODO Keep only primaryButton after we migrate field values
  const primaryButtonProps = (
    primaryButton
      ? {
          variant: 'solid',
          ...getLinkProps(primaryButton),
        }
      : {
          variant: 'solid',
          children: buttonText,
          href,
        }
  ) satisfies ButtonProps

  return (
    <AnnouncementBlock
      announcementContent={announcementContent}
      imageSrc={image.url}
      buttons={[primaryButtonProps]}
      reversed={reversed}
      reversedMobile
    />
  )
}

export default AnnouncementBlockStrapi
