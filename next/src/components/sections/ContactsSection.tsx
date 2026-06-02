import { ContactsFragment } from '@/src/clients/graphql-strapi/api'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import Contacts from '@/src/components/page-contents/Contacts/Contacts'

type ContactsProps = {
  section: ContactsFragment
}

const Contacts = ({ section }: ContactsProps) => {
  return (
    <SectionContainer>
      <Contacts section={section} />
    </SectionContainer>
  )
}

export default Contacts
