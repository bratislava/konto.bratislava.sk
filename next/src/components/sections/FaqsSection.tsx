import { FaqSectionFragment } from '@/src/clients/graphql-strapi/api'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import SectionHeader from '@/src/components/layouts/SectionHeader'
import FaqsGroup from '@/src/components/segments/FaqsGroup/FaqsGroup'
import { isDefined } from '@/src/frontend/utils/general'

type Props = {
  section: FaqSectionFragment
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=16846-52391&t=aBqs3sK8a9uFmnaX-4
 */

const FaqsSection = ({ section }: Props) => {
  return (
    <SectionContainer>
      <div className="flex flex-col gap-6">
        <SectionHeader title={section.title} titleLevel="h2" />

        <FaqsGroup faqs={section.questions.filter(isDefined)} />
      </div>
    </SectionContainer>
  )
}

export default FaqsSection
