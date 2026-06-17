import { FaqSectionFragment } from '@/src/clients/graphql-strapi/api'
import FAQ from '@/src/components/common/FAQ/FAQ'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import { isDefined } from '@/src/frontend/utils/general'

type FAQSectionProps = {
  section: FaqSectionFragment
}

const FAQSection = ({ section }: FAQSectionProps) => {
  return (
    <SectionContainer>
      <FAQ title={section.title} faqs={section.questions.filter(isDefined)} />
    </SectionContainer>
  )
}

export default FAQSection
