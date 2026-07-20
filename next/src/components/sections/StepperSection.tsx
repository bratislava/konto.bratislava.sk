import { StepperSectionFragment } from '@/src/clients/graphql-strapi/api'
import { Stepper } from '@/src/components/common/Stepper/Stepper'
import SectionContainer from '@/src/components/layouts/SectionContainer'

type Props = {
  section: StepperSectionFragment
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=25144-21147&t=aBqs3sK8a9uFmnaX-4
 */

const StepperSection = ({ section }: Props) => {
  return (
    <SectionContainer>
      <Stepper section={section} />
    </SectionContainer>
  )
}

export default StepperSection
