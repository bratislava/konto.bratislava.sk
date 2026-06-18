import { FaqSectionFragment } from '@/src/clients/graphql-strapi/api'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import SectionHeader from '@/src/components/layouts/SectionHeader'
import FaqsGroup from '@/src/components/segments/FaqsGroup/FaqsGroup'
import { isDefined } from '@/src/frontend/utils/general'

type FaqsSectionProps = {
  section: FaqSectionFragment
}

const FaqsSection = ({ section }: FaqsSectionProps) => {
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
