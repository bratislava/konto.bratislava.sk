import { RichTextSectionFragment } from '@/src/clients/graphql-strapi/api'
import Markdown from '@/src/components/formatting/Markdown'
import SectionContainer from '@/src/components/layouts/SectionContainer'

type NarrowTextSectionProps = {
  section: RichTextSectionFragment
}

/**
 * TODO Figma link
 */

const NarrowTextSection = ({ section }: NarrowTextSectionProps) => {
  if (!section.content) {
    return null
  }

  return (
    <SectionContainer>
      <Markdown variant="default" content={section.content} />
    </SectionContainer>
  )
}

export default NarrowTextSection
