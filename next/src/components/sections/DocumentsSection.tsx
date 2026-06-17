import { DocumentsSectionFragment } from '@/src/clients/graphql-strapi/api'
import Documents from '@/src/components/common/Documents/Documents'
import SectionContainer from '@/src/components/layouts/SectionContainer'

type DocumentsSectionProps = {
  section: DocumentsSectionFragment
}

const DocumentsSection = ({ section }: DocumentsSectionProps) => {
  return (
    <SectionContainer>
      <Documents
        title={section.title ?? ''}
        description={section.description ?? ''}
        files={section.files ?? []}
      />
    </SectionContainer>
  )
}

export default DocumentsSection
