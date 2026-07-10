import { ContactsSectionFragment } from '@/src/clients/graphql-strapi/api'
import Contacts from '@/src/components/common/Contacts/Contacts'
import SectionContainer from '@/src/components/layouts/SectionContainer'

type ContactsProps = {
  section: ContactsSectionFragment
}

const ContactsSection = ({ section }: ContactsProps) => {
  return (
    <SectionContainer>
      <Contacts section={section} />
    </SectionContainer>
  )
}

export default ContactsSection
