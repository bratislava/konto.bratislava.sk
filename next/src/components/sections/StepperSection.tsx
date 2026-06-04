import { StepperSectionFragment } from '@/src/clients/graphql-strapi/api'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import { Stepper } from '@/src/components/page-contents/Stepper/Stepper'

type StepperProps = {
  section: StepperSectionFragment
}

export const StepperSection = ({ section }: StepperProps) => {
  return (
    <SectionContainer>
      <Stepper section={section} />
    </SectionContainer>
  )
}
