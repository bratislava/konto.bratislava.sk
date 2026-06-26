import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { useState } from 'react'
import { Fragment } from 'react/jsx-runtime'

import { DocumentsSectionFragment } from '@/src/clients/graphql-strapi/api'
import ExternalDocumentRowCard from '@/src/components/common/Documents/ExternalDocumentRowCard'
import Icon from '@/src/components/icon-components/Icon'
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
  const [showAllDocuments, setShowAllDocuments] = useState(false)
  const { t } = useTranslation('account')
  const filteredExternalDocuments = externalDocuments?.filter(isDefined) ?? []

  return (
    <SectionContainer>
      <div className="flex flex-col gap-6">
        <SectionHeader title={title} text={text} />

        <ul className="flex flex-col rounded-lg border border-border-active-default bg-background-passive-base py-2">
          {filteredExternalDocuments
            .slice(0, showAllDocuments ? filteredExternalDocuments.length : 5)
            .map((externalDocument, index) => (
              <Fragment key={index}>
                {index > 0 && <HorizontalDivider asListItem className="mx-6" />}

                <ExternalDocumentRowCard
                  title={externalDocument?.title}
                  url={externalDocument.url}
                />
              </Fragment>
            ))}
          {filteredExternalDocuments?.length > 5 && (
            <>
              {<HorizontalDivider asListItem className="mx-6" />}

              <li className="flex items-center justify-center gap-2 py-3">
                <Button
                  fullWidth
                  className="mx-6 py-2"
                  variant="plain"
                  onClick={() => setShowAllDocuments(!showAllDocuments)}
                >
                  <Typography variant="button-large">
                    {showAllDocuments
                      ? t('documentSection.documents.showLess')
                      : t('documentSection.documents.showMore', {
                          count: filteredExternalDocuments?.length,
                        })}
                  </Typography>

                  <Icon
                    name={showAllDocuments ? 'chevron-up' : 'chevron-down'}
                    className="size-6"
                  />
                </Button>
              </li>
            </>
          )}
        </ul>
      </div>
    </SectionContainer>
  )
}

export default DocumentsSection
