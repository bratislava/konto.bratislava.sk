import { ArrowRightIcon } from '@assets/ui-icons'
import { HomepageAnnouncementEntityFragment } from '@clients/graphql-strapi/api'

import { AnchorProps } from '../../../../simple-components/ButtonNew'
import AnnouncementBlock from './AnnouncementBlock'

type AnnouncementBlockStrapiProps = {
  announcement: HomepageAnnouncementEntityFragment
  reversed: boolean
}

const AnnouncementBlockStrapi = ({ announcement, reversed }: AnnouncementBlockStrapiProps) => {
  if (!announcement.attributes) {
    return null
  }

  const { title, description, buttonText, href, image } = announcement.attributes

  const announcementContent = `## ${title}

${description}`

  const buttons: AnchorProps[] = [
    {
      children: buttonText,
      href,
      variant: 'category-solid',
      endIcon: <ArrowRightIcon className="size-6" />,
    },
  ]

  const imageProps = image.data?.attributes
    ? {
        src: image.data.attributes.url,
        alt: image.data.attributes.alternativeText ?? '',
      }
    : undefined

  return (
    <AnnouncementBlock
      announcementContent={announcementContent}
      image={imageProps}
      buttons={buttons}
      reversed={reversed}
    />
  )
}

export default AnnouncementBlockStrapi
