import { TowingSectionFragment } from "@/src/clients/graphql-strapi/api"
import Towing from "@/src/components/common/Towing/Towing"
import SectionContainer from "@/src/components/layouts/SectionContainer"

type TowingSectionProps = {
  section: TowingSectionFragment
}

const TowingSection = ({ section }: TowingSectionProps) => {
  return (
    <SectionContainer>
      <Towing title={section.Title ?? ''} description={section.description ?? ''} />
    </SectionContainer>
  )
}

export default TowingSection
