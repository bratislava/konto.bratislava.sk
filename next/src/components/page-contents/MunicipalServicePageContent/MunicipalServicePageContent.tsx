import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import { MunicipalServiceEntityFragment } from '@/src/clients/graphql-strapi/api'
import { TABLE_OF_CONTENTS_STICKY_TOP } from '@/src/components/common/TableOfContents/MobileTableOfContents'
import TableOfContents from '@/src/components/common/TableOfContents/TableOfContents'
import { ClientLandingPageFormDefinition } from '@/src/components/forms/clientFormDefinitions'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import Sections from '@/src/components/layouts/Sections'
import MunicipalServiceCtas from '@/src/components/page-contents/MunicipalServicePageContent/MunicipalServiceCtas'
import TemporarilyDisabledAlert from '@/src/components/segments/TemporarilyDisabledAlert/TemporarilyDisabledAlert'
import { isDefined } from '@/src/frontend/utils/general'
import cn from '@/src/utils/cn'

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=14475-7297
 */

export type MunicipalServicePageContentProps = {
  municipalService: MunicipalServiceEntityFragment
  formDefinition?: ClientLandingPageFormDefinition
}

const MunicipalServicePageContent = ({
  municipalService,
  formDefinition,
}: MunicipalServicePageContentProps) => {
  const { t } = useTranslation()

  const { sections, form: strapiForm, pageHeaderText, moreInformationUrl } = municipalService

  const filteredSections = sections?.filter(isDefined) ?? []
  const shouldShowCtaButtons =
    !!formDefinition || !!municipalService.links?.filter(isDefined).length

  return (
    <>
      {/* Header */}
      <SectionContainer className="size-full bg-background-passive-primary py-6 lg:min-h-[120px] lg:py-12">
        <div className="flex flex-col gap-2 lg:gap-4">
          <Typography variant="h1">{municipalService.title}</Typography>
          {pageHeaderText ? <Typography>{pageHeaderText}</Typography> : null}
          {moreInformationUrl ? (
            <Button
              variant="link"
              className="w-max"
              href={moreInformationUrl}
              // We append service name to the link text to give user more context when using screen reader
              aria-label={t('FormHeader.servicesLink.ariaLabel', {
                serviceName: municipalService.title,
              })}
            >
              {t('FormHeader.servicesLink')}
            </Button>
          ) : null}
        </div>
      </SectionContainer>

      {/* Sections & Sidebar */}
      <div
        key={municipalService.slug} // Helps to re-render table of contents on page change
        className={cn(
          'mx-auto flex w-full max-w-(--breakpoint-xl) flex-wrap-reverse gap-8 px-4 py-8 lg:px-8 lg:py-12',
        )}
      >
        <div className="flex w-full max-w-200 flex-col gap-12">
          <TemporarilyDisabledAlert strapiForm={strapiForm} variant="landingPage" />

          <div
            className={cn(
              'flex flex-col gap-12',
              '**:data-section-container-outer:not-first:pt-8',
              '**:data-section-container-outer:not-first:lg:pt-12',
              // In sidebar layout, horizontal padding is handled by parent wrapper (otherwise it is handled by sections)
              '**:data-section-container-inner:px-0',
              '**:data-section-container-inner:lg:px-0',
            )}
          >
            {filteredSections.length ? <Sections sections={filteredSections} /> : null}
          </div>
        </div>

        {/* On small screens the table of contents sticks below the navbar, so the aside has to be the
        sticky element itself - inside it the table of contents would have no room to move. */}
        <aside
          className="w-full max-lg:sticky max-lg:z-20 lg:w-80 lg:shrink-0"
          style={{ top: TABLE_OF_CONTENTS_STICKY_TOP }}
        >
          <TableOfContents
            footerComponent={
              shouldShowCtaButtons ? (
                <MunicipalServiceCtas
                  municipalService={municipalService}
                  formDefinition={formDefinition}
                />
              ) : null
            }
          />
        </aside>
      </div>
    </>
  )
}

export default MunicipalServicePageContent
