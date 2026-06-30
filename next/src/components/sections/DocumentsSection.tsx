import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { useState } from 'react'
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

const AMOUNT_OF_DOCUMENTS_TO_SHOW = 5

const DocumentsSection = ({
  section: { title, text, externalDocuments },
}: DocumentsSectionProps) => {
  const { t } = useTranslation('account')
  const [showAllDocuments, setShowAllDocuments] = useState(false)
  const filteredExternalDocuments = externalDocuments?.filter(isDefined) ?? []

  return (
    <SectionContainer>
      <div className="flex flex-col gap-6">
        <SectionHeader title={title} text={text} />

        <ul className="flex flex-col rounded-lg border border-border-active-default bg-background-passive-base py-2">
          {filteredExternalDocuments
            .slice(
              0,
              showAllDocuments ? filteredExternalDocuments.length : AMOUNT_OF_DOCUMENTS_TO_SHOW,
            )
            .map((externalDocument, index) => (
              <Fragment key={index}>
                {index > 0 && <HorizontalDivider asListItem className="mx-6" />}

                <ExternalDocumentRowCard
                  title={externalDocument.title}
                  url={externalDocument.url}
                />
              </Fragment>
            ))}
        </ul>

        {filteredExternalDocuments.length > AMOUNT_OF_DOCUMENTS_TO_SHOW && (
          <>
            <HorizontalDivider asListItem className="mx-6" />

            <div className="flex items-center justify-center py-3">
              <Button
                fullWidth
                className="mx-6 py-2"
                variant="plain"
                onClick={() => setShowAllDocuments(!showAllDocuments)}
                endIcon={showAllDocuments ? 'chevron-up' : 'chevron-down'}
              >
                {showAllDocuments
                  ? t('DocumentsSection.documents.showLess')
                  : t('DocumentsSection.documents.showMore', {
                      count: filteredExternalDocuments.length,
                    })}
              </Button>
            </div>
          </>
        )}
      </div>
    </SectionContainer>
  )
}

export default DocumentsSection
