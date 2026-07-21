import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import { MunicipalServiceEntityFragment } from '@/src/clients/graphql-strapi/api'
import TableOfContents from '@/src/components/common/TableOfContents/TableOfContents'
import Markdown from '@/src/components/formatting/Markdown'
import { ClientLandingPageFormDefinition } from '@/src/components/forms/clientFormDefinitions'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import Sections from '@/src/components/layouts/Sections'
import FormLandingPageCtaCard from '@/src/components/page-contents/FormLandingPageContent/FormCta/FormLandingPageCtaCard'
import FormLandingPageCard from '@/src/components/segments/FormLandingPageCard/FormLandingPageCard'
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
  const { t } = useTranslation('forms')
  const { sections, form: strapiForm, pageHeaderText, moreInformationUrl } = municipalService

  const filteredSections = sections?.filter(isDefined) ?? []

  return (
    <>
      {/* Header */}
      <SectionContainer className="size-full bg-background-passive-primary py-6 lg:min-h-[120px] lg:py-12">
        <div className="flex flex-col gap-2 lg:gap-4">
          <Typography variant="h1">{municipalService.title}</Typography>
          {pageHeaderText ? <Typography>{pageHeaderText}</Typography> : null}
          {moreInformationUrl ? (
            // TODO size
            <Button variant="link" size="small" className="w-max" href={moreInformationUrl}>
              {t('form_header.services_link')}
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
        <div
          className={cn(
            'flex flex-col gap-12',
            'w-full max-w-200',
            '**:data-section-container-outer:not-first:pt-8',
            '**:data-section-container-outer:not-first:lg:pt-12',
            // In sidebar layout, horizontal padding is handled by parent wrapper (otherwise it is handled by sections)
            '**:data-section-container-inner:px-0',
            '**:data-section-container-inner:lg:px-0',
          )}
        >
          {/* TODO: Temporarily showing landing page from form, until sections are gradually migrated to municipal services. */}
          {filteredSections.length ? (
            <Sections sections={filteredSections} />
          ) : strapiForm?.landingPage?.text ? (
            <SectionContainer>
              <Markdown content={strapiForm.landingPage.text} />
            </SectionContainer>
          ) : null}

          {/* TODO: Temporarily rendering CTA cards from from (links and form CTA), until implement in municipal services. */}
          {strapiForm?.landingPage ? (
            <div className="flex flex-col rounded-xl border empty:hidden">
              {strapiForm.landingPage.linkCtas?.filter(isDefined).map((linkCta) => (
                <FormLandingPageCard key={linkCta.id} {...linkCta} />
              ))}
              {formDefinition && strapiForm.landingPage.formCta ? (
                <FormLandingPageCtaCard
                  formCta={strapiForm.landingPage.formCta}
                  formDefinition={formDefinition}
                />
              ) : null}
            </div>
          ) : null}
        </div>

        <aside className="w-full lg:w-80 lg:shrink-0">
          <TableOfContents />
        </aside>
      </div>
    </>
  )
}

export default MunicipalServicePageContent
