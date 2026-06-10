import Towing, { TowingSectionProps } from "@/src/components/common/Towing/Towing"
import SectionContainer from "@/src/components/layouts/SectionContainer"

const TowingSection = ({ title, description }: TowingSectionProps) => {
  return (
    <SectionContainer>
      <Towing title={title} description={description} />
    </SectionContainer>
  )
}

export default TowingSection
