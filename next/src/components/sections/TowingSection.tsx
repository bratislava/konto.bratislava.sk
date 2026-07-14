import { TowingSectionFragment } from '@/src/clients/graphql-strapi/api'
import Towing from '@/src/components/common/Towing/Towing'
import SectionContainer from '@/src/components/layouts/SectionContainer'

type Props = {
  section: TowingSectionFragment
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=26046-21106&t=aBqs3sK8a9uFmnaX-4
 */

const TowingSection = ({ section }: Props) => {
  return (
    <SectionContainer>
      <Towing title={section.title} text={section.text} />
    </SectionContainer>
  )
}

export default TowingSection
