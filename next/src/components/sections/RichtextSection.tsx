import { RichtextSectionFragment } from '@/src/clients/graphql-strapi/api'
import Markdown from '@/src/components/formatting/Markdown'
import SectionContainer from '@/src/components/layouts/SectionContainer'

type Props = {
  section: RichtextSectionFragment
}

/**
 * Figma: TODO
 */

const RichtextSection = ({ section }: Props) => {
  if (!section.content) {
    return null
  }

  return (
    <SectionContainer>
      <Markdown variant="default" content={section.content} />
    </SectionContainer>
  )
}

export default RichtextSection
