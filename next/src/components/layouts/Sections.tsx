import { FormLandingPageSectionsFragment } from '@/src/clients/graphql-strapi/api'
import ContactsSection from '@/src/components/sections/ContactsSection'
import RichtextSection from '@/src/components/sections/RichtextSection'

/**
 * Based on Bratislava.sk: https://github.com/bratislava/bratislava.sk/blob/be7785e45d5e61c9b2a23177b9dcfb8af109ebc6/next/src/components/layouts/Sections.tsx
 */

type SectionsProps = {
  sections: FormLandingPageSectionsFragment[]
}

const SectionContent = ({ section }: { section: SectionsProps['sections'][number] }) => {
  switch (section.__typename) {
    case 'ComponentSectionsRichtext':
      return <RichtextSection section={section} />

    case 'ComponentSectionsContacts':
      return <ContactsSection section={section} />

    default:
      return null
  }
}

const Sections = ({ sections }: SectionsProps) => {
  return (
    <>
      {sections.map((section, index) => (
        <SectionContent key={index} section={section} />
      ))}
    </>
  )
}

export default Sections
