import { ContactsSectionFragment } from '@/src/clients/graphql-strapi/api'
import Contacts from '@/src/components/common/Contacts/Contacts'
import SectionContainer from '@/src/components/layouts/SectionContainer'

type Props = {
  section: ContactsSectionFragment
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19108-18946&t=aBqs3sK8a9uFmnaX-4
 */

const ContactsSection = ({ section }: Props) => {
  return (
    <SectionContainer>
      <Contacts section={section} />
    </SectionContainer>
  )
}

export default ContactsSection
