import { StepperSectionFragment } from '@/src/clients/graphql-strapi/api'
import { Stepper } from '@/src/components/common/Stepper/Stepper'
import SectionContainer from '@/src/components/layouts/SectionContainer'

type StepperProps = {
  section: StepperSectionFragment
}

const StepperSection = ({ section }: StepperProps) => {
  return (
    <SectionContainer>
      <Stepper section={section} />
    </SectionContainer>
  )
}

export default StepperSection
