import { ButtonProps } from '@bratislava/component-library'

import { HomepageAnnouncementEntityFragment } from '@/src/clients/graphql-strapi/api'
import AnnouncementBlock from '@/src/components/segments/Announcements/AnnouncementBlock'
import { isDefined } from '@/src/frontend/utils/general'
import { getLinkProps } from '@/src/utils/getLinkProps'

type Props = {
  announcement: HomepageAnnouncementEntityFragment
  reversed: boolean
}

const AnnouncementBlockStrapi = ({ announcement, reversed }: Props) => {
  const { title, description, primaryButton, image } = announcement

  const announcementContent = [`### ${title}`, description].join('\n\n')

  const buttons: ButtonProps[] = [
    primaryButton
      ? ({
          variant: 'solid',
          ...getLinkProps(primaryButton),
        } as const)
      : null,
  ].filter(isDefined)

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
