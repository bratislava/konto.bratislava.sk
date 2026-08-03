import { StepperSectionFragment } from '@/src/clients/graphql-strapi/api'
import StepByStep from '@/src/components/common/StepByStep/StepByStep'
import SectionContainer from '@/src/components/layouts/SectionContainer'

type Props = {
  section: StepperSectionFragment
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=25144-21147&t=aBqs3sK8a9uFmnaX-4
 */

const StepByStepSection = ({ section }: Props) => {
  return (
    <SectionContainer>
      <StepByStep section={section} />
    </SectionContainer>
  )
}

export default StepByStepSection
