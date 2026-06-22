import { Fragment } from 'react/jsx-runtime'

import { DocumentsSectionFragment } from '@/src/clients/graphql-strapi/api'
import ExternalDocumentRowCard from '@/src/components/common/Documents/ExternalDocumentRowCard'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import SectionHeader from '@/src/components/layouts/SectionHeader'
import HorizontalDivider from '@/src/components/simple-components/HorizontalDivider'
import { isDefined } from '@/src/frontend/utils/general'

type DocumentsSectionProps = {
  section: DocumentsSectionFragment
}

const DocumentsSection = ({
  section: { title, text, externalDocuments },
}: DocumentsSectionProps) => {
  const filteredExternalDocuments = externalDocuments?.filter(isDefined) ?? []

  return (
    <SectionContainer>
      <div className="flex flex-col gap-6">
        <SectionHeader title={title} text={text} />

        <ul className="flex flex-col rounded-lg border border-border-active-default py-2">
          {filteredExternalDocuments.map((externalDocument, index) => (
            <Fragment key={index}>
              {index > 0 && (
                <HorizontalDivider
                  asListItem
                  className="mx-6 border-b border-border-active-default"
                />
              )}

              <ExternalDocumentRowCard
                key={externalDocument?.title}
                title={externalDocument?.title}
                url={externalDocument.url}
              />
            </Fragment>
          ))}
        </ul>
      </div>
    </SectionContainer>
  )
}

export default DocumentsSection
