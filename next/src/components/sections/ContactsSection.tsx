import { ContactsSectionFragment } from '@/src/clients/graphql-strapi/api'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import Contacts from '@/src/components/page-contents/Contacts/Contacts'

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
