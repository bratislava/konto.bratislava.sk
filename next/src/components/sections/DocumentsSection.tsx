import { DocumentsSectionFragment } from '@/src/clients/graphql-strapi/api'
import LinkRowCard from '@/src/components/common/Documents/LinkRowCard'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import SectionHeader from '@/src/components/layouts/SectionHeader'

type DocumentsSectionProps = {
  section: DocumentsSectionFragment
}

const DocumentsSection = ({
  section: { title, text, externalDocuments },
}: DocumentsSectionProps) => {
  return (
    <SectionContainer>
      <div className="flex flex-col gap-6">
        <SectionHeader title={title ?? ''} text={text ?? ''} />

        <ul className="flex flex-col rounded-lg border border-border-active-default py-2">
          {externalDocuments?.map((externalDocument, index) => (
            <LinkRowCard
              key={externalDocument?.title}
              title={externalDocument?.title ?? ''}
              url={externalDocument?.url ?? ''}
              isLastItem={index === externalDocuments.length - 1}
            />
          ))}
        </ul>
      </div>
    </SectionContainer>
  )
}

export default DocumentsSection
